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

// --- honeypot ---------------------------------------------------------------

test('the notify form carries a honeypot that no person can reach', async ({ page }) => {
  await page.goto('/');
  const hp = page.locator('form[data-notify] input[name="website"]');
  await expect(hp).toHaveCount(1);
  // Present in the DOM but not perceivable. NOT asserted with
  // `not.toBeInViewport()` — that passes for anything merely below the fold,
  // so it stayed green when the field was made visible. Assert the geometry
  // instead: the wrapper must sit outside the document, which is the actual
  // mechanism doing the hiding.
  const box = await hp.boundingBox();
  expect(box, 'honeypot should still be laid out, just off-screen').not.toBeNull();
  expect(box!.x + box!.width, `honeypot is on-screen at x=${box!.x}`).toBeLessThan(0);
  await expect(hp).toHaveAttribute('tabindex', '-1');
  await expect(hp).toHaveAttribute('autocomplete', 'off');
});

test('the honeypot is not the field a person types into', async ({ page }) => {
  await page.goto('/');
  // The real control must still be reachable and focusable.
  const email = page.locator('form[data-notify] input[type="email"]');
  await expect(email).toBeVisible();
  await email.fill('someone@example.com');
  await expect(email).toHaveValue('someone@example.com');
});
