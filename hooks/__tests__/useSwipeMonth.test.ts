import { renderHook } from "@testing-library/react";
import { addMonths, subMonths } from "date-fns";
import type React from "react";
import { useSwipeMonth } from "../useSwipeMonth";

type TouchPoint = { clientX: number; clientY: number };

function touchStart(point: TouchPoint): React.TouchEvent {
  return {
    touches: [point],
  } as unknown as React.TouchEvent;
}

function touchEnd(point: TouchPoint): React.TouchEvent {
  return {
    changedTouches: [point],
  } as unknown as React.TouchEvent;
}

describe("useSwipeMonth", () => {
  const BASE = new Date("2024-06-15T00:00:00.000Z");

  it("오른쪽 스와이프(dx > 0)는 이전 달로 이동해야 한다", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth));

    result.current.onTouchStart(touchStart({ clientX: 100, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 200, clientY: 100 }));

    expect(setCurrentMonth).toHaveBeenCalledTimes(1);
    const updater = setCurrentMonth.mock.calls[0][0] as (prev: Date) => Date;
    expect(updater(BASE).getTime()).toBe(subMonths(BASE, 1).getTime());
  });

  it("왼쪽 스와이프(dx < 0)는 다음 달로 이동해야 한다", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth));

    result.current.onTouchStart(touchStart({ clientX: 200, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 100, clientY: 100 }));

    expect(setCurrentMonth).toHaveBeenCalledTimes(1);
    const updater = setCurrentMonth.mock.calls[0][0] as (prev: Date) => Date;
    expect(updater(BASE).getTime()).toBe(addMonths(BASE, 1).getTime());
  });

  it("수평 이동이 50px 미만이면 월을 변경하지 않는다", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth));

    result.current.onTouchStart(touchStart({ clientX: 100, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 140, clientY: 100 })); // dx=40 < 50

    expect(setCurrentMonth).not.toHaveBeenCalled();
  });

  it("수직 이동이 수평 이동보다 크면 월을 변경하지 않는다 (세로 스크롤로 간주)", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth));

    result.current.onTouchStart(touchStart({ clientX: 100, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 160, clientY: 200 })); // dx=60, dy=100

    expect(setCurrentMonth).not.toHaveBeenCalled();
  });

  it("enabled=false 면 어떤 스와이프도 무시해야 한다", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth, false));

    result.current.onTouchStart(touchStart({ clientX: 100, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 300, clientY: 100 })); // 충분한 스와이프

    expect(setCurrentMonth).not.toHaveBeenCalled();
  });

  it("정확히 50px 경계값은 월을 변경한다 (조건이 |dx| < 50 이므로 50은 통과)", () => {
    const setCurrentMonth = jest.fn();
    const { result } = renderHook(() => useSwipeMonth(setCurrentMonth));

    result.current.onTouchStart(touchStart({ clientX: 100, clientY: 100 }));
    result.current.onTouchEnd(touchEnd({ clientX: 150, clientY: 100 })); // dx=50

    // `Math.abs(dx) < 50` → 50 은 통과(false), 즉 월 변경 발생
    expect(setCurrentMonth).toHaveBeenCalledTimes(1);
  });
});
