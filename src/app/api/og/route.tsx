import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { OG_SIZE, ShareCard, loadOgFonts } from '@/lib/og';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') ?? 'Documentation';
  const description = searchParams.get('description') ?? '';
  const path = searchParams.get('path') ?? '';

  return new ImageResponse(
    <ShareCard title={title} sub={description || undefined} metaRight={`docs.gryt.chat${path}`} />,
    { ...OG_SIZE, fonts: loadOgFonts() },
  );
}
