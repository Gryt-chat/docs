import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat';

  // page.url, the same path each page's canonical tag uses. The root only redirects to
  // /docs, and no lastModified: the build time would be wrong on every deploy.
  return source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 1 : 0.7,
  }));
}
