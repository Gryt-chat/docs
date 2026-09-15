import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configuration. Individual layouts are app/(home)/layout.tsx and
 * app/docs/layout.tsx.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/favicon.svg" alt="" width={24} height={24} className="rounded-md" />
          <span className="font-bold text-lg">Gryt</span>
        </>
      ),
    },
    links: [
      {
        text: 'Website',
        url: 'https://gryt.chat',
        external: true,
      },
      {
        text: 'Blog',
        url: 'https://gryt.chat/blog',
        external: true,
      },
      {
        text: 'GitHub',
        url: 'https://github.com/Gryt-chat/gryt',
        external: true,
      },
      {
        text: 'Discord',
        url: 'https://gryt.chat/discord',
        external: true,
      },
      {
        text: 'Feedback',
        url: 'https://feedback.gryt.chat',
        external: true,
      },
    ],
  };
}
