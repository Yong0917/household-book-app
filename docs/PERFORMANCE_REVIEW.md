# 머니로그 (가계부 앱) 성능·개선점 분석 보고서

> 분석 일자: 2026-05-08
> 분석 범위: `app/`, `components/`, `lib/`, `public/`, 설정 파일
> 보고서 형식: 우선순위 라벨 (🔴 High / 🟡 Medium / 🟢 Low) + 추적 ID (H/M/L)

---

## 0. Executive Summary

코어 최적화 (이미지·번들·캐시·preconnect·SSR pre-fetch·다층 캐시·dynamic import) 가 **매우 잘 적용되어 있다**. 추가 개선 여지는 다음과 같다.

| 분류 | 건수 |
|---|---|
| 🔴 High Priority | 2건 (H1, H2) |
| 🟡 Medium Priority | 7건 (M1~M7) |
| 🟢 Low Priority | 7건 (L1~L7) |
| 📊 측정 도구 도입 권장 | 2건 (D1, D2) |
| 🛡️ 보안 (범위 외, 알림만) | 1건 (§ 8) |

**가장 시급한 항목:** H1 (status bar `theme-color` 메타) + H2 (`next/font` 가 globals.css 에 의해 무력화되는 문제)

---

## 1. 현재 잘 되어 있는 부분 ✅

이번 분석에서 직접 검증한, **코드 베이스가 이미 우수하게 처리하고 있는 항목들**:

1. **`next.config.ts:11-22`** — Supabase Storage 호스트만 `next/image` 화이트리스트. AVIF/WebP 형식 자동 변환
2. **`next.config.ts:26-37`** — `optimizePackageImports` 로 recharts/date-fns/lucide-react/dnd-kit/radix 트리쉐이킹 명시
3. **`app/layout.tsx:53-57`** — Supabase 도메인에 `preconnect` + `dns-prefetch` 적용 (TLS 핸드셰이크 사전 수립)
4. **`app/layout.tsx:6-11`** — `next/font/google` + `display: "swap"` + CSS 변수 (단, H2 항목 참조)
5. **`app/(protected)/ledger/daily/page.tsx:16-19`, `app/(protected)/statistics/page.tsx:13-17`** — SSR 시점 `Promise.all` 병렬 fetch
6. **`components/ledger/LedgerTabView.tsx:182-238`** — 인메모리 (`cacheRef`) + localStorage (`ledger_cache_v1`, 최근 3개월) 다층 캐시 + StrictMode 중복 fetch 방지 (`fetchingKeyRef`)
7. **`components/statistics/StatisticsPageClient.tsx:12-38`** — recharts 차트 (`MonthlyTrendChart`, `CategoryDetailSheet`) 를 `dynamic({ ssr: false })` + 로딩 스켈레톤
8. **`lib/utils/imageUtils.ts:1-74`** — 클라이언트 측 Canvas 압축 (WebP 우선, JPEG 폴백) + 리사이즈
9. **`app/manifest.ts`** — Next.js MetadataRoute 로 PWA manifest 자동 생성 (`background_color` / `theme_color` / `orientation` 모두 지정)
10. **`lib/supabase/proxy.ts:43-47, 56`** — `/` 진입 시 `getUser()` 라운드트립 스킵, 보호 경로에서만 검증·갱신 (가드레일 명시)
11. **`components/settings/ImportButton.tsx:6, 150`** — `xlsx` 를 `import type` + `await import("xlsx")` 로 dynamic 처리 → 메인 번들 누수 없음
12. **`app/api/analyze-receipt/route.ts`** — `@google/genai` 가 서버 API 라우트에서만 import → 클라이언트 번들 안전
13. **`app/icon.png`, `app/apple-icon.png`** — Next.js metadata 컨벤션 사용
14. **PWA 다음 재시작 즉시 표시** — `LedgerTabView` / `StatisticsPageClient` 의 localStorage 캐시 활용으로 콜드 스타트 후에도 빠른 첫 페인트

---

## 2. 개선 항목 — 🔴 High Priority

### H1. `<meta name="theme-color">` 가 라이트/다크 분기 없음
- **위치:** `app/layout.tsx:17-21` (viewport 객체)
- **문제:** `viewport.themeColor` 가 미설정 상태. `app/manifest.ts:12` 의 `theme_color` 는 PWA 설치 모드에서만 적용되며, 일반 브라우저 탭 (Android Chrome 주소창, iOS Safari status bar) 에서는 이 메타가 없으면 기본 색상으로 렌더됨
- **영향:** 사용자 가시 품질 — status bar 색상이 앱 톤과 일치하지 않음. 다크모드 미대응
- **제안:**
  ```ts
  // app/layout.tsx
  export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
      { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
    ],
  };
  ```

---

### H2. `next/font/google` 의 self-host 결과가 `globals.css` 에 의해 무력화됨
- **위치:** `app/layout.tsx:6-11`, `app/globals.css:43`
- **문제 (검증으로 확인된 시퀀스):**
  1. `app/layout.tsx:9` 가 `variable: "--font-sans"` 로 next/font 가 self-host 한 latin subset Noto Sans KR 의 CSS 변수를 등록
  2. `app/globals.css:43` 이 같은 변수를 다음과 같이 **덮어쓰기**:
     ```css
     --font-sans: "Noto Sans KR", system-ui, -apple-system, sans-serif;
     ```
  3. 결과: next/font 가 자체 호스팅한 `.woff2` 는 참조되지 못하고, `"Noto Sans KR"` 이라는 패밀리 이름으로 OS 시스템 폰트 검색 → 시스템에 없으면 `system-ui` → `-apple-system` → `sans-serif` 폴백
  4. 더불어 `subsets: ["latin"]` 만 지정되어 있어 빌드 시 한글 글리프 자체가 다운로드되지 않음
- **결과:** 사실상 `next/font/google` 호출이 무용지물. 한글 텍스트는 OS 시스템 폰트 (Apple SD Gothic Neo / Malgun Gothic / Android Roboto Korean) 로 렌더링됨
- **영향:** OS 별로 한글 글꼴이 다름 → 디자인 일관성 저하. next/font 의 layout-shift 방지·preload 이점도 활용 못함
- **제안 (의도 확인 후 택1):**
  - **(a) Noto Sans KR 한글까지 self-host 가 의도였다면**
    - `globals.css:43` 의 `--font-sans` 라인 제거 (next/font 가 등록한 변수가 살아남도록)
    - `next/font/google` 의 Noto_Sans_KR 은 `subsets: ["korean"]` 미지원 → `next/font/local` 로 한글 포함 woff2 self-host 필요
  - **(b) 시스템 폰트가 의도였다면**
    - `app/layout.tsx:6-11` 의 `Noto_Sans_KR(...)` 호출과 `<body className={notoSansKR.variable}>` 적용 제거
    - `globals.css:43` 그대로 유지 → 현재와 동일 결과를 빌드 비용 없이 달성
  - 사용자 결정 필요

---

## 3. 개선 항목 — 🟡 Medium Priority

### M1. `(protected)/layout.tsx` 의 `user_deletion_requests` 쿼리가 모든 protected 라우트 진입마다 실행
- **위치:** `app/(protected)/layout.tsx:16-21`
- **문제:** 비게스트 사용자가 protected 페이지에 진입할 때마다 1회 추가 RLS 쿼리 발생 (게스트는 스킵됨)
- **영향 (추정, 측정 권장):** 인덱스 적용 + 행 수 적은 경우 ~10-30ms. cold start 마다 누적
- **제안 (택1):**
  - JWT custom claim 으로 `is_pending_deletion` 플래그를 부여 → `getClaims()` 반환값에서 즉시 읽기 (라운드트립 0)
  - React 19 `cache()` 또는 `unstable_cache` 로 동일 RSC 트리 내 중복 호출 방지

---

### M2. `DailyView.handleItemClick` 의존성 + `TransactionList` 메모이제이션 미적용
- **위치:** `components/ledger/DailyView.tsx:100-105`, `components/ledger/TransactionList.tsx:10`
- **문제:**
  1. `handleItemClick` 이 `useCallback([transactions, isGuest, requireLogin])` 으로 transactions 변경마다 새 콜백 생성
  2. `TransactionList` 가 `React.memo` 미적용 → 매 렌더 `.map()` 재실행
  3. 추가 약점: `DailyView.tsx:53-97` 의 `useMemo` 가 매 렌더 새 `dailyData.listItems` 배열을 생성하므로, TransactionList 를 memo 로 감싸도 prop reference 가 달라져 효과 제한
- **영향:** 거래 1개 추가/삭제 시 리스트 전체 재렌더. 50건 미만이면 체감 거의 없으나, 100건 이상이면 의미 있음
- **제안 (점진적):**
  1. `txMapRef = useRef<Map<string, Transaction>>(...)` 로 latest transactions 보관 → handleItemClick 의 의존성에서 transactions 제거 (콜백 안정화)
  2. TransactionList 를 `React.memo` 로 감싸기
  3. 더 깊게 가려면: `dailyData.listItems` 의 ref 안정화 (react-fast-compare 또는 deep comparison)

---

### M3. `manifest.ts` icons 에 `maskable` purpose 없음
- **위치:** `app/manifest.ts:15-28`
- **문제:** 모든 아이콘이 `purpose: "any"` 만 지정. Android 8+ adaptive icon 에서 동그라미/사각형 마스크 적용 시 가장자리가 잘릴 수 있음
- **영향:** PWA 설치 시 안드로이드 홈 아이콘의 시각 품질
- **제안:** 가운데 80% 안전영역 디자인의 `icon-512-maskable.png` 추가 + manifest 에 별도 엔트리:
  ```ts
  { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ```

---

### M4. `GuestModeContext` value 가 매 렌더 새 객체로 생성됨
- **위치:** `lib/context/GuestModeContext.tsx:36-41`
- **문제:**
  - `requireLogin` 함수가 useCallback 미사용
  - `value={{ isGuest, requireLogin }}` 이 useMemo 미사용
  - Provider 자체가 `modalOpen` state 를 보유 → modalOpen 변경 시 value 가 새 reference → 모든 consumer 리렌더 트리거
- **영향:** **게스트 모드** 에서 차단된 액션을 시도할 때만 modalOpen 변경 → 비게스트 정상 흐름엔 거의 영향 없음. 패턴 정정 차원 권장
- **제안:**
  ```tsx
  const requireLogin = useCallback(() => {
    if (isGuest) setModalOpen(true);
  }, [isGuest]);

  const value = useMemo(() => ({ isGuest, requireLogin }), [isGuest, requireLogin]);
  ```

---

### M5. statistics 페이지가 매 진입마다 6개월 데이터 fetch (서버 캐시 없음)
- **위치:** `app/(protected)/statistics/page.tsx:13-17`, `lib/actions/transactions.ts:53-65, 186+`
- **문제:** 클라이언트 측 `stats_cache_v1` localStorage 캐시는 있으나, SSR 단계에서는 매번 RPC `get_monthly_trend` + `getTransactionsByMonth` + `getCategories` 호출
- **영향 (추정, 측정 권장):** SSR TTFB 에 200-400ms 추가. 클라이언트 페이지 전환은 이미 캐시로 빠름
- **제안:** 사용자별 데이터이므로 cache key 에 user_id 포함 필요
  - `unstable_cache` 사용 시: `unstable_cache(fn, [userId, year, month, trendCount], { revalidate: 300 })`
  - 또는 `lib/actions/transactions.ts` 에 `getMonthlyTrend` 만 RPC 캐싱 (DB 측 트리거 / Supabase materialized view)

---

### M6. `NoteList` 의 pinned/unpinned 분리가 매 렌더 .filter()
- **위치:** `components/notes/NoteList.tsx:103-104`
- **문제:** 노트 수 < 100 이면 영향 없음. 패턴 안전망 차원
- **제안:**
  ```tsx
  const { pinned, unpinned } = useMemo(() => ({
    pinned: notes.filter((n) => n.is_pinned),
    unpinned: notes.filter((n) => !n.is_pinned),
  }), [notes]);
  ```

---

### M7. `categories` / `assets` 가 거의 정적인데 매 월마다 fetch
- **위치:** `lib/actions/transactions.ts:53-65, 71-83`
- **문제:** `getStatisticsPageData` / `getLedgerMonthData` 가 Promise.all 안에서 `getCategories()` 와 `getAssets()` 를 함께 fetch. 사용자가 월 변경할 때마다 동일한 카테고리/자산 데이터를 다시 가져옴
- **분석:** transactions 와 함께 묶어 1회 라운드트립이라 추가 라운드트립 비용은 없으나, Supabase select 작업 자체는 매번 발생
- **영향 (추정, 측정 권장):** 카테고리 < 50, 자산 < 20 정도면 각 < 10ms
- **제안 (택1):**
  - **(a)** 클라이언트 측 LedgerTabView/StatisticsPageClient 의 캐시 키에서 categories/assets 분리 (한 번 fetch 후 모든 월 공유)
  - **(b)** Supabase RPC 로 4 개 쿼리를 1 개로 묶기 (이미 Promise.all 로 병렬이라 효과 작음)
  - **(c)** 현재 패턴 유지 (단순함 우선) — D2 측정 후 결정 권장

---

## 4. 개선 항목 — 🟢 Low Priority

### L1. `public/icon-512.png` 가 374KB
- **위치:** `public/icon-512.png` (374,787 bytes)
- **분석:** PWA install 시 1회 다운로드 → 이후 캐시. cold start 매번 영향 없음
- **제안 (선택):** `oxipng -o 6 public/icon-512.png` 또는 `pngquant --quality=80-95` 로 무손실 압축. 50-100KB 목표

### L2. dev 서버에서 turbopack 미사용 (production 무관)
- **위치:** `package.json:4` `"dev": "next dev"`
- **분석:** Next.js 15.3 부터 dev turbopack stable. 프로덕션 빌드/런타임 영향 없음
- **제안 (선택):** `"dev": "next dev --turbopack"` — dev 콜드 스타트/HMR 단축

### L3. Service Worker 부재 — manifest 만으로 PWA installable, 오프라인은 미지원
- **검증:** `app/`, `public/` 전체에서 `serviceWorker.register` 없음
- **분석:** 가계부 앱 특성상 오프라인이 필수가 아니므로 영향 작음. 단, 네트워크 끊김 시 빈 화면
- **제안 (선택):** `next-pwa` 또는 Workbox 도입 시 캐시 전략 신중히 설계 (잘못된 캐싱은 데이터 일관성 깨뜨림)

### L4. `lib/actions/transactions.ts` 에 `revalidatePath` 미사용 (의도적)
- **위치:** `lib/actions/transactions.ts` 전체
- **검증:** 다른 actions (assets/notes/categories/recurring) 는 모두 `revalidatePath` 호출. transactions 만 미호출
- **분석:** LedgerTabView 가 자체 `invalidateCache(true)` 로 처리하는 의도적 패턴 — 영향 없음
- **제안:** 코드 상단에 의도 주석 추가 권장:
  ```ts
  // revalidatePath 호출하지 않음 — 클라이언트 측 LedgerTabView/StatisticsPageClient 캐시로 무효화 처리
  ```

### L5. `layout.tsx` 의 `metadata.icons` 가 `app/icon.png` 컨벤션과 중복
- **위치:** `app/layout.tsx:27-33`, `app/icon.png`, `app/apple-icon.png` (둘 다 존재)
- **분석:** 명시 + 컨벤션 둘 다 동작. metadata 측이 우선. 코드 단순화 가능
- **제안 (선택):** layout.tsx 의 `icons` 블록 제거 → Next.js 컨벤션만 사용

### L6. `components/ui/*` 일부 (7개) client component
- **측정값:** `components/ui/` 중 `"use client"` 파일 7개
- **분석:** shadcn/ui 패턴이라 강제 변경 어렵고 영향 미미. 그대로 유지 권장

### L7. `TransactionList.tsx:6` 의 stale TODO 주석
- **위치:** `components/ledger/TransactionList.tsx:6` `// TODO: 클릭 이벤트 로직 구현 필요`
- **분석:** 이미 `onItemClick` prop 으로 구현됨 → 주석이 stale
- **제안:** 주석 제거

---

## 5. 측정 도구 도입 권장 📊 (개선이 아닌 진단 도구)

### D1. `@next/bundle-analyzer`
- **현재:** 번들 크기 가시성 부재. 어떤 청크가 무거운지 측정 불가
- **도입:**
  ```bash
  npm i -D @next/bundle-analyzer
  ```
  ```ts
  // next.config.ts
  import bundleAnalyzer from '@next/bundle-analyzer';
  const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
  export default withBundleAnalyzer(nextConfig);
  ```
  ```bash
  ANALYZE=true npm run build
  ```
- **효과:** 페이지별 청크 크기·중복 모듈 식별 → 구체 최적화 항목 발굴 가능 (예: vaul / radix-ui 누수, 차트 라이브러리 메인 번들 진입 여부)

### D2. Lighthouse / web-vitals 측정
- **현재:** LCP / FCP / INP / CLS 수치 측정 안 됨
- **도입:** Chrome DevTools Lighthouse 탭 또는
  ```bash
  npx lighthouse https://<deployed-url> --view --preset=mobile
  ```
- **효과:** H1·H2·M5·M7 항목의 실제 영향도 정량화 가능. 우선순위 재조정 근거 마련

---

## 6. 최초 로딩 (Cold Start) 흐름 진단 🚦

```
GET /
  ↓
middleware (proxy.ts:45-47, getUser 스킵)
  ↓
app/page.tsx (getSession only, 쿠키 read)
  ↓
redirect /ledger/daily
  ↓
GET /ledger/daily
  ↓
middleware (proxy.ts:56, getUser 검증 — 만료 시 토큰 갱신)
  ↓
(protected)/layout.tsx (getClaims + user_deletion_requests 쿼리)
  ↓
daily/page.tsx (Promise.all: getLedgerMonthData + getReceiptAccessStatus)
  ↓
클라이언트 hydration → LedgerTabView (initialData 즉시 표시)
```

**추정 비용 (측정 권장):**
- middleware `getUser()`: 50-200ms (네트워크 라운드트립; 가드레일에 의해 변경 불가)
- `(protected)/layout.tsx` deletion 쿼리: 10-30ms (M1 항목)
- SSR Promise.all (transactions + categories + assets + recurring): 200-400ms (M7 영향 일부 포함)

**결론:** 이미 적용된 최적화 (preconnect, optimizePackageImports, dynamic import, SSR 병렬, 다층 캐시) 로 인해 cold start 자체의 추가 개선 여지는 M1/M5/M7 정도로 제한적. **사용자 가시 품질** 측면에서는 H1 (theme-color) + H2 (font) 가 cold start 첫 화면 인상에 큰 영향.

---

## 7. 핵심 권장 작업 순서

가장 적은 비용으로 가장 큰 효과를 얻는 순서:

1. **H1 theme-color** — 5분, 즉각 가시 효과 (status bar 색상)
2. **H2 font 의도 확정** — 사용자 결정 필요. 결정 후 작업 5-30분
3. **D1 bundle analyzer 도입** — 30분, 향후 개선 항목 발굴 기반
4. **D2 Lighthouse 측정** — 10분, 모든 ms 추정 항목 (M1/M5/M7) 의 실제 영향 정량화
5. **L1/L2/L7** — 짧은 시간에 처리 가능한 정리 항목
6. **M1/M2/M5/M7** — 측정 결과 (D2) 에 따라 우선순위 결정
7. **M3 maskable icon** — 아이콘 디자이너 작업 필요 시 별도 처리
8. **M4/M6** — 코드 위생, 짧은 시간에 처리

---

## 8. Beyond Scope — 보안 헤더 (성능 영역 외, 알림만)

- **검증:** `next.config.ts` 에 `async headers()` 함수 없음
- **누락 헤더:** Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy
- 사용자 요청은 성능 위주이지만 "개선할 점" 측면에서 한 줄 알림. 별도 보안 검토 권장 (이번 보고서 범위 외)

---

## 9. 다음 단계

이 보고서는 진단만 포함합니다. 실제 코드 수정은 별도 작업으로 분리합니다.

원하는 작업 방식을 선택하세요:
- **개별 항목 진행** — 예: "H1 부터 시작" / "H2 (b) 옵션으로 처리"
- **일괄 처리** — 모든 🔴 + 🟡 함께 처리
- **측정 후 결정** — D1/D2 먼저 도입해 기준선 확보 후 작업

---

> _이 보고서는 코드 베이스 정적 분석 결과이며, ms 단위 추정치는 모두 측정 후 검증이 필요합니다 (D2 Lighthouse 권장)._
