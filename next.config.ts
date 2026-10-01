import type { NextConfig } from 'next';

// Supabase Storage 호스트만 next/image 최적화 허용 (메모 첨부 이미지용)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/note-images/**",
          },
        ]
      : [],
  },
  experimental: {
    // 동적 페이지 RSC 결과를 클라이언트 라우터 캐시에 30초 유지 → 탭을 오갈 때 서버 왕복 없이 즉시 표시.
    // 데이터 변경은 revalidatePath(설정·메모) 또는 클라이언트 직접 재조회(가계부·통계)로 반영된다.
    staleTimes: {
      dynamic: 30,
    },
    // 무거운 패키지를 필요한 모듈만 트리쉐이킹하도록 최적화
    // Next.js 기본 목록에 포함되지 않은 패키지를 명시 (recharts/date-fns/lucide-react는 기본 자동 최적화 대상이나 명시 유지)
    optimizePackageImports: [
      "recharts",
      "date-fns",
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
    ],
  },
};

export default nextConfig;
