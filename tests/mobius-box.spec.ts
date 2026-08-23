// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';

test('the index lists posts newest first', async ({ page }) => {
  await page.goto('/mobius-box/');
  const dates = await page.locator('article time').evaluateAll((els) =>
    els.map((e) => e.getAttribute('datetime')!),
  );
  expect(dates.length).toBeGreaterThanOrEqual(3);
  const sorted = [...dates].sort().reverse();
  expect(dates).toEqual(sorted);
});

test('a post renders its title, date and body', async ({ page }) => {
  await page.goto('/mobius-box/');
  await page.locator('article a').first().click();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('time')).toBeVisible();
  await expect(page.locator('article p').first()).not.toBeEmpty();
});

test('posts keep the marketing chrome, not a docs shell', async ({ page }) => {
  await page.goto('/mobius-box/');
  await page.locator('article a').first().click();
  await expect(page.locator('header nav a[href="/mobius-box/"]')).toBeVisible();
  await expect(page.locator('footer')).toContainText('DOJ, Inc.');
});

test('drafts are not published', async ({ page }) => {
  await page.goto('/mobius-box/');
  await expect(page.locator('body')).not.toContainText('DRAFT-DO-NOT-PUBLISH');
});
