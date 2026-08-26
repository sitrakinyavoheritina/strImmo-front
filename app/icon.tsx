import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

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
          background: '#2563eb',
          color: '#ffffff',
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          borderRadius: 10,
        }}
      >
        O
      </div>
    ),
    { ...size }
  );
}
