import { source } from '@/lib/source';

/**
 * The whole documentation as one markdown file, for language models.
 *
 * Companion to /llms.txt, which is an index. This is the content itself, so a
 * model can read all of Gryt's docs in a single fetch rather than crawling 36
 * HTML pages and stripping the chrome out of each one.
 *
 * Convention: https://llmstxt.org
 */
export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat';

/**
 * Drop the YAML frontmatter block from raw MDX.
 *
 * Two reasons. It repeats the title and description this file already prints
 * above each page, and its `---` fences are the same marker used to separate
 * pages here — leaving them in makes the document's structure ambiguous to
 * whatever is reading it.
 */
function stripFrontmatter(raw: string): string {
  const match = raw.match(/^\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

export async function GET(): Promise<Response> {
  const pages = source.getPages();

  const sections = await Promise.all(
    pages.map(async (page) => {
      // 'raw' is the source MDX. 'processed' would need includeProcessedMarkdown
      // enabled on the collection, and buys little here — the components that
      // survive are readable enough as-is.
      const body = stripFrontmatter(await page.data.getText('raw'));

      return [
        `# ${page.data.title}`,
        '',
        `Source: ${BASE_URL}${page.url}`,
        page.data.description ? `\n${page.data.description}` : '',
        '',
        body.trim(),
      ].join('\n');
    }),
  );

  const header = [
    '# Gryt documentation',
    '',
    'Gryt is an open-source WebRTC voice chat platform. Self-hostable, with a',
    'desktop client, a signalling server and an SFU for media.',
    '',
    `Page index: ${BASE_URL}/llms.txt`,
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
