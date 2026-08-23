// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Mobius Box: rendered by hand-authored Astro pages, NOT Starlight, so the
  // posts keep the marketing header and footer. The glob loader gives each
  // file an `id` from its basename, which becomes /mobius-box/<id>/.
  mobiusBox: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/mobius-box' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
  }),
};
