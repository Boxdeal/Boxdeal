import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel image-optimization quota (Hobby plan) khatam ho jaane par /_next/image
    // 402 deta hai -> naye images blank aate hain. Optimizer bypass karke images
    // seedha Supabase se serve karte hain (already compressed). Quota bhi nahi judta.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400 * 7,  // OPTIMIZATION: Cache for 7 days
    dangerouslyAllowSVG: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-accordion",
    ],
  },
  // pdfkit loads its built-in PDF fonts through a package-internal subpath
  // (`#standard-fonts/Helvetica`) that is only required at render time, so
  // Next's file tracer never sees it and the font files are left out of the
  // serverless bundle. Locally that goes unnoticed — node_modules is on disk —
  // but on Vercel the invoice route throws MODULE_NOT_FOUND the moment it
  // renders. Ship the whole (192 KB) font directory with that one route.
  outputFileTracingIncludes: {
    "/api/orders/[id]/invoice": ["./node_modules/pdfkit/js/standard-fonts/**"],
    "/api/admin/statement": ["./node_modules/pdfkit/js/standard-fonts/**"],
  },
  compress: true,
  poweredByHeader: false,
  // OPTIMIZATION: Enable SWR cache for data fetches
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,  // Keep inactive pages for 1 hour
    pagesBufferLength: 5,
  },
  headers: async () => [
    {
      // Security headers har response par. NOTE: yahan koi long-lived
      // Cache-Control mat lagao. Pehle `/(.*)` par `immutable, max-age=1yr`
      // tha jo sw.js/manifest jaise mutable files ko bhi 1 saal freeze kar
      // deta tha -> service worker/PWA update kabhi propagate nahi hote the,
      // aur returning users ko purana bundle load hone par ChunkLoadError
      // (wo "Something went wrong" flash + auto-reload) milta tha.
      // Immutable caching sirf content-hashed assets par (neeche) honi chahiye.
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      // Content-hashed build assets — inka URL har build par badalta hai,
      // isliye inhe safely 1 saal ke liye immutable cache kiya ja sakta hai.
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Service worker kabhi cache-freeze nahi hona chahiye, warna sw.js ke
      // updates users tak nahi pahunchte. Har baar revalidate karao.
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    {
      // PWA manifest bhi mutable hai — freeze mat karo.
      source: "/manifest.json",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=60, stale-while-revalidate=3600",
        },
      ],
    },
    {
      // Invoice PDFs are per-customer tax documents and the invoice number is
      // minted on the first request — they must never sit in a shared/CDN
      // cache. This entry comes after /api/(.*) on purpose: the later match
      // wins, so it overrides the blanket s-maxage above.
      source: "/api/orders/:id/invoice",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    },
    {
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
