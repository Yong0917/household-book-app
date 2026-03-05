"use client";

// 분류(카테고리) 목록 컴포넌트 (Supabase server actions 연동, 드래그 정렬 지원)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, GripVertical } from "lucide-react";
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
        className={cn(
          "text-muted-foreground hover:text-red-500",
          category.isDefault && "opacity-30 cursor-not-allowed"
        )}
        onClick={() => onDelete(category)}
        disabled={category.isDefault || isPending}
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

  const router = useRouter();

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

  const handleDelete = async () => {
    if (!editingCategory || isPending) return;
    setIsPending(true);
    try {
      await deleteCategory(editingCategory.id);
      setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDirectDelete = async (category: Category) => {
    if (category.isDefault || isPending) return;
    setIsPending(true);
    try {
      await deleteCategory(category.id);
      router.refresh();
    } finally {
      setIsPending(false);
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

      {/* 추가/수정 Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[80dvh] flex flex-col">
            <div className="mx-auto w-12 h-1.5 bg-muted-foreground/30 rounded-full mt-3 mb-2 flex-shrink-0" />

            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <Drawer.Title asChild>
                <h2 className="text-lg font-semibold text-center py-3">
                  {editingCategory ? "카테고리 수정" : "카테고리 추가"}
                </h2>
              </Drawer.Title>

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
                        "h-10 w-10 rounded-full transition-transform",
                        formColor === color && "ring-2 ring-offset-2 ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`색상 ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {editingCategory && !editingCategory.isDefault && (
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
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
