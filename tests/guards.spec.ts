// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every built HTML file, so a rule cannot be dodged by adding a page. */
function builtPages(dir = 'dist', out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) builtPages(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

const pageText = () =>
  builtPages().map((p) => ({ path: p, html: readFileSync(p, 'utf8') }));

test('the site never says "open source"', () => {
  // Everything is PolyForm Noncommercial — source-available, NOT OSI-approved.
  // The noncommercial status is load-bearing in the Hero Games position.
  const offenders = pageText()
    .filter(({ html }) => /open[\s-]?source/i.test(html))
    .map(({ path }) => path);
  expect(offenders, `"open source" appears in: ${offenders.join(', ')}`).toEqual([]);
});

test('the site never claims to replace Hero Designer', () => {
  const banned = /\b(replaces?|replacement for|instead of|substitute for)\s+(hero\s+designer|HD)\b/i;
  const offenders = pageText()
    .filter(({ html }) => banned.test(html))
    .map(({ path }) => path);
  expect(offenders, `replacement language in: ${offenders.join(', ')}`).toEqual([]);
});

test('no pricing or crowdfunding language ships at launch', () => {
  const banned = /\b(kickstarter|crowdfund\w*|per month|\/mo\b|pricing|subscribe now|back(ers?|ing) tier)\b/i;
  const offenders = pageText()
    .filter(({ html }) => banned.test(html))
    .map(({ path }) => path);
  expect(offenders, `commercial language in: ${offenders.join(', ')}`).toEqual([]);
});

test('every page declares no affiliation with Hero Games', async ({ page }) => {
  for (const path of ['/', '/mobius-box/']) {
    await page.goto(path);
    await expect(page.locator('footer')).toContainText('Not affiliated with or endorsed by');
    await expect(page.locator('footer')).toContainText('DOJ, Inc.');
  }
});

test('zero external network requests across the site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      external.push(req.url());
    }
  });
  for (const path of ['/', '/mobius-box/', '/docs/kirby-cost/']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  expect(external, `unexpected external requests: ${external.join(', ')}`).toHaveLength(0);
});

test('no external font or script hosts appear in the markup', () => {
  const banned = /(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr|unpkg\.com|cdnjs)/i;
  const offenders = pageText()
    .filter(({ html }) => banned.test(html))
    .map(({ path }) => path);
  expect(offenders, `external host referenced in: ${offenders.join(', ')}`).toEqual([]);
});
