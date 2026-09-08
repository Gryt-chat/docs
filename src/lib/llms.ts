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
 * Drop the leading YAML frontmatter block from raw MDX: the title and description are
 * printed above the body, and its `---` fences are what separates pages in llms-full.txt.
 */
export function stripFrontmatter(raw: string): string {
  const match = raw.match(/^\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

/**
 * Drop the MDX component imports, which are scaffolding. The components themselves are left
 * alone: `<Callout type="info">` reads fine, and unwrapping risks mangling the text.
 */
function stripImports(raw: string): string {
  return raw.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '').trimStart();
}

/**
 * Turn root-relative links into absolute ones. In llms-full.txt there is no origin to
 * resolve `/docs/guide/accessibility` against, so they would be dead ends.
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
