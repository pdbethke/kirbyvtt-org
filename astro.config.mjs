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
        { icon: 'github', label: 'kirby-cost on GitHub', href: 'https://github.com/pdbethke/kirby-cost' },
      ],
      // Starlight ships Pagefind (local search, no network calls) and system
      // fonts by default. Do not add a font <link> — tests/guards.spec.ts
      // fails the build if any external request appears.
      customCss: ['./src/styles/starlight-tokens.css'],
      components: {
        SiteTitle: './src/components/StarlightSiteTitle.astro',
        Header: './src/components/StarlightHeader.astro',
        Footer: './src/components/StarlightFooter.astro',
      },
      sidebar: [
        {
          label: 'Site',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Mobius Box', link: '/mobius-box/' },
          ],
        },
        // `slug` restores build-time validation: Starlight 0.41.3 throws a
        // fatal AstroError if a sidebar `slug` entry doesn't resolve against
        // the docs collection, catching a renamed or deleted page at build
        // time instead of leaving a silently dead sidebar link. Files live
        // at src/content/docs/docs/<name>.md, so the slug Starlight resolves
        // is `docs/<name>` (see task-4-report.md).
        { label: 'kirby-cost', slug: 'docs/kirby-cost' },
        { label: 'kirby-sheet', slug: 'docs/kirby-sheet' },
        { label: 'kirby-combat', slug: 'docs/kirby-combat' },
        { label: 'RAW alignment', slug: 'docs/raw-alignment' },
      ],
    }),
  ],
});
