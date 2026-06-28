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
  compress: true,
  poweredByHeader: false,
  // OPTIMIZATION: Enable SWR cache for data fetches
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,  // Keep inactive pages for 1 hour
    pagesBufferLength: 5,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // OPTIMIZATION: Cache static assets for 1 year
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
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
