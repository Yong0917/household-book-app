"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Upload, X, FileSpreadsheet, Check, AlertTriangle } from "lucide-react";
import { Drawer } from "vaul";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

type Step = "upload" | "mapping" | "importing" | "result";

interface ParsedFile {
  headers: string[];
  rows: Record<string, unknown>[];
}

interface ColMap {
  date: string;
  time: string;
  type: string;
  amount: string;
  category: string;
  asset: string;
  memo: string;
  incomeVal: string;
  expenseVal: string;
}

interface ImportResult {
  success: number;
  skipped: number;
  categoryFallbacks: number;
  assetFallbacks: number;
}

const EMPTY_MAP: ColMap = {
  date: "", time: "", type: "", amount: "",
  category: "", asset: "", memo: "",
  incomeVal: "", expenseVal: "",
};

function getUniqueVals(rows: Record<string, unknown>[], col: string): string[] {
  const vals = new Set<string>();
  for (const row of rows.slice(0, 200)) {
    const v = String(row[col] ?? "").trim();
    if (v) vals.add(v);
    if (vals.size >= 10) break;
  }
  return [...vals];
}

function autoDetectTypeVals(uniqueVals: string[]): { incomeVal: string; expenseVal: string } {
  let incomeVal = "";
  let expenseVal = "";
  for (const v of uniqueVals) {
    const lv = v.toLowerCase();
    if (!incomeVal && (lv === "수입" || lv === "income" || lv === "+")) incomeVal = v;
    if (!expenseVal && (lv === "지출" || lv === "expense" || lv === "-")) expenseVal = v;
  }
  return { incomeVal, expenseVal };
}

// 헤더를 보고 앱 필드 자동 추측
function autoDetectCols(headers: string[]): Partial<ColMap> {
  const map: Partial<ColMap> = {};
  for (const h of headers) {
    const lh = h.toLowerCase();
    if (!map.date && (h === "날짜" || lh === "date" || lh === "일자")) map.date = h;
    else if (!map.time && (h === "시간" || lh === "time")) map.time = h;
    else if (!map.type && (h === "유형" || lh === "type" || lh === "구분")) map.type = h;
    else if (!map.amount && (h === "금액" || lh === "amount" || lh === "금액(원)")) map.amount = h;
    else if (!map.category && (h === "분류" || lh === "category" || lh === "카테고리")) map.category = h;
    else if (!map.asset && (h === "자산" || lh === "asset" || lh === "계좌")) map.asset = h;
    else if (!map.memo && (h === "메모" || lh === "memo" || lh === "내용" || lh === "description")) map.memo = h;
  }
  return map;
}

interface FieldRowProps {
  label: string;
  required?: boolean;
  value: string;
  headers: string[];
  onChange: (v: string) => void;
}

function FieldRow({ label, required, value, headers, onChange }: FieldRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
      <span className="text-[13.5px] w-14 flex-shrink-0 text-foreground/80">
        {label}
        {required && <span className="text-expense ml-0.5">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-border/40 focus:border-primary/60"
      >
        <option value="">{required ? "선택하세요" : "(없음)"}</option>
        {headers.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
    </div>
  );
}

export function ImportButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [colMap, setColMap] = useState<ColMap>(EMPTY_MAP);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Drawer 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("upload");
        setFile(null);
        setColMap(EMPTY_MAP);
        setResult(null);
        setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 뒤로가기 제스처로 Drawer 닫기
  useEffect(() => {
    if (!open) return;
    history.pushState(null, "", window.location.href);
    const handlePop = () => setOpen(false);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [open]);

  // 유형 열의 고유값 목록
  const typeUniqueVals = useMemo(
    () => (file && colMap.type ? getUniqueVals(file.rows, colMap.type) : []),
    [file, colMap.type]
  );

  function handleFileChange(f: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: "array", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: "",
          raw: true,
        });
        if (raw.length === 0) {
          setError("데이터가 없습니다");
          return;
        }
        const headers = Object.keys(raw[0]);
        const detected = autoDetectCols(headers);
        const newMap = { ...EMPTY_MAP, ...detected };

        // 유형 열이 자동감지됐으면 값도 자동감지
        if (newMap.type) {
          const uniqueVals = getUniqueVals(raw, newMap.type);
          const { incomeVal, expenseVal } = autoDetectTypeVals(uniqueVals);
          newMap.incomeVal = incomeVal;
          newMap.expenseVal = expenseVal;
        }

        setFile({ headers, rows: raw });
        setColMap(newMap);
        setStep("mapping");
      } catch {
        setError("파일을 읽을 수 없습니다");
      }
    };
    reader.readAsArrayBuffer(f);
  }

  function handleTypeColChange(newCol: string) {
    const uniqueVals = file ? getUniqueVals(file.rows, newCol) : [];
    const { incomeVal, expenseVal } = autoDetectTypeVals(uniqueVals);
    setColMap((prev) => ({ ...prev, type: newCol, incomeVal, expenseVal }));
  }

  const canProceed =
    !!colMap.date &&
    !!colMap.type &&
    !!colMap.amount &&
    !!colMap.incomeVal &&
    !!colMap.expenseVal;

  async function handleImport() {
    if (!file || !canProceed) return;
    setStep("importing");
    setError(null);
    try {
      const res = await fetch("/api/import/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: file.rows, mapping: colMap }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "가져오기 실패");
      }
      const data: ImportResult = await res.json();
      setResult(data);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
      setStep("mapping");
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <Upload className="h-4 w-4 text-foreground/70" />
            </div>
            <span className="text-[14.5px] font-medium">엑셀 가져오기</span>
          </div>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-background border-t border-border max-h-[90vh]">
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <Drawer.Title className="text-[16px] font-bold">
              {step === "upload" && "엑셀 가져오기"}
              {step === "mapping" && "열 매핑"}
              {step === "importing" && "가져오는 중..."}
              {step === "result" && "가져오기 완료"}
            </Drawer.Title>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* ─── Step 1: 파일 업로드 ─── */}
          {step === "upload" && (
            <div className="px-4 pb-8 space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border/60 rounded-2xl py-14 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-muted/20 transition-colors"
              >
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/70">파일을 선택하세요</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">.xlsx · .xls · .csv 지원</p>
                </div>
              </button>
              {error && (
                <div className="flex items-center gap-2 text-expense text-sm px-1">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <p className="text-xs text-muted-foreground/50 text-center px-2">
                이 앱에서 내보낸 파일은 열이 자동으로 매핑됩니다
              </p>
            </div>
          )}

          {/* ─── Step 2: 열 매핑 ─── */}
          {step === "mapping" && file && (
            <div className="overflow-y-auto pb-8">
              <p className="px-5 mb-3 text-xs text-muted-foreground/60">
                {file.rows.length.toLocaleString()}개 행 감지됨 · 각 열이 어떤 항목인지 지정하세요
              </p>

              {/* 열 매핑 */}
              <div className="mx-4 rounded-2xl border border-border/60 bg-card px-4">
                <FieldRow
                  label="날짜" required
                  value={colMap.date} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, date: v }))}
                />
                <FieldRow
                  label="시간"
                  value={colMap.time} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, time: v }))}
                />
                <FieldRow
                  label="유형" required
                  value={colMap.type} headers={file.headers}
                  onChange={handleTypeColChange}
                />
                <FieldRow
                  label="금액" required
                  value={colMap.amount} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, amount: v }))}
                />
                <FieldRow
                  label="분류"
                  value={colMap.category} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, category: v }))}
                />
                <FieldRow
                  label="자산"
                  value={colMap.asset} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, asset: v }))}
                />
                <FieldRow
                  label="메모"
                  value={colMap.memo} headers={file.headers}
                  onChange={(v) => setColMap((p) => ({ ...p, memo: v }))}
                />
              </div>

              {/* 유형 값 지정 */}
              {colMap.type && typeUniqueVals.length > 0 && (
                <div className="mx-4 mt-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 space-y-3">
                  <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                    유형 열 값 매핑
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-income font-semibold w-10">수입</span>
                    <select
                      value={colMap.incomeVal}
                      onChange={(e) => setColMap((p) => ({ ...p, incomeVal: e.target.value }))}
                      className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-border/40 focus:border-primary/60"
                    >
                      <option value="">선택하세요</option>
                      {typeUniqueVals.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-expense font-semibold w-10">지출</span>
                    <select
                      value={colMap.expenseVal}
                      onChange={(e) => setColMap((p) => ({ ...p, expenseVal: e.target.value }))}
                      className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none border border-border/40 focus:border-primary/60"
                    >
                      <option value="">선택하세요</option>
                      {typeUniqueVals.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 안내 */}
              <p className="mx-4 mt-3 text-[11px] text-muted-foreground/50 leading-relaxed">
                분류·자산은 이름으로 일치 여부를 확인합니다. 일치하지 않으면 기본값이 적용됩니다.
              </p>

              {error && (
                <div className="flex items-center gap-2 text-expense text-sm px-5 mt-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="px-4 mt-4">
                <button
                  onClick={handleImport}
                  disabled={!canProceed}
                  className={cn(
                    "w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold transition-opacity",
                    !canProceed && "opacity-40"
                  )}
                >
                  {file.rows.length.toLocaleString()}개 행 가져오기
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: 처리 중 ─── */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">데이터를 처리하는 중...</p>
            </div>
          )}

          {/* ─── Step 4: 결과 ─── */}
          {step === "result" && result && (
            <div className="px-4 pb-8 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-income/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-income" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold">
                      {result.success.toLocaleString()}건 가져오기 완료
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {result.skipped}건 건너뜀 (날짜·금액 파싱 불가)
                      </p>
                    )}
                  </div>
                </div>

                {(result.categoryFallbacks > 0 || result.assetFallbacks > 0) && (
                  <div className="pl-12 space-y-1">
                    {result.categoryFallbacks > 0 && (
                      <p className="text-xs text-muted-foreground/60">
                        분류 미일치 {result.categoryFallbacks}건 → 기본 분류 적용
                      </p>
                    )}
                    {result.assetFallbacks > 0 && (
                      <p className="text-xs text-muted-foreground/60">
                        자산 미일치 {result.assetFallbacks}건 → 기본 자산 적용
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold"
              >
                완료
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
