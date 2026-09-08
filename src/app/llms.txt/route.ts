import { BASE_URL, SITE_SUMMARY } from '@/lib/llms';
import { source } from '@/lib/source';

/**
 * An index of the documentation, for language models: every page with its description and
 * URL, so a model fetches what it needs rather than scraping chrome. https://llmstxt.org
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const pages = source.getPages();

  const lines = [
    '# Gryt',
    '',
    SITE_SUMMARY,
    '',
    `Everything at once: ${BASE_URL}/llms-full.txt`,
    'Single page: append .md to any docs URL below.',
    '',
    '## Documentation',
    '',
  ];

  for (const page of pages) {
    const description = page.data.description
      ? `: ${page.data.description}`
      : '';
    lines.push(`- [${page.data.title}](${BASE_URL}${page.url}.md)${description}`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
