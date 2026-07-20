// 달력 보기 페이지 (LedgerTabView를 통해 접근 권장)
// daily와 동일하게 SSR prefetch가 적용되도록 DailyContent를 재사용한다
import DailyContent from "../daily/DailyContent";

export default function CalendarPage() {
  return <DailyContent />;
}
