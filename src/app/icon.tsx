import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#071E1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          display: 'flex',
          fontSize: 340,
          color: '#FFD400',
          fontWeight: 900,
          letterSpacing: '-0.05em',
        }}>
          V
        </div>
      </div>
    ),
    { ...size }
  );
}
