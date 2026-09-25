import { source } from '@/lib/source';
import { OG_IMAGE_VERSION } from '@/lib/og';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/mdx-components';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={`${page.url}.md`} />
      </div>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const ogParams = new URLSearchParams({ title: page.data.title });
  if (page.data.description) {
    ogParams.set('description', page.data.description);
  }
  // Discord (and others) cache the embed by URL, so a design change needs a
  // version bump here to be seen rather than served from that cache.
  ogParams.set('v', OG_IMAGE_VERSION);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      // Resolved against metadataBase, and the same path sitemap.ts lists.
      canonical: page.url,
      // Tells anything reading the HTML that a markdown copy exists, so it can
      // fetch that instead of stripping tags out of the rendered page.
      types: {
        'text/markdown': `${page.url}.md`,
      },
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      siteName: 'Gryt',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [ogImage],
    },
  };
}
