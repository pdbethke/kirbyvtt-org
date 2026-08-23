// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('the claim and the notify form are above everything else', async ({ page }) => {
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();
  const form = page.locator('form[data-notify]');
  await expect(form.locator('input[type="email"]')).toBeVisible();
  // The form is in the first section, not the footer.
  const formTop = (await form.boundingBox())!.y;
  const sectionsTop = (await page.locator('section#why').boundingBox())!.y;
  expect(formTop).toBeLessThan(sectionsTop);
});

test('the six sections are present and in order', async ({ page }) => {
  const ids = await page.locator('main section').evaluateAll((els) =>
    els.map((e) => e.id),
  );
  expect(ids).toEqual(['hero', 'why', 'today', 'yours', 'needs', 'roadmap']);
});

test('what works today names all three engines with install commands', async ({ page }) => {
  const today = page.locator('section#today');
  // "pip install" once, asserted separately from the three package names,
  // was satisfiable by deleting two of the three install blocks — the
  // package names still appear in the <h3>s regardless. Assert each
  // package's own install command instead, so losing any one of the three
  // fails this test specifically.
  for (const pkg of ['kirby-cost', 'kirby-sheet', 'kirby-combat']) {
    await expect(today).toContainText(`pip install ${pkg}`);
  }
});

test('Hero Designer is stated as a requirement, high up', async ({ page }) => {
  const needs = page.locator('section#needs');
  await expect(needs).toContainText('Hero Designer');
  await expect(needs).toContainText('your own');
  // Above the roadmap, not buried at the bottom.
  const needsTop = (await needs.boundingBox())!.y;
  const roadmapTop = (await page.locator('section#roadmap').boundingBox())!.y;
  expect(needsTop).toBeLessThan(roadmapTop);
});

test('the licence is described as source-available, not open source', async ({ page }) => {
  await expect(page.locator('main')).toContainText('source-available');
});

test('the trademark notice names DOJ, Inc.', async ({ page }) => {
  await expect(page.locator('footer')).toContainText('HERO System');
  await expect(page.locator('footer')).toContainText('DOJ, Inc.');
});

test('Foundry is credited rather than disparaged', async ({ page }) => {
  const main = page.locator('main');
  // The old negative half, `not.toContainText(/foundry is (bad|worse|inferior)/i)`,
  // could not realistically fail — no plausible edit produces that exact
  // string. Assert the specific credit the copy actually makes instead:
  // that's a claim losing the credit sentence, or replacing it with
  // something dismissive, will actually break.
  await expect(main).toContainText('Foundry VTT already has good HERO systems');
});
