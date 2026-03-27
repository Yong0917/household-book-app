import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // 무거운 패키지를 필요한 모듈만 트리쉐이킹하도록 최적화
    optimizePackageImports: ["recharts", "date-fns", "lucide-react"],
  },
};

export default nextConfig;
