import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "가계부",
  description: "개인 수입·지출 관리 앱",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    title: "가계부",
    capable: true,
    statusBarStyle: "default",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Supabase 도메인에 대해 스플래시 표시 동안 TLS 핸드셰이크를 미리 수립 → 로그인/데이터 페칭 첫 요청 지연 단축
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    // style 인라인: CSS 로드 전 배경 깜빡임 방지. Android splash(`#FAF8F3`)와 정확히 매칭하여 splash → 웹 전환 시 색상 점프 제거.
    <html lang="ko" suppressHydrationWarning style={{ backgroundColor: "#FAF8F3" }}>
      {supabaseUrl && (
        <head>
          <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={supabaseUrl} />
        </head>
      )}
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
