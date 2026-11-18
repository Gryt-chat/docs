import { ImageResponse } from 'next/og';
import { OG_SIZE, ShareCard, loadOgFonts } from '@/lib/og';

export const alt = 'Gryt docs';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <ShareCard title="Gryt docs" sub="Using the apps, hosting a server, and building on Gryt." metaRight="use · host · build" />,
    { ...size, fonts: loadOgFonts() },
  );
}
