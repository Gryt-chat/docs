import { BASE_URL, SITE_SUMMARY, llmsIndex } from '@/lib/llms';

/**
 * An index of the documentation, for language models: every page with its description and
 * URL, so a model fetches what it needs rather than scraping chrome. https://llmstxt.org
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  // Swap the helper's own heading for the site's name and summary.
  const tree = (await llmsIndex()).replace(/^# .*\n+/, '');
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
    tree,
  ];

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
