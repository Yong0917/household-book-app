import { applyChangeToEntry, transactionMonthKey, type CacheEntry } from "../ledgerCache";
import type { Transaction, RecurringTransaction } from "@/lib/mock/types";

// 타임존과 무관하게 월이 유지되도록 월 중순 시각 사용
function tx(id: string, transactionAt: string, amount = 1000): Transaction {
  return {
    id,
    type: "expense",
    amount,
    categoryId: "c1",
    assetId: "a1",
    transactionAt,
  };
}

const recurring: RecurringTransaction = {
  id: "r1",
  type: "expense",
  amount: 50000,
  categoryId: "c1",
  assetId: "a1",
  dayOfMonth: 15,
  isActive: true,
};

function entry(transactions: Transaction[], rec: RecurringTransaction[] = []): CacheEntry {
  return { transactions, categories: [], assets: [], recurring: rec };
}

const MONTH = transactionMonthKey("2026-07-15T12:00:00.000Z");

describe("applyChangeToEntry", () => {
  const t1 = tx("t1", "2026-07-20T12:00:00.000Z");
  const t2 = tx("t2", "2026-07-15T12:00:00.000Z");
  const t3 = tx("t3", "2026-07-10T12:00:00.000Z");

  it("create: transaction_at DESC 정렬 위치에 삽입한다", () => {
    const created = tx("new", "2026-07-17T12:00:00.000Z");
    const result = applyChangeToEntry(
      entry([t1, t2, t3]),
      { kind: "create", transaction: created },
      MONTH
    );
    expect(result.transactions.map((t) => t.id)).toEqual(["t1", "new", "t2", "t3"]);
  });

  it("create: 가장 최신 거래는 맨 앞, 가장 오래된 거래는 맨 뒤에 삽입한다", () => {
    const newest = tx("newest", "2026-07-25T12:00:00.000Z");
    const oldest = tx("oldest", "2026-07-05T12:00:00.000Z");
    const afterNewest = applyChangeToEntry(entry([t1, t3]), { kind: "create", transaction: newest }, MONTH);
    const afterOldest = applyChangeToEntry(entry([t1, t3]), { kind: "create", transaction: oldest }, MONTH);
    expect(afterNewest.transactions[0].id).toBe("newest");
    expect(afterOldest.transactions[2].id).toBe("oldest");
  });

  it("create: 다른 월 거래는 목록에 추가하지 않는다", () => {
    const otherMonth = tx("other", "2026-08-15T12:00:00.000Z");
    const result = applyChangeToEntry(
      entry([t1]),
      { kind: "create", transaction: otherMonth },
      MONTH
    );
    expect(result.transactions.map((t) => t.id)).toEqual(["t1"]);
  });

  it("create: recurringId가 있으면 미처리 고정비에서 제거한다", () => {
    const created = tx("new", "2026-07-15T12:00:00.000Z");
    const result = applyChangeToEntry(
      entry([t1], [recurring]),
      { kind: "create", transaction: created, recurringId: "r1" },
      MONTH
    );
    expect(result.recurring).toEqual([]);
    expect(result.transactions.map((t) => t.id)).toContain("new");
  });

  it("update: 같은 월이면 교체 후 정렬 위치를 유지한다", () => {
    const updated = tx("t3", "2026-07-22T12:00:00.000Z", 9999);
    const result = applyChangeToEntry(
      entry([t1, t2, t3]),
      { kind: "update", transaction: updated },
      MONTH
    );
    expect(result.transactions.map((t) => t.id)).toEqual(["t3", "t1", "t2"]);
    expect(result.transactions[0].amount).toBe(9999);
  });

  it("update: 다른 월로 이동하면 현재 월 목록에서 제거한다", () => {
    const moved = tx("t2", "2026-06-15T12:00:00.000Z");
    const result = applyChangeToEntry(
      entry([t1, t2, t3]),
      { kind: "update", transaction: moved },
      MONTH
    );
    expect(result.transactions.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("update: 현재 월에 없던 거래(검색에서 수정)면 목록을 바꾸지 않는다", () => {
    const otherMonth = tx("elsewhere", "2026-05-15T12:00:00.000Z");
    const result = applyChangeToEntry(
      entry([t1, t2]),
      { kind: "update", transaction: otherMonth },
      MONTH
    );
    expect(result.transactions.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("delete: 해당 거래만 제거한다", () => {
    const result = applyChangeToEntry(entry([t1, t2, t3]), { kind: "delete", id: "t2" }, MONTH);
    expect(result.transactions.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("skip: 미처리 고정비에서 제거하고 거래 목록은 유지한다", () => {
    const result = applyChangeToEntry(
      entry([t1], [recurring]),
      { kind: "skip", recurringId: "r1" },
      MONTH
    );
    expect(result.recurring).toEqual([]);
    expect(result.transactions.map((t) => t.id)).toEqual(["t1"]);
  });

  it("categories/assets는 그대로 유지한다", () => {
    const base = entry([t1]);
    const result = applyChangeToEntry(base, { kind: "delete", id: "t1" }, MONTH);
    expect(result.categories).toBe(base.categories);
    expect(result.assets).toBe(base.assets);
  });
});
