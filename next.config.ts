import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@react-three/drei', '@react-three/postprocessing', 'three'],
  },
};

export default nextConfig;
