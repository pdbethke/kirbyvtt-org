// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';

test('the prose column is bounded at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  // `main` itself is centered via padding, so its own box stays full-bleed
  // by design; measure the actual rendered content instead, which is what
  // a reader's eye tracks across the line.
  const contentWidth = (await page.locator('section#why p').first().boundingBox())!.width;
  expect(contentWidth).toBeLessThan(700);
});

test('nav links are visually separated, not run together', async ({ page }) => {
  await page.goto('/');
  const boxes = await page.locator('header nav a').evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right })),
  );
  expect(boxes.length).toBeGreaterThanOrEqual(2);
  for (let i = 1; i < boxes.length; i++) {
    // Adjacent nav items must have a visible gap between them, not an
    // abutting or overlapping edge (the "MobiusBoxDocsGitHub" bug).
    expect(boxes[i].left - boxes[i - 1].right).toBeGreaterThan(4);
  }
});

test('no horizontal overflow at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
