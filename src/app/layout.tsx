import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

const atkinson = localFont({
  src: '../fonts/AtkinsonHyperlegibleNextVF-Variable.woff2',
  variable: '--font-atkinson',
  display: 'swap',
});

const atkinsonMono = localFont({
  src: '../fonts/AtkinsonHyperlegibleMonoVF-Variable.woff2',
  variable: '--font-atkinson-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.gryt.chat',
  ),
  title: {
    default: 'Gryt docs',
    template: '%s | Gryt',
  },
  description:
    'Docs for Gryt, the open-source voice, text and video chat you host yourself. Using the apps, hosting a server, and building on Gryt.',
  keywords: [
    'Gryt',
    'voice chat',
    'text chat',
    'video chat',
    'self-hosted',
    'open source',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Gryt',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    apple: '/favicon.svg',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${atkinson.variable} ${atkinsonMono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
