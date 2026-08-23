// SPDX-License-Identifier: LicenseRef-PolyForm-Noncommercial-1.0.0
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

/** Every built HTML file, so a rule cannot be dodged by adding a page. */
export function builtPages(dir = 'dist', out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) builtPages(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

/** The route a built HTML file is served at, derived from its dist path —
 * so the route list can never drift from what actually got built. */
export function routeFor(distPath: string): string {
  let route = distPath.replace(/^dist/, '').split(sep).join('/');
  route = route.endsWith('/index.html')
    ? route.slice(0, -'index.html'.length)
    : route.replace(/\.html$/, '');
  return route || '/';
}

/** Every route the build actually produced, one per built page. */
export const builtRoutes = () => builtPages().map(routeFor);

export const pageText = () =>
  builtPages().map((p) => ({ path: p, html: readFileSync(p, 'utf8') }));

/** Rendered text: strip tags and collapse whitespace, so inline markup
 * between two words of a banned phrase (e.g. `<strong>Hero Designer</strong>`)
 * cannot defeat a text-based rule the way raw HTML does. */
export function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const renderedPageText = () =>
  pageText().map(({ path, html }) => ({ path, text: textOf(html) }));
