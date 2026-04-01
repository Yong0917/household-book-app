"use client";

// 거래 등록/수정 바텀 시트 컴포넌트 (vaul Drawer + React Hook Form + Zod)
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "vaul";
import { format, parseISO } from "date-fns";
import { X, Plus, ScanLine, Loader2 } from "lucide-react";
import { ReceiptScanModal } from "@/components/ledger/ReceiptScanModal";
import Link from "next/link";
import { compressImage } from "@/lib/utils/imageUtils";
import type { ReceiptAnalysisResult } from "@/app/api/analyze-receipt/route";
import { requestReceiptAccess } from "@/lib/actions/receiptAccess";
import type { AccessStatus } from "@/lib/actions/receiptAccess";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MemoInput } from "@/components/ledger/MemoInput";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/actions/transactions";
import type { Transaction, Category, Asset, RecurringTransaction } from "@/lib/mock/types";

// 폼 검증 스키마
const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number({ message: "금액을 입력하세요" }).min(1, "금액을 입력하세요"),
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
  assetId: z.string().min(1, "자산을 선택하세요"),
  date: z.string().min(1, "날짜를 입력하세요"),
  time: z.string().min(1, "시간을 입력하세요"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  transaction?: Transaction;
  initialDate?: string; // 'yyyy-MM-dd' 형식
  initialRecurring?: RecurringTransaction; // 고정비에서 열릴 때 pre-fill
  categories: Category[];
  assets: Asset[];
  onSuccess?: () => void; // 저장/삭제 성공 후 콜백
  receiptAccessStatus?: AccessStatus; // 영수증 스캔 접근 상태
}

// select 공통 스타일
const selectClass =
  "border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13.5px] focus:outline-none focus:ring-1 focus:ring-ring appearance-none";

// 키보드 내리기 (select/date/time 탭 시 이전 포커스 해제)
const dismissKeyboard = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};


export function TransactionSheet({
  open,
  onOpenChange,
  mode,
  transaction,
  initialDate,
  initialRecurring,
  categories,
  assets,
  onSuccess,
  receiptAccessStatus = "none",
}: TransactionSheetProps) {
  // 고정비 day_of_month 기준 날짜 계산 (말일 초과 시 클램프)
  const getRecurringDate = (dayOfMonth: number): string => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const day = Math.min(dayOfMonth, lastDay);
    return format(new Date(now.getFullYear(), now.getMonth(), day), "yyyy-MM-dd");
  };

  // 기본값 계산
  const getDefaultValues = (): FormData => {
    if (mode === "edit" && transaction) {
      const dt = parseISO(transaction.transactionAt);
      return {
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        assetId: transaction.assetId,
        date: format(dt, "yyyy-MM-dd"),
        time: format(dt, "HH:mm"),
        description: transaction.description ?? "",
      };
    }
    // 고정비 pre-fill
    if (initialRecurring) {
      return {
        type: initialRecurring.type,
        amount: initialRecurring.amount,
        categoryId: initialRecurring.categoryId,
        assetId: initialRecurring.assetId,
        date: getRecurringDate(initialRecurring.dayOfMonth),
        time: "00:00",
        description: initialRecurring.description ?? "",
      };
    }
    return {
      type: "expense",
      amount: undefined as unknown as number,
      categoryId: "",
      assetId: "",
      date: initialDate ?? format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      description: "",
    };
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(receiptAccessStatus);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showAccessTooltip, setShowAccessTooltip] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // 뒤로가기 핸들러 내 스캔 메뉴 상태 동기화용 (stale closure 방지)
  const showScanMenuRef = useRef(false);
  const openScanMenu = () => { showScanMenuRef.current = true; setShowScanMenu(true); };
  const closeScanMenu = () => { showScanMenuRef.current = false; setShowScanMenu(false); };

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      await requestReceiptAccess();
      setAccessStatus("pending");
    } catch {
      // 이미 요청한 경우 등 무시
      setAccessStatus("pending");
    } finally {
      setIsRequesting(false);
      setShowAccessTooltip(false);
    }
  };
  const contentRef = useRef<HTMLDivElement>(null);

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = "";

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const compressed = await compressImage(file, 1200, 0.8);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });

      const res = await fetch("/api/analyze-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "분석 실패");
      }

      const result: ReceiptAnalysisResult = await res.json();

      if (result.amount) {
        setDisplayAmount(result.amount.toLocaleString("ko-KR"));
        setValue("amount", result.amount, { shouldValidate: true });
      }
      if (result.description) {
        setValue("description", result.description, { shouldValidate: true });
      }
      if (result.date) {
        setValue("date", result.date, { shouldValidate: true });
      }
      if (result.type) {
        setValue("type", result.type);
        setValue("categoryId", "");
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "영수증 인식에 실패했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // iOS에서 키보드 dismiss 후 visualViewport가 늦게 업데이트되는 문제 대응
  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateHeight = () => {
      if (contentRef.current) {
        contentRef.current.style.height = `${viewport.height}px`;
        contentRef.current.style.top = `${viewport.offsetTop}px`;
      }
    };

    viewport.addEventListener("resize", updateHeight);
    viewport.addEventListener("scroll", updateHeight);
    updateHeight();

    return () => {
      viewport.removeEventListener("resize", updateHeight);
      viewport.removeEventListener("scroll", updateHeight);
    };
  }, [open]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // 금액 표시용 state (콤마 포함 문자열)
  const [displayAmount, setDisplayAmount] = useState<string>(() => {
    if (mode === "edit" && transaction) return transaction.amount.toLocaleString("ko-KR");
    if (initialRecurring) return initialRecurring.amount.toLocaleString("ko-KR");
    return "";
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") {
      setDisplayAmount("");
      setValue("amount", undefined as unknown as number, { shouldValidate: false });
    } else {
      const num = parseInt(raw, 10);
      setDisplayAmount(num.toLocaleString("ko-KR"));
      setValue("amount", num, { shouldValidate: true });
    }
  };

  // 시트가 열릴 때 폼 초기화 + 히스토리 스택에 상태 추가 (뒤로가기 인터셉트)
  useEffect(() => {
    if (open) {
      const defaults = getDefaultValues();
      reset(defaults);
      setAnalyzeError(null);
      closeScanMenu();
      if (mode === "edit" && transaction) {
        setDisplayAmount(transaction.amount.toLocaleString("ko-KR"));
      } else if (initialRecurring) {
        setDisplayAmount(initialRecurring.amount.toLocaleString("ko-KR"));
      } else {
        setDisplayAmount("");
      }
      history.pushState({ transactionSheet: true }, "");

      const handlePopState = () => {
        if (showScanMenuRef.current) {
          // 스캔 메뉴만 닫고, 드로어용 히스토리 상태 복원
          closeScanMenu();
          history.pushState({ transactionSheet: true }, "");
        } else {
          onOpenChange(false);
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 시트를 직접 닫을 때 (X 버튼, 저장, 삭제) 히스토리 상태 정리
  const handleClose = () => {
    if (showScanMenuRef.current) {
      // 스캔 메뉴가 열려 있으면 모달만 닫기
      closeScanMenu();
      return;
    }
    if (history.state?.transactionSheet) {
      history.back();
    } else {
      onOpenChange(false);
    }
  };

  // 현재 선택된 거래 유형 감시 (카테고리 필터링용)
  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // 폼 제출
  const onSubmit = async (data: FormData) => {
    const transactionAt = new Date(`${data.date}T${data.time}:00`).toISOString();
    const payload = {
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      assetId: data.assetId,
      description: data.description || undefined,
      transactionAt,
    };

    if (mode === "edit" && transaction) {
      await updateTransaction(transaction.id, payload);
    } else {
      await addTransaction({
        ...payload,
        recurringId: initialRecurring?.id,
      });
    }
    handleClose();
    onSuccess?.();
  };

  // 거래 삭제 확인 모달 열기
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 거래 삭제 실행
  const handleConfirmDelete = async () => {
    if (transaction) {
      await deleteTransaction(transaction.id);
      handleClose();
      onSuccess?.();
    }
  };

  return (
    <>
    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title="거래 삭제"
      description="이 거래를 삭제할까요? 삭제된 거래는 복구할 수 없습니다."
      confirmLabel="삭제"
      onConfirm={handleConfirmDelete}
      destructive
    />
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        {/* 배경 오버레이 */}
        <Drawer.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[70]" />

        {/* 드로어 콘텐츠 - 전체화면 */}
        <Drawer.Content ref={contentRef} className="fixed inset-x-0 top-0 h-[100dvh] bg-background flex flex-col z-[70] outline-none border-0">
          {/* 상단 여백 (Safe Area) */}
          <div className="h-[env(safe-area-inset-top)] flex-shrink-0" />

          {/* 헤더 */}
          <div className="relative flex items-center justify-center px-5 py-3.5 flex-shrink-0">
            <Drawer.Title asChild>
              <h2 className="text-[16px] font-semibold tracking-tight">
                {mode === "create" ? "거래 추가" : "거래 수정"}
              </h2>
            </Drawer.Title>
            {/* 영수증 스캔 버튼 (추가 모드에서만 표시) */}
            {mode === "create" && (
              <div className="absolute left-5">
                {/* 관리자 or 승인된 유저: 카메라 / 갤러리 선택 */}
                {(accessStatus === "admin" || accessStatus === "approved") && (
                  <div className="relative">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleReceiptChange}
                    />
                    <input
                      ref={receiptInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReceiptChange}
                    />
                    <button
                      type="button"
                      onClick={() => openScanMenu()}
                      disabled={isAnalyzing}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/70 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      aria-label="영수증 스캔"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ScanLine className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* 미요청 상태: 버튼 클릭 시 승인 요청 툴팁 */}
                {accessStatus === "none" && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAccessTooltip((v) => !v)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/70 text-muted-foreground/40 hover:bg-muted transition-colors"
                      aria-label="영수증 스캔 (잠김)"
                    >
                      <ScanLine className="h-4 w-4" />
                    </button>
                    {showAccessTooltip && (
                      <div className="absolute left-0 top-10 z-10 w-52 rounded-xl bg-popover border border-border shadow-lg p-3">
                        <p className="text-[12px] text-muted-foreground mb-2.5">
                          영수증 자동 인식은 관리자 승인 후 사용할 수 있어요.
                        </p>
                        <button
                          type="button"
                          onClick={handleRequestAccess}
                          disabled={isRequesting}
                          className="w-full py-1.5 rounded-lg bg-foreground text-background text-[12px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {isRequesting ? "요청 중..." : "승인 요청하기"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 대기 중: 흐릿하게 표시 */}
                {accessStatus === "pending" && (
                  <button
                    type="button"
                    disabled
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-400 cursor-not-allowed"
                    aria-label="승인 대기 중"
                    title="승인 대기 중"
                  >
                    <ScanLine className="h-4 w-4" />
                  </button>
                )}

                {/* 거부됨: 아무 버튼도 표시 안 함 */}
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-5 w-8 h-8 flex items-center justify-center rounded-full bg-muted/70 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="overflow-y-auto flex-1 px-5 pb-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* 수입/지출 토글 탭 */}
              <div className="flex rounded-xl bg-muted/50 p-1 mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => reset({ ...watch(), type: "expense", categoryId: "" })}
                  className={cn(
                    "flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-150",
                    selectedType === "expense"
                      ? "bg-expense text-white shadow-sm"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  )}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => reset({ ...watch(), type: "income", categoryId: "" })}
                  className={cn(
                    "flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-150",
                    selectedType === "income"
                      ? "bg-income text-white shadow-sm"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  )}
                >
                  수입
                </button>
              </div>

              {/* 영수증 인식 에러 */}
              {analyzeError && (
                <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-destructive/8 border border-destructive/20">
                  <p className="text-destructive text-[12px]">{analyzeError}</p>
                </div>
              )}

              {/* 영수증 인식 중 안내 */}
              {isAnalyzing && (
                <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border/50 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
                  <p className="text-muted-foreground text-[12px]">영수증을 분석하고 있어요...</p>
                </div>
              )}

              {/* 금액 입력 */}
              <div className="mb-5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  금액
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className={cn(
                      "text-right text-[1.75rem] font-bold h-16 pr-9 rounded-xl tabular-nums",
                      selectedType === "expense"
                        ? "border-expense/30 focus-visible:ring-expense/40"
                        : "border-income/30 focus-visible:ring-income/40"
                    )}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none font-medium">
                    원
                  </span>
                </div>
                {errors.amount && (
                  <p className="text-destructive text-[11px] mt-1.5">{errors.amount.message}</p>
                )}
              </div>

              {/* 카테고리 선택 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  카테고리
                </label>
                {filteredCategories.length === 0 ? (
                  <Link
                    href="/settings/categories"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-center gap-2 border border-dashed border-input rounded-xl px-3.5 py-3 w-full text-[13.5px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    카테고리 추가
                  </Link>
                ) : (
                  <select {...register("categoryId")} className={selectClass} onTouchStart={dismissKeyboard}>
                    <option value="">카테고리를 선택하세요</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && (
                  <p className="text-destructive text-[11px] mt-1.5">{errors.categoryId.message}</p>
                )}
              </div>

              {/* 자산 선택 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  자산
                </label>
                {assets.length === 0 ? (
                  <Link
                    href="/settings/assets"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-center gap-2 border border-dashed border-input rounded-xl px-3.5 py-3 w-full text-[13.5px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    자산 추가
                  </Link>
                ) : (
                  <select {...register("assetId")} className={selectClass} onTouchStart={dismissKeyboard}>
                    <option value="">자산을 선택하세요</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.assetId && (
                  <p className="text-destructive text-[11px] mt-1.5">{errors.assetId.message}</p>
                )}
              </div>

              {/* 날짜 및 시간 입력 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  날짜 및 시간
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    {...register("date")}
                    className="border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                    onTouchStart={dismissKeyboard}
                  />
                  <input
                    type="time"
                    {...register("time")}
                    className="border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                    onTouchStart={dismissKeyboard}
                  />
                </div>
              </div>

              {/* 메모 입력 */}
              <div className="mb-7">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  메모
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <MemoInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* 수정 모드에서 삭제 버튼 */}
              {mode === "edit" && (
                <div className="mb-2.5">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl text-[13.5px] font-medium border border-destructive/25 text-destructive hover:bg-destructive/6 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* 저장 버튼 - 항상 하단 고정 */}
          <div className="px-5 pb-6 pt-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(
                "w-full py-3.5 rounded-xl text-[14px] font-semibold text-white active:scale-[0.99] transition-all hover:opacity-90 disabled:opacity-50",
                selectedType === "expense" ? "bg-expense" : "bg-income"
              )}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
          {/* 하단 safe area 여백 (홈 인디케이터 영역) */}
          <div className="flex-shrink-0" style={{ height: "env(safe-area-inset-bottom)" }} />

          {/* 영수증 스캔 모달 - Drawer.Content 안에서 absolute inset-0으로 렌더링 */}
          <ReceiptScanModal
            open={showScanMenu}
            onClose={closeScanMenu}
            onCamera={() => cameraInputRef.current?.click()}
            onGallery={() => receiptInputRef.current?.click()}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
    </>
  );
}
