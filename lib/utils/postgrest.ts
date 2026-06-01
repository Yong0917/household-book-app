// PostgREST 쿼리 유틸리티

/**
 * PostgREST `.or()` 필터의 ilike 값으로 안전하게 쓸 수 있는 패턴 문자열을 만든다.
 *
 * `.or("col.ilike.<value>,...")` 형태에서 값에 쉼표·괄호 같은 예약문자가 들어가면
 * 필터 파싱이 깨진다(예: "커피, 라떼"). 값을 큰따옴표로 감싸고 내부의 `"`·`\`를
 * 이스케이프하면 예약문자를 리터럴로 처리한다. `%` 와일드카드 동작은 그대로 유지된다.
 */
export function orIlikePattern(query: string): string {
  const escaped = query.replace(/["\\]/g, "\\$&");
  return `"%${escaped}%"`;
}
