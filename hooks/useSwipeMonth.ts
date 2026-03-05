import { useRef } from "react";
import { addMonths, subMonths } from "date-fns";

// 좌우 스와이프로 월 이동하는 훅
export function useSwipeMonth(
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>,
  enabled = true
) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!enabled) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // 수평 이동이 50px 미만이거나 수직 이동이 더 큰 경우 무시
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx > 0) {
      setCurrentMonth((prev) => subMonths(prev, 1));
    } else {
      setCurrentMonth((prev) => addMonths(prev, 1));
    }
  };

  return { onTouchStart, onTouchEnd };
}
