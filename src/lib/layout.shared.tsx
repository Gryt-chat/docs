import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations for Gryt Documentation
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Gryt Logo"
            className="text-blue-500"
          >
            <defs>
              <linearGradient id="gryt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="url(#gryt-gradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
        url: 'https://discord.gg/Q3JKUGsnHE',
        external: true,
      },
    ],
  };
}
