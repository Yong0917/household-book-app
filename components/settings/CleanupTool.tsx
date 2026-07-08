"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, Sparkles, Wand2, Check, AlertTriangle, X, Loader2 } from "lucide-react";
import type { Category } from "@/lib/mock/types";
import {
  getCategoryMemoCounts,
  bulkRenameMemos,
  suggestMemoGroups,
  type MemoCount,
  type MemoGroup,
} from "@/lib/actions/cleanup";
import { matchMemos, type MemoRuleKind } from "@/lib/utils/memoMatch";
import { cn } from "@/lib/utils";

type Step = "category" | "build" | "preview" | "done";
type Mode = "rule" | "ai";

interface Props {
  initialCategories: Category[];
  isAdmin: boolean;
}

const RULE_KINDS: { value: MemoRuleKind; label: string }[] = [
  { value: "contains", label: "포함" },
  { value: "startsWith", label: "시작" },
  { value: "endsWith", label: "끝" },
  { value: "regex", label: "정규식" },
];

export function CleanupTool({ initialCategories, isAdmin }: Props) {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [memos, setMemos] = useState<MemoCount[]>([]);
  const [loadingMemos, setLoadingMemos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 확정된 그룹들 (대표 메모 → 묶인 원본 메모들)
  const [groups, setGroups] = useState<MemoGroup[]>([]);

  // 규칙 빌더 상태
  const [mode, setMode] = useState<Mode>("rule");
  const [ruleKind, setRuleKind] = useState<MemoRuleKind>("contains");
  const [query, setQuery] = useState("");
  const [ignoreSpace, setIgnoreSpace] = useState(false);
  const [canonical, setCanonical] = useState("");

  // AI 상태
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGroups, setAiGroups] = useState<MemoGroup[] | null>(null);

  // 적용 결과
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(null);

  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    memos.forEach((mc) => m.set(mc.description, mc.count));
    return m;
  }, [memos]);

  const usedMemos = useMemo(() => {
    const s = new Set<string>();
    groups.forEach((g) => g.members.forEach((mem) => s.add(mem)));
    return s;
  }, [groups]);

  const memoStrings = useMemo(() => memos.map((m) => m.description), [memos]);

  // 규칙 매칭 결과 (이미 다른 그룹에 쓰인 메모는 제외)
  const { matched, regexError } = useMemo(() => {
    const r = matchMemos(memoStrings, { kind: ruleKind, query, ignoreSpaceSymbols: ignoreSpace });
    return { matched: r.matched.filter((m) => !usedMemos.has(m)), regexError: r.regexError };
  }, [memoStrings, ruleKind, query, ignoreSpace, usedMemos]);

  const totalCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.members.reduce((s, m) => s + (countMap.get(m) ?? 0), 0), 0),
    [groups, countMap]
  );

  async function selectCategory(cat: Category) {
    setCategory(cat);
    setGroups([]);
    setAiGroups(null);
    setQuery("");
    setCanonical("");
    setError(null);
    setStep("build");
    setLoadingMemos(true);
    try {
      const data = await getCategoryMemoCounts(cat.id);
      setMemos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "메모를 불러오지 못했습니다");
    } finally {
      setLoadingMemos(false);
    }
  }

  function addRuleGroup() {
    if (matched.length < 1) return;
    const name = canonical.trim() || query.trim();
    if (!name) return;
    setGroups((prev) => [...prev, { canonical: name, members: matched }]);
    setQuery("");
    setCanonical("");
  }

  async function runAi() {
    if (!category) return;
    setAiLoading(true);
    setError(null);
    try {
      const available = memoStrings.filter((m) => !usedMemos.has(m));
      const suggested = await suggestMemoGroups(category.name, available);
      setAiGroups(suggested);
      if (suggested.length === 0) setError("추천할 그룹을 찾지 못했습니다");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 그룹핑 실패");
    } finally {
      setAiLoading(false);
    }
  }

  function addAiGroup(g: MemoGroup) {
    const members = g.members.filter((m) => !usedMemos.has(m));
    if (members.length < 1 || !g.canonical.trim()) return;
    setGroups((prev) => [...prev, { canonical: g.canonical.trim(), members }]);
    setAiGroups((prev) => (prev ? prev.filter((x) => x !== g) : prev));
  }

  function removeGroup(idx: number) {
    setGroups((prev) => prev.filter((_, i) => i !== idx));
  }

  async function apply() {
    if (!category || groups.length === 0) return;
    setApplying(true);
    setError(null);
    let updated = 0;
    let failed = 0;
    for (const g of groups) {
      try {
        const res = await bulkRenameMemos(category.id, g.members, g.canonical);
        updated += res.updated;
      } catch {
        failed += 1;
      }
    }
    // 여러 달 메모가 바뀌므로 가계부 캐시를 비워 다음 진입 시 재fetch
    try {
      localStorage.removeItem("ledger_cache_v1");
    } catch {
      /* localStorage 사용 불가 환경 무시 */
    }
    setResult({ updated, failed });
    setApplying(false);
    setStep("done");
  }

  function reset() {
    setStep("category");
    setCategory(null);
    setMemos([]);
    setGroups([]);
    setAiGroups(null);
    setQuery("");
    setCanonical("");
    setResult(null);
    setError(null);
    setMode("rule");
  }

  // ─── Step: 카테고리 선택 ───
  if (step === "category") {
    return (
      <div className="px-4 py-4">
        <p className="mb-3 px-1 text-[13px] text-muted-foreground/70 leading-relaxed">
          카테고리를 고르면 그 안의 비슷한 메모를 묶어 하나로 통일할 수 있어요.
        </p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat)}
              className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[14.5px] font-medium">{cat.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step: 그룹 구성 ───
  if (step === "build") {
    return (
      <div className="px-4 py-4 space-y-4">
        <StepHeader
          title={category?.name ?? ""}
          onBack={() => setStep("category")}
        />

        {loadingMemos ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : memos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground/60 py-16">
            이 카테고리에는 정리할 메모가 없어요.
          </p>
        ) : (
          <>
            {/* 모드 토글 */}
            <div className="flex gap-2">
              <ModeButton active={mode === "rule"} onClick={() => setMode("rule")} icon={<Wand2 className="h-3.5 w-3.5" />} label="규칙으로" />
              {isAdmin && (
                <ModeButton active={mode === "ai"} onClick={() => setMode("ai")} icon={<Sparkles className="h-3.5 w-3.5" />} label="AI 추천" />
              )}
            </div>

            {mode === "rule" ? (
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex gap-1.5">
                  {RULE_KINDS.map((k) => (
                    <button
                      key={k.value}
                      onClick={() => setRuleKind(k.value)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors",
                        ruleKind === k.value ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground/70"
                      )}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ruleKind === "regex" ? "정규식 패턴" : "찾을 텍스트"}
                  className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm outline-none border border-border/40 focus:border-primary/60"
                />
                {ruleKind !== "regex" && (
                  <label className="flex items-center gap-2 text-[13px] text-foreground/70 px-0.5">
                    <input type="checkbox" checked={ignoreSpace} onChange={(e) => setIgnoreSpace(e.target.checked)} />
                    공백·기호 무시
                  </label>
                )}
                {regexError && (
                  <p className="text-expense text-xs flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> 정규식이 올바르지 않습니다
                  </p>
                )}

                {/* 매칭 미리보기 */}
                {query.trim() !== "" && !regexError && (
                  <div className="rounded-xl bg-muted/30 p-3 space-y-2">
                    <p className="text-[12px] text-muted-foreground/70">
                      {matched.length > 0 ? `${matched.length}개 메모 매칭` : "매칭되는 메모 없음"}
                    </p>
                    {matched.length > 0 && (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {matched.map((m) => (
                            <span key={m} className="rounded-lg bg-background px-2 py-1 text-[12px] border border-border/50">
                              {m} <span className="text-muted-foreground/50">{countMap.get(m)}</span>
                            </span>
                          ))}
                        </div>
                        <input
                          value={canonical}
                          onChange={(e) => setCanonical(e.target.value)}
                          placeholder={`대표 메모 (기본: ${query.trim()})`}
                          className="w-full bg-background rounded-xl px-3 py-2 text-sm outline-none border border-border/40 focus:border-primary/60"
                        />
                        <button
                          onClick={addRuleGroup}
                          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold"
                        >
                          이 {matched.length}개를 묶기
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <button
                  onClick={runAi}
                  disabled={aiLoading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiLoading ? "분석 중..." : "AI로 그룹 추천받기"}
                </button>
                {aiGroups?.map((g, i) => (
                  <div key={i} className="rounded-xl bg-muted/30 p-3 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {g.members.map((m) => (
                        <span key={m} className="rounded-lg bg-background px-2 py-1 text-[12px] border border-border/50">
                          {m} <span className="text-muted-foreground/50">{countMap.get(m)}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground/50 flex-shrink-0" />
                      <input
                        value={g.canonical}
                        onChange={(e) =>
                          setAiGroups((prev) => prev?.map((x, xi) => (xi === i ? { ...x, canonical: e.target.value } : x)) ?? prev)
                        }
                        className="flex-1 bg-background rounded-lg px-2.5 py-1.5 text-[13px] outline-none border border-border/40 focus:border-primary/60"
                      />
                      <button
                        onClick={() => addAiGroup(g)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex-shrink-0"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-expense text-sm flex items-center gap-1.5 px-1">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
              </p>
            )}

            {/* 확정된 그룹 */}
            {groups.length > 0 && (
              <div className="space-y-2">
                <p className="px-1 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">묶은 그룹 {groups.length}</p>
                {groups.map((g, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card px-3.5 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold truncate">{g.canonical}</p>
                      <p className="text-[12px] text-muted-foreground/60 truncate">{g.members.join(", ")}</p>
                    </div>
                    <button onClick={() => removeGroup(i)} className="p-1 rounded-lg hover:bg-muted flex-shrink-0" aria-label="그룹 삭제">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep("preview")}
              disabled={groups.length === 0}
              className={cn(
                "w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold transition-opacity",
                groups.length === 0 && "opacity-40"
              )}
            >
              다음: 미리보기
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── Step: 미리보기 ───
  if (step === "preview") {
    return (
      <div className="px-4 py-4 space-y-4">
        <StepHeader title="미리보기" onBack={() => setStep("build")} />
        <p className="px-1 text-[13px] text-muted-foreground/70">
          아래 <span className="font-semibold text-foreground">{totalCount}건</span>의 메모가 바뀝니다. 되돌릴 수 없어요.
        </p>
        <div className="space-y-2">
          {groups.map((g, i) => {
            const cnt = g.members.reduce((s, m) => s + (countMap.get(m) ?? 0), 0);
            return (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {g.members.map((m) => (
                    <span key={m} className="rounded-lg bg-muted/50 px-2 py-1 text-[12px] line-through text-muted-foreground/70">
                      {m} <span className="opacity-60">{countMap.get(m)}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <span className="text-muted-foreground/50">→</span>
                  <span>{g.canonical}</span>
                  <span className="text-[12px] font-normal text-muted-foreground/60">{cnt}건</span>
                </div>
              </div>
            );
          })}
        </div>
        {error && (
          <p className="text-expense text-sm flex items-center gap-1.5 px-1">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </p>
        )}
        <button
          onClick={apply}
          disabled={applying}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {applying && <Loader2 className="h-4 w-4 animate-spin" />}
          {applying ? "적용 중..." : `${totalCount}건 일괄 변경`}
        </button>
      </div>
    );
  }

  // ─── Step: 완료 ───
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-income/15 flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-income" />
          </div>
          <div>
            <p className="text-[15px] font-semibold">{result?.updated.toLocaleString()}건 정리 완료</p>
            {(result?.failed ?? 0) > 0 && (
              <p className="text-xs text-expense mt-0.5">{result?.failed}개 그룹 적용 실패</p>
            )}
          </div>
        </div>
      </div>
      <button onClick={reset} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold">
        다른 카테고리 정리
      </button>
    </div>
  );
}

function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-muted transition-colors" aria-label="뒤로">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h2 className="text-[15px] font-bold">{title}</h2>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors",
        active ? "bg-foreground text-background" : "bg-muted/60 text-foreground/70"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
