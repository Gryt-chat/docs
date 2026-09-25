import { docsLlms } from '@/lib/llms';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

/**
 * A single documentation page as markdown, reached as `/docs/<path>.md`. The middle size
 * between /llms.txt, which is an index, and /llms-full.txt, which is everything.
 */
export const dynamic = 'force-static';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new Response(`${await docsLlms.page(page)}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      // Crawlable so an LLM can still fetch it, but not indexed: it's a copy of
      // the page at .../docs/<path> rather than a page of its own (GRYT-1431).
      'X-Robots-Tag': 'noindex',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
