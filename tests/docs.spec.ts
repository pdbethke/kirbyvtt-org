// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';

test('each engine has a docs page', async ({ page }) => {
  for (const slug of ['kirby-cost', 'kirby-sheet', 'kirby-combat']) {
    const res = await page.goto(`/docs/${slug}/`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.locator('h1')).toContainText(slug);
  }
});

test('docs is not a navigation dead end', async ({ page }) => {
  await page.goto('/docs/kirby-cost/');
  // The marketing nav is present inside the docs chrome.
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
  expect(external).toHaveLength(0);
});
