import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // TODO: install babel-plugin-react-compiler then enable
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
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },
  async headers() {
    const immutableCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/posters/:path*",
        headers: immutableCache,
      },
      {
        source: "/:all*(png|jpg|jpeg|webp|avif|svg|woff2)",
        headers: immutableCache,
      },
    ];
  },
};

export default nextConfig;
