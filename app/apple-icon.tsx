import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const logoDataUri = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/logo.svg')).toString('base64')}`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <img src={logoDataUri} alt="" width={164} height={98} />
      </div>
    ),
    { ...size }
  );
}
