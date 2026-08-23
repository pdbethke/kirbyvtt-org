// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
//
// Statically-checkable coverage for the notify form's Turnstile wiring.
//
// `npm run preview` (what test:e2e runs against) serves the static build
// only — it does not execute Cloudflare Pages Functions and has no D1
// binding. So the actual server-side path (functions/subscribe.ts: honeypot
// check, siteverify call, the D1 insert, the LIST_ENDPOINT forwarding seam)
// is NOT exercised by this suite and cannot be, short of a real deployment
// or `wrangler pages dev` with a bound D1 database. What IS checked here,
// against the built markup, is everything a bot skipping the widget's own
// script would still have to get past, and everything a broken deploy could
// silently regress: the form posts to the real endpoint, the widget with
// the correct site key is present, and the honeypot geometry survived.
import { test, expect } from '@playwright/test';
import { pageText, routeFor } from './dist-helpers';

const TURNSTILE_SITE_KEY = '0x4AAAAAAEZesQat8_1YAStk';

function indexHtml(): string {
  const page = pageText().find(({ path }) => routeFor(path) === '/');
  if (!page) throw new Error('could not find the built index page (route "/")');
  return page.html;
}

test('the notify form posts to /subscribe, not the old no-op action', () => {
  const html = indexHtml();
  const formMatch = /<form\b[^>]*data-notify[^>]*>/i.exec(html);
  expect(formMatch, 'no <form data-notify> found in the built index page').toBeTruthy();
  const formTag = formMatch![0];
  const actionMatch = /action=["']([^"']*)["']/i.exec(formTag);
  expect(actionMatch, `<form data-notify> has no action attribute: ${formTag}`).toBeTruthy();
  expect(actionMatch![1]).toBe('/subscribe');
});

test('the Turnstile widget is present with the provisioned site key', () => {
  const html = indexHtml();
  const widgetMatch = /<div\b[^>]*class=["'][^"']*\bcf-turnstile\b[^"']*["'][^>]*>/i.exec(html);
  expect(widgetMatch, 'no element with class "cf-turnstile" found').toBeTruthy();
  const widgetTag = widgetMatch![0];
  const siteKeyMatch = /data-sitekey=["']([^"']*)["']/i.exec(widgetTag);
  expect(siteKeyMatch, `cf-turnstile element has no data-sitekey: ${widgetTag}`).toBeTruthy();
  expect(siteKeyMatch![1]).toBe(TURNSTILE_SITE_KEY);
});

test('the Turnstile script loads from the real challenges.cloudflare.com endpoint', () => {
  const html = indexHtml();
  expect(html).toContain('https://challenges.cloudflare.com/turnstile/v0/api.js');
});

test('the honeypot field is still present, named "website", and off-screen', async ({ page }) => {
  // A geometry assertion, not a visibility-API one: `not.toBeInViewport()`
  // was tried here before and shipped green even when the field was made
  // fully visible on-screen, because that assertion also passes for
  // anything below the fold — it inspects scroll position, not whether the
  // field is actually hidden from a sighted user. This instead reads the
  // field's own bounding box and the page's viewport, and requires the box
  // to fall entirely outside the viewport on every side — a field moved
  // on-screen anywhere in the visible area fails this, fold or no fold.
  await page.goto('/');
  const input = page.locator('#website[name="website"]');
  await expect(input).toHaveCount(1);
  const box = await input.boundingBox();
  expect(box, 'honeypot input has no bounding box (display:none or detached)').toBeTruthy();
  const viewport = page.viewportSize();
  expect(viewport, 'no viewport size available').toBeTruthy();
  const offScreen =
    box!.x + box!.width <= 0 ||
    box!.y + box!.height <= 0 ||
    box!.x >= viewport!.width ||
    box!.y >= viewport!.height;
  expect(offScreen, `honeypot bounding box overlaps the viewport: ${JSON.stringify(box)}`).toBe(true);
});
