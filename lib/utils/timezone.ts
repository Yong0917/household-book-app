// KST(UTC+9) 타임존 변환 유틸리티

export const KST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * KST 기준 특정 월의 시작과 끝을 UTC ISO 문자열로 반환
 * DB 쿼리의 날짜 범위 필터에 사용
 */
export function getMonthRangeUTC(
  year: number,
  month: number // 1~12
): { start: string; end: string } {
  return {
    start: new Date(Date.UTC(year, month - 1, 1) - KST_OFFSET).toISOString(),
    end: new Date(Date.UTC(year, month, 1) - KST_OFFSET).toISOString(),
  };
}

/**
 * 현재 시각을 KST 기준 Date로 반환
 * getUTCFullYear(), getUTCMonth(), getUTCDate() 등으로 KST 날짜 추출
 */
export function getNowKST(): Date {
  return new Date(Date.now() + KST_OFFSET);
}

/**
 * UTC ISO 문자열을 KST 기준 Date로 변환
 * getUTCFullYear(), getUTCHours() 등으로 KST 날짜/시간 추출
 */
export function utcIsoToKST(utcIso: string): Date {
  return new Date(new Date(utcIso).getTime() + KST_OFFSET);
}

/**
 * KST 날짜/시간을 UTC ISO 문자열로 변환
 * 엑셀 임포트 시 KST 입력값을 DB 저장용 UTC로 변환할 때 사용
 */
export function kstToUTC(
  year: number,
  month: number, // 1~12
  day: number,
  hours: number,
  minutes: number
): string {
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes) - KST_OFFSET
  ).toISOString();
}
