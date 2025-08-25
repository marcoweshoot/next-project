// next.config.js (ESM)
// ⚠️ La CSP è stata spostata nel middleware con nonce per richiesta.
// Qui restano solo gli altri header di sicurezza + COOP.

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 180,
  productionBrowserSourceMaps:
    process.env.NEXT_PUBLIC_ENABLE_BROWSER_SOURCEMAPS === "1",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-west-1.amazonaws.com",
        pathname: "/mars.weshoot.it/**",
      },
      {
        protocol: "https",
        hostname: "s3.eu-west-1.amazonaws.com",
        pathname: "/weshoot.it/**",
      },
      {
        protocol: "https",
        hostname: "wxoodcdxscxazjkoqhsg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Se passi a un CDN (es. cdn.weshoot.it) aggiungi qui il pattern.
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1080, 1280],
    imageSizes: [16, 20, 24, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ✅ COOP
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Altri header utili
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        // vecchio schema: /destinazioni/:stateslug/:placeslug
        source: "/viaggi-fotografici/destinazioni/:stateslug/:placeslug",
        // nuovo schema:  /destinazioni/:stateslug/posti/:placeslug
        destination:
          "/viaggi-fotografici/destinazioni/:stateslug/posti/:placeslug",
        permanent: true, // 308 (SEO-friendly)
      },
    ];
  },
};

export default nextConfig;
