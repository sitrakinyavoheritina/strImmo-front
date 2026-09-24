import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

const logoDataUri = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/logo.svg')).toString('base64')}`;

// Variante "maskable" de l'icône (voir manifest.ts) : Android peut découper cette image dans
// n'importe quelle forme (cercle, carré arrondi...) selon le thème du téléphone — le logo doit donc
// tenir dans la zone de sécurité centrale (cercle de 80% du carré, voir la spec W3C "maskable
// icons"), fond plein sans transparence jusqu'aux bords. Logo nettement plus petit qu'sur icon.tsx
// (fond blanc, sans contrainte de découpe) pour rester loin de cette zone, fond crème (couleur de
// page de l'app, pas blanc) pour rester cohérent une fois posée sur un fond sombre.
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
        <img src={logoDataUri} alt="" width={130} height={78} />
      </div>
    ),
    { ...size }
  );
}
