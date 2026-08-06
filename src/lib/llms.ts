import type { InferPageType } from 'fumadocs-core/source';

import type { source } from './source';

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat';

/** How Gryt is introduced to a model before it reads anything else. */
export const SITE_SUMMARY = [
  'Gryt is an open-source WebRTC voice chat platform. Self-hostable, with a',
  'desktop client, a signalling server and an SFU for media.',
].join('\n');

/**
 * Drop the leading YAML frontmatter block from raw MDX.
 *
 * The title and description are printed above the body instead, so keeping the
 * block would repeat them — and its `---` fences are the same marker used to
 * separate pages in llms-full.txt, which left that document's structure
 * ambiguous.
 *
 * Anchored to the start of the string on purpose: the blog guide contains a
 * fenced yaml example showing what frontmatter looks like, and that is content.
 */
export function stripFrontmatter(raw: string): string {
  const match = raw.match(/^\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

/**
 * Drop the MDX component imports.
 *
 * `import { Callout } from 'fumadocs-ui/components/callout'` is scaffolding for
 * rendering the page. It tells a reader nothing about Gryt, and there are a
 * couple of dozen of them across the docs.
 *
 * The components themselves are left alone — `<Callout type="info">` reads
 * fine with the tag still around it, and unwrapping them risks mangling the
 * text inside.
 */
function stripImports(raw: string): string {
  return raw.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '').trimStart();
}

/**
 * Turn root-relative links into absolute ones.
 *
 * Links are authored as `/docs/guide/accessibility`, which the site resolves
 * against its own origin. In llms-full.txt there is no origin to resolve
 * against — the file could be read anywhere — so they become dead ends.
 */
function absolutiseLinks(raw: string): string {
  return raw.replace(/\]\(\/(?!\/)/g, `](${BASE_URL}/`);
}

/** One page as markdown, with a heading and a link back to the real thing. */
export async function pageToMarkdown(
  page: InferPageType<typeof source>,
): Promise<string> {
  const body = absolutiseLinks(
    stripImports(stripFrontmatter(await page.data.getText('raw'))),
  );

  return [
    `# ${page.data.title}`,
    '',
    `Source: ${BASE_URL}${page.url}`,
    page.data.description ? `\n${page.data.description}` : '',
    '',
    body.trim(),
  ].join('\n');
}
