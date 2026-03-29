import {
  KST_OFFSET,
  getMonthRangeUTC,
  getNowKST,
  utcIsoToKST,
  kstToUTC,
} from "../timezone";

describe("KST_OFFSET", () => {
  it("9시간(밀리초)이어야 한다", () => {
    expect(KST_OFFSET).toBe(9 * 60 * 60 * 1000);
  });
});

describe("getMonthRangeUTC", () => {
  it("2024년 1월의 UTC 범위를 반환한다", () => {
    const { start, end } = getMonthRangeUTC(2024, 1);
    // KST 2024-01-01 00:00 = UTC 2023-12-31 15:00
    expect(start).toBe("2023-12-31T15:00:00.000Z");
    // KST 2024-02-01 00:00 = UTC 2024-01-31 15:00
    expect(end).toBe("2024-01-31T15:00:00.000Z");
  });

  it("2024년 12월의 UTC 범위를 반환한다", () => {
    const { start, end } = getMonthRangeUTC(2024, 12);
    // KST 2024-12-01 00:00 = UTC 2024-11-30 15:00
    expect(start).toBe("2024-11-30T15:00:00.000Z");
    // KST 2025-01-01 00:00 = UTC 2024-12-31 15:00
    expect(end).toBe("2024-12-31T15:00:00.000Z");
  });

  it("start가 end보다 앞선 시각이어야 한다", () => {
    const { start, end } = getMonthRangeUTC(2024, 6);
    expect(new Date(start).getTime()).toBeLessThan(new Date(end).getTime());
  });

  it("end - start가 정확히 해당 월의 일수(밀리초)와 같아야 한다", () => {
    // 2024년 2월은 윤년 → 29일
    const feb = getMonthRangeUTC(2024, 2);
    const diff = new Date(feb.end).getTime() - new Date(feb.start).getTime();
    expect(diff).toBe(29 * 24 * 60 * 60 * 1000);

    // 2023년 2월은 평년 → 28일
    const feb2023 = getMonthRangeUTC(2023, 2);
    const diff2023 = new Date(feb2023.end).getTime() - new Date(feb2023.start).getTime();
    expect(diff2023).toBe(28 * 24 * 60 * 60 * 1000);

    // 7월은 31일
    const jul = getMonthRangeUTC(2024, 7);
    const diffJul = new Date(jul.end).getTime() - new Date(jul.start).getTime();
    expect(diffJul).toBe(31 * 24 * 60 * 60 * 1000);
  });
});

describe("getNowKST", () => {
  it("Date 인스턴스를 반환해야 한다", () => {
    expect(getNowKST()).toBeInstanceOf(Date);
  });

  it("UTC 기준으로 9시간 앞선 시각이어야 한다", () => {
    const before = Date.now();
    const kst = getNowKST();
    const after = Date.now();

    const kstMs = kst.getTime();
    expect(kstMs).toBeGreaterThanOrEqual(before + KST_OFFSET);
    expect(kstMs).toBeLessThanOrEqual(after + KST_OFFSET);
  });

  it("getUTCFullYear/Month/Date로 KST 날짜를 추출할 수 있어야 한다", () => {
    // UTC 2024-06-14 22:00 → KST 2024-06-15 07:00
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-14T22:00:00.000Z"));

    const kst = getNowKST();
    expect(kst.getUTCFullYear()).toBe(2024);
    expect(kst.getUTCMonth() + 1).toBe(6);
    expect(kst.getUTCDate()).toBe(15); // UTC 22시 + 9h = 다음날 7시

    jest.useRealTimers();
  });
});

describe("utcIsoToKST", () => {
  it("UTC ISO 문자열을 KST Date로 변환해야 한다", () => {
    // UTC 2024-01-15 00:00 → KST 2024-01-15 09:00
    const kst = utcIsoToKST("2024-01-15T00:00:00.000Z");
    expect(kst.getUTCHours()).toBe(9);
    expect(kst.getUTCDate()).toBe(15);
  });

  it("자정 직전(UTC 15:00) → KST 다음날 자정이 되어야 한다", () => {
    // UTC 2024-06-14 15:00:00 = KST 2024-06-15 00:00:00
    const kst = utcIsoToKST("2024-06-14T15:00:00.000Z");
    expect(kst.getUTCDate()).toBe(15);
    expect(kst.getUTCHours()).toBe(0);
    expect(kst.getUTCMinutes()).toBe(0);
  });

  it("KST 날짜/시간 문자열로 정확히 포맷되어야 한다", () => {
    const kst = utcIsoToKST("2024-03-01T10:30:00.000Z");
    const dateStr = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, "0")}-${String(kst.getUTCDate()).padStart(2, "0")}`;
    const timeStr = `${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;
    // UTC 10:30 + 9h = KST 19:30
    expect(dateStr).toBe("2024-03-01");
    expect(timeStr).toBe("19:30");
  });
});

describe("kstToUTC", () => {
  it("KST 날짜/시간을 UTC ISO 문자열로 변환해야 한다", () => {
    // KST 2024-01-15 09:00 → UTC 2024-01-15 00:00
    const utc = kstToUTC(2024, 1, 15, 9, 0);
    expect(utc).toBe("2024-01-15T00:00:00.000Z");
  });

  it("KST 00:00 → UTC 전날 15:00이어야 한다", () => {
    // KST 2024-06-15 00:00 → UTC 2024-06-14 15:00
    const utc = kstToUTC(2024, 6, 15, 0, 0);
    expect(utc).toBe("2024-06-14T15:00:00.000Z");
  });

  it("utcIsoToKST의 역함수가 되어야 한다 (왕복 변환)", () => {
    const original = "2024-09-20T06:30:00.000Z";
    const kst = utcIsoToKST(original);
    const backToUtc = kstToUTC(
      kst.getUTCFullYear(),
      kst.getUTCMonth() + 1,
      kst.getUTCDate(),
      kst.getUTCHours(),
      kst.getUTCMinutes()
    );
    expect(backToUtc).toBe(original);
  });

  it("getMonthRangeUTC의 start와 동일해야 한다 (월 시작 자정 기준)", () => {
    // KST 2024-03-01 00:00 = getMonthRangeUTC(2024, 3).start
    const utc = kstToUTC(2024, 3, 1, 0, 0);
    expect(utc).toBe(getMonthRangeUTC(2024, 3).start);
  });
});
