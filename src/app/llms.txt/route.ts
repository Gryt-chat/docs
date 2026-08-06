import { source } from '@/lib/source';

/**
 * An index of the documentation, for language models.
 *
 * A model asked about Gryt would otherwise scrape rendered HTML and get the
 * navigation, theme toggle and search box along with the prose. This lists
 * every page with its description and URL, so a model can pick what it needs
 * and fetch that instead of guessing from a sitemap.
 *
 * Convention: https://llmstxt.org
 */
export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat';

export function GET(): Response {
  const pages = source.getPages();

  const lines = [
    '# Gryt',
    '',
    'Gryt is an open-source WebRTC voice chat platform. Self-hostable, with a',
    'desktop client, a signalling server and an SFU for media.',
    '',
    `Full documentation as a single file: ${BASE_URL}/llms-full.txt`,
    '',
    '## Documentation',
    '',
  ];

  for (const page of pages) {
    const description = page.data.description
      ? `: ${page.data.description}`
      : '';
    lines.push(`- [${page.data.title}](${BASE_URL}${page.url})${description}`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
