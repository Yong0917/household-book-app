"use client";

// 거래 등록/수정 바텀 시트 컴포넌트 (vaul Drawer + React Hook Form + Zod)
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "vaul";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMock } from "@/lib/mock/context";
import type { Transaction } from "@/lib/mock/types";

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
}

// select 공통 스타일
const selectClass =
  "border border-input rounded-lg px-3 py-2 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function TransactionSheet({
  open,
  onOpenChange,
  mode,
  transaction,
  initialDate,
}: TransactionSheetProps) {
  const { categories, assets, addTransaction, updateTransaction, deleteTransaction } =
    useMock();

  // 기본값 계산
  const getDefaultValues = (): FormData => {
    if (mode === "edit" && transaction) {
      const dt = transaction.transactionAt;
      return {
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        assetId: transaction.assetId,
        date: dt.substring(0, 10),
        time: dt.substring(11, 16),
        description: transaction.description ?? "",
      };
    }
    return {
      type: "expense",
      amount: 0,
      categoryId: "",
      assetId: "",
      date: initialDate ?? format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      description: "",
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // 시트가 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      reset(getDefaultValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 현재 선택된 거래 유형 감시 (카테고리 필터링용)
  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // 폼 제출
  const onSubmit = (data: FormData) => {
    const transactionAt = `${data.date}T${data.time}:00`;
    const payload = {
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      assetId: data.assetId,
      description: data.description || undefined,
      transactionAt,
    };

    if (mode === "edit" && transaction) {
      updateTransaction(transaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onOpenChange(false);
  };

  // 거래 삭제
  const handleDelete = () => {
    if (transaction) {
      deleteTransaction(transaction.id);
      onOpenChange(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        {/* 배경 오버레이 */}
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />

        {/* 드로어 콘텐츠 */}
        <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[96dvh] flex flex-col">
          {/* 드래그 핸들 */}
          <div className="mx-auto w-12 h-1.5 bg-muted-foreground/30 rounded-full mt-3 mb-2 flex-shrink-0" />

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="overflow-y-auto flex-1 px-4 pb-8">
            {/* 시트 헤더 */}
            <Drawer.Title asChild>
              <h2 className="text-lg font-semibold text-center py-3">
                {mode === "create" ? "거래 추가" : "거래 수정"}
              </h2>
            </Drawer.Title>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* 수입/지출 토글 탭 */}
              <div className="bg-muted rounded-lg p-1 flex mb-5">
                <button
                  type="button"
                  onClick={() => {
                    // type 변경 시 categoryId 초기화
                    reset({ ...watch(), type: "expense", categoryId: "" });
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    selectedType === "expense"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset({ ...watch(), type: "income", categoryId: "" });
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    selectedType === "income"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  수입
                </button>
              </div>

              {/* 금액 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">금액</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("amount", { valueAsNumber: true })}
                    className="text-right text-2xl h-14 pr-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none">
                    원
                  </span>
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* 카테고리 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">카테고리</label>
                <select {...register("categoryId")} className={selectClass}>
                  <option value="">카테고리를 선택하세요</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              {/* 자산 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">자산</label>
                <select {...register("assetId")} className={selectClass}>
                  <option value="">자산을 선택하세요</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <p className="text-red-500 text-xs mt-1">{errors.assetId.message}</p>
                )}
              </div>

              {/* 날짜 및 시간 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">날짜 및 시간</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    {...register("date")}
                    className="border border-input rounded-lg px-3 py-2 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="time"
                    {...register("time")}
                    className="border border-input rounded-lg px-3 py-2 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* 메모 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">메모</label>
                <Input placeholder="메모 (선택사항)" {...register("description")} />
              </div>

              {/* 액션 버튼 */}
              <div className="mt-6 space-y-2">
                {/* 수정 모드에서 삭제 버튼 표시 */}
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-500"
                    onClick={handleDelete}
                  >
                    삭제
                  </Button>
                )}

                {/* 저장 버튼 */}
                <Button type="submit" className="w-full">
                  저장
                </Button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
