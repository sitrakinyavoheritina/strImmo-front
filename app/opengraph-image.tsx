import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { SITE_TAGLINE } from '@/lib/seo/site';

export const alt = 'Onina — L’immobilier à Madagascar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Image de partage par défaut (WhatsApp, Facebook, Google) — logo Onina, slogan et positionnement.
// Lue depuis le disque (data URI) : Satori ne sait pas charger une URL relative du site.
const logoDataUri = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/logo.svg')).toString('base64')}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F2E7CB',
          gap: 28,
        }}
      >
        <img src={logoDataUri} alt="" width={556} height={334} />
        <div style={{ fontSize: 54, fontWeight: 700, color: '#5B291B' }}>L’immobilier à Madagascar</div>
        <div style={{ fontSize: 36, fontWeight: 600, color: '#C74F2D' }}>{SITE_TAGLINE}</div>
      </div>
    ),
    { ...size }
  );
}
