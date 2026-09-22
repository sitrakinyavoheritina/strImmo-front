import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

const logoDataUri = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/logo.svg')).toString('base64')}`;

// Voir manifest-icon-192-maskable.png/route.tsx — même logo réduit, fond crème plein bord, pour
// que ni le cercle ni le carré arrondi qu'Android peut appliquer à cette icône ne rognent le logo.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3e8d2',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendu par Satori (next/og), pas par le navigateur */}
        <img src={logoDataUri} alt="" width={256} height={154} />
      </div>
    ),
    { ...size }
  );
}
