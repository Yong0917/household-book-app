// Streaming SSR: AppSplash를 즉시 전송하고, 데이터 fetch가 끝나면 DailyContent로 교체.
import { Suspense } from "react";
import AppSplash from "@/components/AppSplash";
import DailyContent from "./DailyContent";

export default function DailyPage() {
  return (
    <Suspense fallback={<AppSplash />}>
      <DailyContent />
    </Suspense>
  );
}
