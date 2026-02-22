import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Gryt - Modern WebRTC Voice Chat Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const svgContent = readFileSync(
    join(process.cwd(), 'public', 'favicon.svg'),
    'utf-8',
  );
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #13151a 0%, #1A1D24 40%, #2B303D 100%)',
          padding: '60px 80px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '700px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img src={logoSrc} width={90} height={90} />
            <span
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-2px',
              }}
            >
              Gryt
            </span>
          </div>
          <span
            style={{
              fontSize: 32,
              color: '#a5a5b0',
              lineHeight: 1.4,
            }}
          >
            Modern WebRTC Voice Chat Platform
          </span>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            {['WebRTC', 'Low Latency', 'Open Source'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 18,
                  color: '#968FF8',
                  border: '1.5px solid #968FF8',
                  borderRadius: '999px',
                  padding: '6px 20px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: '-40px',
            bottom: '-60px',
            opacity: 0.08,
          }}
        >
          <img src={logoSrc} width={500} height={500} />
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #968FF8 0%, #6C63FF 50%, #968FF8 100%)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
