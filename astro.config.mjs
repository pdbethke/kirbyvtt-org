// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://kirbyvtt.org',
  integrations: [
    starlight({
      title: 'Kirby docs',
      description:
        'The engines behind Kirby: kirby-cost, kirby-sheet and kirby-combat.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/pdbethke' },
      ],
      // Starlight ships Pagefind (local search, no network calls) and system
      // fonts by default. Do not add a font <link> — tests/guards.spec.ts
      // fails the build if any external request appears.
      customCss: ['./src/styles/starlight-tokens.css'],
      components: {
        SiteTitle: './src/components/StarlightSiteTitle.astro',
        Header: './src/components/StarlightHeader.astro',
      },
      sidebar: [
        {
          label: 'Site',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Mobius Box', link: '/mobius-box/' },
          ],
        },
        // NOTE: `link` rather than `slug` deliberately — Starlight 0.41.3
        // validates a `slug` entry against the docs collection at build time
        // and throws a fatal AstroError if it doesn't resolve yet. Task 4
        // creates these pages; `link` points at the same eventual URL
        // without requiring the entry to exist now (see task-1-report.md).
        { label: 'kirby-cost', link: '/docs/kirby-cost/' },
        { label: 'kirby-sheet', link: '/docs/kirby-sheet/' },
        { label: 'kirby-combat', link: '/docs/kirby-combat/' },
      ],
    }),
  ],
});
