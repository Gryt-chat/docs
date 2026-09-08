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
  // Every URL the docs had before they were grouped by audience (GRYT-1012).
  // Permanent, because these were public for months and are in search results,
  // other people's bookmarks, and links from the client and the site.
  async redirects() {
    return [
      { source: '/docs/bot', destination: '/docs/build/bots', permanent: true },
      { source: '/docs/bot/api-reference', destination: '/docs/build/bot-api', permanent: true },
      { source: '/docs/cli', destination: '/docs/host/cli', permanent: true },
      { source: '/docs/client', destination: '/docs/use', permanent: true },
      { source: '/docs/client/addon-api', destination: '/docs/build/addon-api', permanent: true },
      { source: '/docs/client/addons', destination: '/docs/build/addons', permanent: true },
      { source: '/docs/client/audio-processing', destination: '/docs/use/audio', permanent: true },
      { source: '/docs/client/build-from-source', destination: '/docs/about/build-the-client', permanent: true },
      { source: '/docs/client/installation', destination: '/docs/use/installation', permanent: true },
      { source: '/docs/client/updates', destination: '/docs/use/updates', permanent: true },
      { source: '/docs/client/user-interface', destination: '/docs/use/interface', permanent: true },
      { source: '/docs/client/voice-communication', destination: '/docs/use/voice', permanent: true },
      { source: '/docs/deployment', destination: '/docs/host', permanent: true },
      { source: '/docs/deployment/backups', destination: '/docs/host/backups', permanent: true },
      { source: '/docs/deployment/cloudflare-tunnel', destination: '/docs/host/cloudflare-tunnel', permanent: true },
      { source: '/docs/deployment/docker-compose', destination: '/docs/host/docker-compose', permanent: true },
      { source: '/docs/deployment/embedded', destination: '/docs/host/from-the-app', permanent: true },
      { source: '/docs/deployment/monitoring', destination: '/docs/host/monitoring', permanent: true },
      { source: '/docs/deployment/no-domain', destination: '/docs/host/no-domain', permanent: true },
      { source: '/docs/deployment/tailscale', destination: '/docs/host/tailscale', permanent: true },
      { source: '/docs/deployment/windows', destination: '/docs/host/windows', permanent: true },
      { source: '/docs/guide', destination: '/docs/about', permanent: true },
      { source: '/docs/guide/accessibility', destination: '/docs/use/accessibility', permanent: true },
      { source: '/docs/guide/accounts', destination: '/docs/use/accounts', permanent: true },
      { source: '/docs/guide/ai', destination: '/docs/about/ai', permanent: true },
      { source: '/docs/guide/architecture', destination: '/docs/about/architecture', permanent: true },
      { source: '/docs/guide/configuration', destination: '/docs/host/configuration', permanent: true },
      { source: '/docs/guide/contributing', destination: '/docs/about/contributing', permanent: true },
      { source: '/docs/guide/emojis', destination: '/docs/use/emojis', permanent: true },
      { source: '/docs/guide/faq', destination: '/docs/use/faq', permanent: true },
      { source: '/docs/guide/feature-requests', destination: '/docs/about/feature-requests', permanent: true },
      { source: '/docs/guide/licensing', destination: '/docs/about/licensing', permanent: true },
      { source: '/docs/guide/plugin-pairs', destination: '/docs/build/plugin-pairs', permanent: true },
      { source: '/docs/guide/quick-start', destination: '/docs/host/quick-start', permanent: true },
      { source: '/docs/guide/roadmap', destination: '/docs/about/roadmap', permanent: true },
      { source: '/docs/guide/roles', destination: '/docs/use/roles', permanent: true },
      { source: '/docs/guide/security', destination: '/docs/about/security', permanent: true },
      { source: '/docs/guide/troubleshooting', destination: '/docs/use/troubleshooting', permanent: true },
      { source: '/docs/guide/why-gryt', destination: '/docs/about/why-gryt', permanent: true },
      { source: '/docs/server', destination: '/docs/host/server', permanent: true },
      { source: '/docs/server/api-reference', destination: '/docs/build/server-api', permanent: true },
      { source: '/docs/server/identity', destination: '/docs/host/identity', permanent: true },
      { source: '/docs/server/multi-server', destination: '/docs/host/multi-server', permanent: true },
      { source: '/docs/server/plugin-api', destination: '/docs/build/server-plugin-api', permanent: true },
      { source: '/docs/server/plugins', destination: '/docs/build/server-plugins', permanent: true },
      { source: '/docs/server/rate-limiting', destination: '/docs/host/rate-limiting', permanent: true },
      { source: '/docs/sfu', destination: '/docs/host/sfu', permanent: true },
      { source: '/docs/sfu/voice-debugging', destination: '/docs/host/voice-debugging', permanent: true },
      { source: '/docs/site', destination: '/docs/about/website', permanent: true },
      { source: '/docs/site/blog', destination: '/docs/about/blog', permanent: true },
      { source: '/docs/ui', destination: '/docs/build/ui', permanent: true },
      { source: '/docs/ui/react-native', destination: '/docs/build/ui-react-native', permanent: true },
      { source: '/docs/voice', destination: '/docs/build/voice', permanent: true },
      { source: '/docs/voice/getting-started', destination: '/docs/build/voice-getting-started', permanent: true },
      { source: '/docs/voice/hooks', destination: '/docs/build/voice-hooks', permanent: true },
      { source: '/docs/voice/seams', destination: '/docs/build/voice-seams', permanent: true },
    ];
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
