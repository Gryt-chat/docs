import { BASE_URL, SITE_SUMMARY, pageToMarkdown } from '@/lib/llms';
import { source } from '@/lib/source';

/**
 * The whole documentation as one markdown file, for language models, when a model would
 * rather read the lot than crawl 36 HTML pages. Convention: https://llmstxt.org
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const pages = source.getPages();
  const sections = await Promise.all(pages.map(pageToMarkdown));

  const header = [
    '# Gryt documentation',
    '',
    SITE_SUMMARY,
    '',
    `Page index: ${BASE_URL}/llms.txt`,
    `Single page: append .md to any docs URL, e.g. ${BASE_URL}/docs/guide/ai.md`,
    '',
    '---',
    '',
  ].join('\n');

  return new Response(`${header}${sections.join('\n\n---\n\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
