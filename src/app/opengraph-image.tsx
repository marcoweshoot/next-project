import { ImageResponse } from 'next/og';

// Immagine di default per le condivisioni social (Facebook, X, LinkedIn, WhatsApp).
// Le pagine che definiscono `openGraph.images` nei propri metadati la sovrascrivono.
export const alt = 'WeShoot - Viaggi Fotografici nel Mondo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
          // --background dark del tema: hsl(20 14.3% 4.1%)
          background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -2,
            color: '#ffffff',
          }}
        >
          We
          {/* --primary del tema: hsl(0 84% 60%) */}
          <span style={{ color: '#ef4444' }}>Shoot</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 34,
            color: '#a8a29e',
          }}
        >
          Viaggi Fotografici nel Mondo
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 56,
            width: 160,
            height: 4,
            background: '#ef4444',
          }}
        />
      </div>
    ),
    size
  );
}
