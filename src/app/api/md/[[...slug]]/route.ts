import { pageToMarkdown } from '@/lib/llms';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

/**
 * A single documentation page as markdown.
 *
 * Reached as `/docs/<path>.md` — see the rewrite in next.config.mjs. /llms.txt
 * indexes the docs and /llms-full.txt is all of it at once, which is a lot to
 * read when the question is about one page. This is the middle size: append
 * `.md` to any docs URL and get that page's source without the surrounding
 * HTML.
 */
export const dynamic = 'force-static';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new Response(`${await pageToMarkdown(page)}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
