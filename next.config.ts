import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (animal photos uploaded by keepers/admin)
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  // Photos upload directly to storage (not through actions), but keep a safe
  // headroom for text-heavy form submits.
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
