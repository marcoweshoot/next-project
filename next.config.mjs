// next.config.js (ESM)
const isDev = process.env.NODE_ENV !== 'production';

function makeCsp() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : null,
  ].filter(Boolean).join(' ');

  const connectSrc = [
    "'self'",
    'https://api.weshoot.it',
    'https://s3.eu-west-1.amazonaws.com',
    'https://wxoodcdxscxazjkoqhsg.supabase.co',
    isDev ? 'ws:' : null,
    isDev ? 'http://localhost:*' : null,
  ].filter(Boolean).join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https://wxoodcdxscxazjkoqhsg.supabase.co",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "frame-src 'none'",
  ].join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 180,
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_ENABLE_BROWSER_SOURCEMAPS === '1',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's3.eu-west-1.amazonaws.com', pathname: '/mars.weshoot.it/**' },
      { protocol: 'https', hostname: 's3.eu-west-1.amazonaws.com', pathname: '/weshoot.it/**' },
      { protocol: 'https', hostname: 'wxoodcdxscxazjkoqhsg.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280],
    imageSizes: [16, 20, 24, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: makeCsp() },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()' },
      ],
    }];
  },

  async redirects() {
    return [
      {
        // vecchio schema: /destinazioni/:stateslug/:placeslug
        source: '/viaggi-fotografici/destinazioni/:stateslug/:placeslug',
        // nuovo schema:  /destinazioni/:stateslug/posti/:placeslug
        destination: '/viaggi-fotografici/destinazioni/:stateslug/posti/:placeslug',
        permanent: true, // 308 (SEO-friendly)
      },
    ];
  },
};

export default nextConfig;
