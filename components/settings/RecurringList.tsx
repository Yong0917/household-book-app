"use client";

// 고정비 목록 컴포넌트 (Supabase server actions 연동)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, X } from "lucide-react";
import { Drawer } from "vaul";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  addRecurring,
  updateRecurring,
  deleteRecurring,
} from "@/lib/actions/recurring";
import type { RecurringTransaction, Category, Asset } from "@/lib/mock/types";

// 폼 검증 스키마
const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number({ message: "금액을 입력하세요" }).min(1, "1원 이상 입력하세요"),
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
  assetId: z.string().min(1, "자산을 선택하세요"),
  dayOfMonth: z.number().min(1).max(31),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// select 공통 스타일
const selectClass =
  "border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13.5px] focus:outline-none focus:ring-1 focus:ring-ring appearance-none";

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

interface RecurringListProps {
  initialItems: RecurringTransaction[];
  categories: Category[];
  assets: Asset[];
}

export function RecurringList({ initialItems, categories, assets }: RecurringListProps) {
  const [items, setItems] = useState<RecurringTransaction[]>(initialItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<RecurringTransaction | null>(null);
  const [displayAmount, setDisplayAmount] = useState("");

  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Drawer 열릴 때 뒤로가기 인터셉트
  useEffect(() => {
    if (!isDrawerOpen) return;
    history.pushState({ recurringDrawer: true }, "");
    const handlePopState = () => setIsDrawerOpen(false);
    window.addEventListener("popstate", handlePopState, { once: true });
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDrawerOpen]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      categoryId: "",
      assetId: "",
      dayOfMonth: 1,
      description: "",
    },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

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

  const handleAddClick = () => {
    setEditingItem(null);
    reset({ type: "expense", categoryId: "", assetId: "", dayOfMonth: 1, description: "" });
    setDisplayAmount("");
    setIsDrawerOpen(true);
  };

  const handleItemClick = (item: RecurringTransaction) => {
    setEditingItem(item);
    reset({
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      assetId: item.assetId,
      dayOfMonth: item.dayOfMonth,
      description: item.description ?? "",
    });
    setDisplayAmount(item.amount.toLocaleString("ko-KR"));
    setIsDrawerOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (isPending) return;
    setIsPending(true);
    try {
      if (editingItem) {
        await updateRecurring(editingItem.id, {
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          assetId: data.assetId,
          dayOfMonth: data.dayOfMonth,
          description: data.description || undefined,
        });
      } else {
        await addRecurring({
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          assetId: data.assetId,
          dayOfMonth: data.dayOfMonth,
          description: data.description || undefined,
        });
      }
      setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDirectDelete = (item: RecurringTransaction) => {
    setConfirmTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget || isPending) return;
    const wasInDrawer = editingItem?.id === confirmTarget.id;
    setIsPending(true);
    try {
      await deleteRecurring(confirmTarget.id);
      if (wasInDrawer) setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
      setConfirmTarget(null);
    }
  };

  return (
    <div>
      {/* 설명 텍스트 */}
      <p className="px-4 py-3 text-[12.5px] text-muted-foreground/70 border-b border-border/40">
        매달 반복되는 고정 수입/지출을 등록하면 가계부에서 빠르게 추가할 수 있어요.
      </p>

      {/* 고정비 목록 */}
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground/60 text-sm">등록된 고정비가 없습니다</p>
          </div>
        ) : (
          items.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const ast = assets.find((a) => a.id === item.assetId);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3.5 bg-background"
              >
                {/* 항목 정보 */}
                <button
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {/* 카테고리 색상 도트 */}
                  <div
                    className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: cat?.color ?? "#6b7280" }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          item.type === "expense"
                            ? "bg-expense/10 text-expense"
                            : "bg-income/10 text-income"
                        )}
                      >
                        {item.type === "expense" ? "지출" : "수입"}
                      </span>
                      <span className="text-sm font-medium">
                        {item.description || cat?.name || "고정비"}
                      </span>
                    </div>
                    <span className="text-[11.5px] text-muted-foreground/60">
                      매월 {item.dayOfMonth}일 · {ast?.name ?? "자산"} · {item.amount.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </button>

                {/* 삭제 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => handleDirectDelete(item)}
                  disabled={isPending}
                  aria-label={`${item.description || cat?.name} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* 추가 버튼 */}
      <div className="px-4 py-3">
        <Button variant="outline" className="w-full gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          고정비 추가
        </Button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title="고정비 삭제"
        description={`'${confirmTarget?.description || categories.find(c => c.id === confirmTarget?.categoryId)?.name}' 고정비를 삭제할까요?`}
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        destructive
      />

      {/* 추가/수정 Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} dismissible={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Drawer.Content className="fixed inset-0 bg-background flex flex-col outline-none z-[60]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border/60 flex-shrink-0">
              <div className="w-10" />
              <Drawer.Title asChild>
                <h2 className="text-[15px] font-semibold">
                  {editingItem ? "고정비 수정" : "고정비 추가"}
                </h2>
              </Drawer.Title>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors text-muted-foreground"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pt-5 pb-8">
              {/* 수입/지출 탭 */}
              <div className="flex rounded-xl bg-muted/50 p-1 mb-5 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setValue("type", "expense");
                    setValue("categoryId", "");
                  }}
                  className={cn(
                    "flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all",
                    selectedType === "expense"
                      ? "bg-expense text-white shadow-sm"
                      : "text-muted-foreground/60"
                  )}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("type", "income");
                    setValue("categoryId", "");
                  }}
                  className={cn(
                    "flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all",
                    selectedType === "income"
                      ? "bg-income text-white shadow-sm"
                      : "text-muted-foreground/60"
                  )}
                >
                  수입
                </button>
              </div>

              {/* 금액 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">금액</label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="text-right text-[1.4rem] font-bold h-14 pr-9 rounded-xl tabular-nums"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none font-medium">원</span>
                </div>
                {errors.amount && <p className="text-destructive text-[11px] mt-1.5">{errors.amount.message}</p>}
              </div>

              {/* 카테고리 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">카테고리</label>
                <select {...register("categoryId")} className={selectClass}>
                  <option value="">카테고리를 선택하세요</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-destructive text-[11px] mt-1.5">{errors.categoryId.message}</p>}
              </div>

              {/* 자산 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">자산</label>
                <select {...register("assetId")} className={selectClass}>
                  <option value="">자산을 선택하세요</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {errors.assetId && <p className="text-destructive text-[11px] mt-1.5">{errors.assetId.message}</p>}
              </div>

              {/* 결제일 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">결제일 (매월)</label>
                <select
                  {...register("dayOfMonth", { valueAsNumber: true })}
                  className={selectClass}
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}일</option>
                  ))}
                </select>
              </div>

              {/* 메모 */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">메모 (선택)</label>
                <Input
                  placeholder="예: 넷플릭스, 월세 등"
                  {...register("description")}
                />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="px-4 pb-8 pt-3 border-t border-border/60 space-y-2 flex-shrink-0">
              {editingItem && (
                <Button
                  variant="outline"
                  className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-500"
                  onClick={() => setConfirmTarget(editingItem)}
                  disabled={isPending}
                >
                  삭제
                </Button>
              )}
              <Button
                className="w-full"
                onClick={handleSubmit(onSubmit)}
                disabled={isPending}
              >
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
