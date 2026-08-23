// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { test, expect } from '@playwright/test';
import { builtPages, builtRoutes, pageText, renderedPageText } from './dist-helpers';

test('the site never says "open source"', () => {
  // Everything is PolyForm Noncommercial — source-available, NOT OSI-approved.
  // The noncommercial status is load-bearing in the Hero Games position.
  // Matched against rendered TEXT (tags stripped), not raw HTML, so an
  // inline element between the two words — <em>, <strong>, a line break —
  // cannot defeat the rule the way it defeats a naive HTML regex.
  const offenders = renderedPageText()
    .filter(({ text }) => /open[\s-]?source/i.test(text))
    .map(({ path }) => path);
  expect(offenders, `"open source" appears in: ${offenders.join(', ')}`).toEqual([]);
});

test('the site never claims to replace Hero Designer', () => {
  const banned = /\b(replaces?|replacement for|instead of|substitute for)\s+(hero\s+designer|HD)\b/i;
  const offenders = renderedPageText()
    .filter(({ text }) => banned.test(text))
    .map(({ path }) => path);
  expect(offenders, `replacement language in: ${offenders.join(', ')}`).toEqual([]);
});

test('no pricing or crowdfunding language ships at launch', () => {
  const banned = /\b(kickstarter|crowdfund\w*|per month|\/mo\b|pricing|subscribe now|back(ers?|ing) tier)\b/i;
  const offenders = renderedPageText()
    .filter(({ text }) => banned.test(text))
    .map(({ path }) => path);
  expect(offenders, `commercial language in: ${offenders.join(', ')}`).toEqual([]);
});

test('every page declares no affiliation with Hero Games', () => {
  // Walks every built page — not a hardcoded list — so a page type that
  // never gets a hand-authored footer (Starlight docs, 404) cannot ship
  // silently unguarded the way the two-path version did.
  const offenders = renderedPageText()
    .filter(({ text }) => !text.includes('Not affiliated with or endorsed by') || !text.includes('DOJ, Inc.'))
    .map(({ path }) => path);
  expect(offenders, `no non-affiliation notice in: ${offenders.join(', ')}`).toEqual([]);
});

test('zero external network requests across the site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      external.push(req.url());
    }
  });
  // Every route the build produced, not a hardcoded subset — a page type
  // visited by no other test (blog posts, docs other than kirby-cost, 404)
  // used to ship a remote request with a green suite.
  for (const route of builtRoutes()) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }
  expect(external, `unexpected external requests: ${external.join(', ')}`).toHaveLength(0);
});

/** Every absolute http(s) URL found in a `src=`/`href=` attribute, tagged
 * with whether it's on an element the browser loads as a subresource
 * (script/img/iframe/source/track/video/audio/object/embed, or a `<link>`
 * whose `rel` fetches something — stylesheet/preload/icon/manifest/etc.)
 * versus one it never fetches on its own — an anchor href, or a `<link
 * rel="canonical"|"alternate">`, which is metadata, not a load. */
function absoluteMarkupUrls(html: string): { url: string; isLoad: boolean }[] {
  const out: { url: string; isLoad: boolean }[] = [];
  const NON_FETCHING_LINK_REL = /\b(canonical|alternate)\b/i;
  const tagRe = /<(\w+)\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html))) {
    const [, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    const urlMatch = /\b(?:src|href)=["'](https?:\/\/[^"']+)["']/i.exec(attrs);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    let isLoad = tag !== 'a';
    if (tag === 'link') {
      const relMatch = /\brel=["']([^"']+)["']/i.exec(attrs);
      isLoad = !(relMatch && NON_FETCHING_LINK_REL.test(relMatch[1]));
    }
    out.push({ url, isLoad });
  }
  return out;
}

test('no external subresources load, and only allow-listed hosts are ever linked', () => {
  // Inverted from a banned-host denylist to an ALLOW-LIST: any absolute
  // http(s) URL not on this short list fails, whether or not it happens to
  // match a name someone already thought to ban. Subresources (things the
  // browser fetches — script/img/iframe/stylesheet <link>/etc.) are never
  // allowed to be absolute at all, even to an allow-listed host — the site
  // ships zero external assets by design. Non-fetching references (anchor
  // hrefs, and Astro's own `<link rel="canonical">`) may point at
  // github.com, pypi.org or the site's own canonical domain; nothing else.
  const REFERENCE_ALLOW = [/^https:\/\/github\.com\//i, /^https:\/\/pypi\.org\//i, /^https:\/\/kirbyvtt\.org\//i];
  const offenders: string[] = [];
  for (const { path, html } of pageText()) {
    for (const { url, isLoad } of absoluteMarkupUrls(html)) {
      if (isLoad) {
        offenders.push(`${path}: ${url} (loaded as a subresource)`);
      } else if (!REFERENCE_ALLOW.some((re) => re.test(url))) {
        offenders.push(`${path}: ${url} (reference, host not allow-listed)`);
      }
    }
  }
  expect(offenders, offenders.join(', ')).toEqual([]);
});

test('drafts never reach their own built page, anywhere in dist', () => {
  // The index guard in mobius-box.spec.ts only ever inspects
  // `/mobius-box/` — it never proved that a draft's *own* route
  // (`getStaticPaths()`'s independent `!data.draft` filter) is honored.
  // Walking every built file catches a draft published at its own URL even
  // though the index correctly omits it.
  const offenders = pageText()
    .filter(({ html }) => html.includes('DRAFT-DO-NOT-PUBLISH'))
    .map(({ path }) => path);
  expect(offenders, `a draft was built at: ${offenders.join(', ')}`).toEqual([]);
});

test('no external font or script hosts appear in the markup', () => {
  const banned = /(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr|unpkg\.com|cdnjs)/i;
  const offenders = pageText()
    .filter(({ html }) => banned.test(html))
    .map(({ path }) => path);
  expect(offenders, `external host referenced in: ${offenders.join(', ')}`).toEqual([]);
});
