// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
//
// The notify form must never navigate the visitor to a JSON document.
//
// It did, in production, on 2026-08-25: `<form data-notify method="post"
// action="/subscribe">` is a NATIVE form post, nothing in the page ever
// intercepted it, and functions/subscribe.ts answers every path with
// `jsonResponse(...)`. So the browser did what browsers do -- it navigated
// to the response and rendered `{"ok":true}` on screen. The signup itself
// was saved correctly; only the visitor's experience was broken.
//
// These are BEHAVIOURAL tests. tests/subscribe-wiring.spec.ts checks the
// built markup and passed throughout the bug -- it asserts the form has an
// action, which is true whether or not anything handles submit. A static
// check cannot see this defect. Driving the form can.
//
// The endpoint is stubbed here because `astro preview` serves static files
// only and never runs a Pages Function (see subscribe-wiring.spec.ts). The
// stub is not a weakening: what is under test is the PAGE's behaviour given
// a response, and stubbing is the only way to pin a specific one.
import { test, expect } from '@playwright/test';

/** Answer POST /subscribe with a chosen status and body. */
async function stubSubscribe(page, status: number, body: unknown) {
  await page.route('**/subscribe', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

async function submit(page, email = 'someone@example.com') {
  await page.locator('form[data-notify] input[name="email"]').fill(email);
  await page.locator('form[data-notify] button[type="submit"]').click();
}

test('submitting does not navigate the visitor away from the page', async ({ page }) => {
  await stubSubscribe(page, 200, { ok: true });
  await page.goto('/');

  await submit(page);

  // The exact regression: the browser used to land on /subscribe showing
  // raw JSON. Give any navigation a chance to happen before asserting.
  await page.waitForTimeout(500);
  expect(new URL(page.url()).pathname, 'the form navigated away from the page').toBe('/');
  await expect(page.locator('body')).not.toContainText('{"ok":true}');
});

test('a successful signup is confirmed in the page', async ({ page }) => {
  await stubSubscribe(page, 200, { ok: true });
  await page.goto('/');

  await submit(page);

  await expect(page.locator('form[data-notify] [data-notify-status]')).toContainText(/list|thank|email/i);
});

test('a rejected signup says so in the page, and does not claim success', async ({ page }) => {
  await stubSubscribe(page, 403, { ok: false, error: 'verification failed' });
  await page.goto('/');

  await submit(page);

  const status = page.locator('form[data-notify] [data-notify-status]');
  await expect(status).toBeVisible();
  await expect(status).not.toContainText(/thank|you're on the list/i);
  expect(new URL(page.url()).pathname).toBe('/');
});

test('a non-JSON response is reported, not rendered as a broken success', async ({ page }) => {
  // What the visitor would hit if the Function were undeployed: the site's
  // own 404 HTML. Parsing that as JSON throws, and an unhandled throw would
  // leave the form silent -- looking to the visitor like nothing happened.
  await page.route('**/subscribe', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({ status: 404, contentType: 'text/html', body: '<html>404</html>' });
  });
  await page.goto('/');

  await submit(page);

  await expect(page.locator('form[data-notify] [data-notify-status]')).toBeVisible();
});

// ---------------------------------------------------------------------------
// The no-JS path's landing page must actually exist.
//
// It didn't, on the first deploy of this fix: the Function redirected a
// native form post to /subscribed/ and that page 404'd, so a visitor without
// JavaScript signed up successfully and landed on "page not found". The
// build was fine -- the page simply hadn't been built into the artifact that
// was uploaded, and nothing connected the redirect target to a real route.
//
// This reads the redirect target OUT of the Function rather than hardcoding
// it, so renaming the page without updating the Function (or the reverse)
// fails here instead of in production.
import { readFileSync } from 'node:fs';
import { builtRoutes } from './dist-helpers';

test('the redirect target in the Function is a page that actually got built', () => {
  const fn = readFileSync('functions/subscribe.ts', 'utf8');
  const match = /location:\s*['"]([^'"]+)['"]/.exec(fn);
  expect(match, 'no redirect `location:` found in functions/subscribe.ts').toBeTruthy();
  const target = match![1];
  expect(builtRoutes(), `the Function redirects to ${target}, which no built page serves`)
    .toContain(target);
});
