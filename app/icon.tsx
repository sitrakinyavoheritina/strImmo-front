import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

// Lu à chaque requête plutôt qu'importé statiquement : `next/og` (Satori) ne sait pas rendre un
// <img> pointant vers une URL relative du site, il lui faut le SVG déjà en mémoire (data URI).
const logoDataUri = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/logo.svg')).toString('base64')}`;

export default function Icon() {
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
          borderRadius: 10,
        }}
      >
        <img src={logoDataUri} alt="" width={44} height={26} />
      </div>
    ),
    { ...size }
  );
}
