import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      // Append .md to any docs URL to get that page as markdown. The handler
      // lives under /api/md because a route and a page cannot share a segment.
      {
        source: '/docs/:slug*.md',
        destination: '/api/md/:slug*',
      },
      {
        source: '/docs.md',
        destination: '/api/md',
      },
    ];
  },
};

export default withMDX(config);
