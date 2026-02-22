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
    default: 'Gryt - Modern WebRTC Voice Chat Platform',
    template: '%s | Gryt',
  },
  description:
    'Gryt is a cutting-edge WebRTC-based voice chat platform featuring real-time communication, advanced audio processing, and a beautiful modern interface.',
  keywords: [
    'voice chat',
    'WebRTC',
    'real-time communication',
    'audio processing',
    'voice platform',
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
