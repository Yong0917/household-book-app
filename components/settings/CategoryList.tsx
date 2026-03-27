"use client";

// 분류(카테고리) 목록 컴포넌트 (Supabase server actions 연동, 드래그 정렬 지원)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, GripVertical, X } from "lucide-react";
import { Drawer } from "vaul";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/mock/types";

type CategoryType = "income" | "expense";

// 색상 팔레트
const COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6b7280",
];

// 드래그 가능한 개별 카테고리 아이템
function SortableCategoryItem({
  category,
  onItemClick,
  onDelete,
  isPending,
}: {
  category: Category;
  onItemClick: (c: Category) => void;
  onDelete: (c: Category) => void;
  isPending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-4 py-3 bg-background"
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="mr-2 text-muted-foreground/40 touch-none cursor-grab active:cursor-grabbing"
        aria-label="순서 변경"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* 카테고리 색상 아이콘 + 이름 */}
      <button
        onClick={() => onItemClick(category)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div
          className="h-8 w-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm font-medium">{category.name}</span>
        {category.isDefault && (
          <span className="text-xs text-muted-foreground">(기본)</span>
        )}
      </button>

      {/* 삭제 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-red-500"
        onClick={() => onDelete(category)}
        disabled={isPending}
        aria-label={`${category.name} 삭제`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [activeTab, setActiveTab] = useState<CategoryType>("expense");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);
  const [isPending, setIsPending] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const router = useRouter();

  // initialCategories prop이 변경되면 로컬 상태 동기화 (router.refresh() 후 반영)
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Drawer 열릴 때 뒤로가기 인터셉트
  useEffect(() => {
    if (!isDrawerOpen) return;
    history.pushState({ categoryDrawer: true }, "");
    const handlePopState = () => setIsDrawerOpen(false);
    window.addEventListener("popstate", handlePopState, { once: true });
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDrawerOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  // 드래그 종료 → 순서 업데이트
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredCategories.findIndex((c) => c.id === active.id);
    const newIndex = filteredCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(filteredCategories, oldIndex, newIndex);

    // 현재 탭 외의 카테고리는 그대로 유지
    const otherCategories = categories.filter((c) => c.type !== activeTab);
    setCategories([...otherCategories, ...reordered]);

    await reorderCategories(reordered.map((c) => c.id));
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setFormName("");
    setFormColor(COLOR_PALETTE[0]);
    setIsDrawerOpen(true);
  };

  const handleItemClick = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormColor(category.color);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || isPending) return;
    setIsPending(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formName.trim(),
          color: formColor,
        });
      } else {
        await addCategory({
          name: formName.trim(),
          type: activeTab,
          color: formColor,
          isDefault: false,
        });
      }
      setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = () => {
    if (!editingCategory || isPending) return;
    setConfirmTarget(editingCategory);
  };

  const handleDirectDelete = (category: Category) => {
    if (isPending) return;
    setConfirmTarget(category);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget || isPending) return;
    const wasInDrawer = editingCategory?.id === confirmTarget.id;
    setIsPending(true);
    try {
      await deleteCategory(confirmTarget.id);
      if (wasInDrawer) setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
      setConfirmTarget(null);
    }
  };

  return (
    <div>
      {/* 수입/지출 탭 전환 */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("expense")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "expense"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          )}
        >
          지출
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "income"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          )}
        >
          수입
        </button>
      </div>

      {/* 드래그 정렬 목록 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredCategories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y">
            {filteredCategories.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                onItemClick={handleItemClick}
                onDelete={handleDirectDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 카테고리 추가 버튼 */}
      <div className="px-4 py-3">
        <Button variant="outline" className="w-full gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title="카테고리 삭제"
        description={`'${confirmTarget?.name}' 카테고리를 삭제할까요? 이 카테고리를 사용한 거래의 카테고리가 미분류로 변경됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        destructive
      />

      {/* 추가/수정 Drawer - 전체화면 */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} dismissible={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Drawer.Content className="fixed inset-0 bg-background flex flex-col outline-none z-[60]">
            <div className="h-[env(safe-area-inset-top)] flex-shrink-0" />
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border/60 flex-shrink-0">
              <div className="w-10" />
              <Drawer.Title asChild>
                <h2 className="text-[15px] font-semibold">
                  {editingCategory ? "카테고리 수정" : "카테고리 추가"}
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

            <div className="overflow-y-auto flex-1 px-4 pt-6 pb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">이름</label>
                <Input
                  placeholder="카테고리 이름"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">색상</label>
                <div className="grid grid-cols-5 gap-3">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={cn(
                        "h-12 w-12 rounded-full transition-transform",
                        formColor === color && "ring-2 ring-offset-2 ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`색상 ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="px-4 pb-6 pt-3 border-t border-border/60 space-y-2 flex-shrink-0">
              {editingCategory && (
                <Button
                  variant="outline"
                  className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-500"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  삭제
                </Button>
              )}
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!formName.trim() || isPending}
              >
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
            {/* 하단 safe area 여백 (홈 인디케이터 영역) */}
            <div className="flex-shrink-0" style={{ height: "env(safe-area-inset-bottom)" }} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
