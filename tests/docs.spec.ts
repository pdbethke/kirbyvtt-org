// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';

test('each engine has a docs page', async ({ page }) => {
  for (const slug of ['kirby-cost', 'kirby-sheet', 'kirby-combat']) {
    const res = await page.goto(`/docs/${slug}/`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.locator('h1')).toContainText(slug);
  }
});

// Starlight's sidebar (astro.config.mjs's "Site" group) already carries
// links to `/` and `/mobius-box/`, so a desktop-viewport check alone cannot
// tell the marketing nav in StarlightHeader.astro apart from the sidebar —
// both satisfy it. Below Starlight's md breakpoint the sidebar is
// `visibility: hidden` until a menu button is toggled, so that's the width
// where the Header's own nav is load-bearing; the two tests below cover
// both widths and are named so the distinction is obvious.
//
// kirby-sheet, not kirby-cost, is used here: kirby-cost sits immediately
// after "Mobius Box" in the sidebar order, so Starlight's auto-generated
// prev/next pagination footer on that page alone renders an
// `a[href="/mobius-box/"]` too — a third confounding surface. kirby-sheet's
// pagination neighbors are kirby-cost and kirby-combat, so it isn't
// confounded by the sidebar's page order.
test('the sidebar provides an escape route on desktop', async ({ page }) => {
  await page.goto('/docs/kirby-sheet/');
  await expect(page.locator('a[href="/mobius-box/"]').first()).toBeVisible();
  await page.locator('a[href="/"]').first().click();
  await expect(page.locator('section#hero')).toBeVisible();
});

test('the header provides one when the sidebar is collapsed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/kirby-sheet/');
  // Starlight's sidebar collapses behind a menu toggle below its md
  // breakpoint; the Header's marketing nav is not gated behind that toggle
  // (it carries no responsive sl-hidden/md:sl-flex classes), so it must be
  // directly visible without opening anything.
  await expect(page.locator('a[href="/mobius-box/"]').first()).toBeVisible();
  await page.locator('a[href="/"]').first().click();
  await expect(page.locator('section#hero')).toBeVisible();
});

test('search is local — no external request when searching', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') external.push(r.url());
  });
  await page.goto('/docs/kirby-cost/');
  await page.waitForLoadState('networkidle');
  // The assertion above (page load makes no external request) is already
  // covered by guards.spec.ts's site-wide request guard. What this test is
  // *named* for — searching — has to actually open Pagefind's dialog and
  // run a query, because Pagefind fetches its index and WASM lazily, on
  // first interaction, not on page load. Asserting only after that
  // interaction is what makes this test able to catch a hosted search
  // widget (e.g. Algolia DocSearch) that loads its client from a CDN only
  // when the dialog opens.
  await page.click('button[data-open-modal]');
  await page.fill('.pagefind-ui__search-input', 'cost');
  await expect(page.locator('.pagefind-ui__result')).toHaveCount(1, { timeout: 5000 });
  expect(external, `external requests during search: ${external.join(', ')}`).toHaveLength(0);
});
