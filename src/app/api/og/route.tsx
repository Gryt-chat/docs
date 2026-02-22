import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { type NextRequest } from 'next/server';

export const runtime = 'nodejs';

const svgContent = readFileSync(
  join(process.cwd(), 'public', 'favicon.svg'),
  'utf-8',
);
const logoSrc = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') ?? 'Documentation';
  const description = searchParams.get('description') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #13151a 0%, #1A1D24 40%, #2B303D 100%)',
          padding: '60px 80px',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '900px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={logoSrc} width={52} height={52} />
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#968FF8',
              }}
            >
              Gryt Docs
            </span>
          </div>

          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1.5px',
              lineHeight: 1.15,
              marginTop: '24px',
            }}
          >
            {title}
          </span>

          {description && description !== title && (
            <span
              style={{
                fontSize: 26,
                color: '#a5a5b0',
                lineHeight: 1.4,
                marginTop: '8px',
              }}
            >
              {description.length > 120
                ? description.slice(0, 120) + '...'
                : description}
            </span>
          )}
        </div>

        <div style={{ display: 'flex' }}>
          <span style={{ fontSize: 18, color: '#666' }}>docs.gryt.chat</span>
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: '-40px',
            bottom: '-60px',
            opacity: 0.05,
          }}
        >
          <img src={logoSrc} width={450} height={450} />
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background:
              'linear-gradient(90deg, #968FF8 0%, #6C63FF 50%, #968FF8 100%)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
