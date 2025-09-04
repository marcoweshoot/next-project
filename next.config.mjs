// next.config.js (ESM)
// ⚠️ La CSP è stata spostata nel middleware con nonce per richiesta.
// Qui restano solo gli altri header di sicurezza + COOP.

/** @type {import('next').NextConfig} */
const config = {
  // Ottimizzazioni per ridurre il bundle JavaScript
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Ottimizzazioni del webpack
  webpack: (config, { dev, isServer }) => {
    // Ottimizzazioni solo per production
    if (!dev && !isServer) {
      // Tree shaking più aggressivo
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
      
      // Split chunks più efficiente
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separare le librerie esterne
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separare i componenti UI
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 5,
          },
          // Separare i componenti di tour
          tours: {
            test: /[\\/]components[\\/](tour|tours)[\\/]/,
            name: 'tours',
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },

  // 👉 Disattiva l'Image Optimization di Next/Vercel
  images: {
    unoptimized: true,
  },
  
  // Compressione
  compress: true,
  
  // Headers per cache e sicurezza (restano invariati)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()' },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Redirects (invariati)
  async redirects() {
    return [
      {
        // vecchio schema: /destinazioni/:stateslug/:placeslug
        source: "/viaggi-fotografici/destinazioni/:stateslug/:placeslug",
        // nuovo schema:  /destinazioni/:stateslug/posti/:placeslug
        destination: "/viaggi-fotografici/destinazioni/:stateslug/posti/:placeslug",
        permanent: true, // 308 (SEO-friendly)
      },
    ];
  },
};

export default config;
