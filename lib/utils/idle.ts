// 브라우저 유휴 시점에 콜백 실행 (미지원 환경은 setTimeout 폴백). 취소 함수를 반환한다.
// 첫 화면 렌더·데이터 요청과 경쟁하지 않아도 되는 후순위 작업에 사용한다.
export function scheduleIdle(cb: () => void, timeout = 3000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 1500);
  return () => window.clearTimeout(id);
}
