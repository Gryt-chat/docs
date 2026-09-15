import { llms } from 'fumadocs-core/source/llms';
import type { InferPageType } from 'fumadocs-core/source';

import { source } from './source';

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat';

/** How Gryt is introduced to a model before it reads anything else. */
export const SITE_SUMMARY = [
  'Gryt is an open-source WebRTC voice chat platform. Self-hostable, with a',
  'desktop client, a signalling server and an SFU for media.',
].join('\n');

/** Root-relative links have no origin to resolve against once the text leaves the site. */
function absolutiseLinks(markdown: string): string {
  return markdown.replace(/\]\(\/(?!\/)/g, `](${BASE_URL}/`);
}

/** One page as markdown, with a heading and a link back to the real thing. */
async function renderPage(page: InferPageType<typeof source>): Promise<string> {
  const body = absolutiseLinks(await page.data.getText('processed'));

  return [
    `# ${page.data.title}`,
    '',
    `Source: ${BASE_URL}${page.url}`,
    page.data.description ? `\n${page.data.description}` : '',
    '',
    body.trim(),
  ].join('\n');
}

export const docsLlms = llms(source, { renderPage });

/** The page tree as a markdown list, each link pointing at that page's .md copy. */
export async function llmsIndex(): Promise<string> {
  const index = await docsLlms.index();
  return index.replace(/\]\((\/docs[^)\s]*)\)/g, `](${BASE_URL}$1.md)`);
}
