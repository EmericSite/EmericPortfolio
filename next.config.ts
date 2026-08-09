// Emericfolio — created by Tomi-Tom, 2026
// Next.js build settings: image formats, cache headers for media, bundle tuning
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "@react-three/drei",
      "@react-three/fiber",
      "@react-three/postprocessing",
      "three",
      "zustand",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Published names are stable, so a replaced image keeps its URL: caching it
    // for a year would serve the old one until the visitor clears his cache.
    minimumCacheTTL: 86400,
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },
  async headers() {
    // Published media keep their file name when Emeric replaces them, so they
    // must never be cached as immutable or returning visitors keep the old one.
    const revalide = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    ];

    return [
      { source: "/posters/:path*", headers: revalide },
      { source: "/projects/:path*", headers: revalide },
    ];
  },
};

export default nextConfig;
