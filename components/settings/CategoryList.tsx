"use client";

// 분류(카테고리) 목록 컴포넌트 (Mock CRUD 구현)
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMock } from "@/lib/mock/context";
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

export function CategoryList() {
  // 활성 탭 상태 (수입/지출)
  const [activeTab, setActiveTab] = useState<CategoryType>("expense");
  // Drawer 열림 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // 수정 중인 카테고리 (null이면 추가 모드)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // 폼 상태
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);

  const { categories, addCategory, updateCategory, deleteCategory } = useMock();

  // 현재 탭에 해당하는 카테고리 필터링
  const filteredCategories = categories.filter((c) => c.type === activeTab);

  // 추가 버튼 클릭
  const handleAddClick = () => {
    setEditingCategory(null);
    setFormName("");
    setFormColor(COLOR_PALETTE[0]);
    setIsDrawerOpen(true);
  };

  // 항목 클릭 (수정)
  const handleItemClick = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormColor(category.color);
    setIsDrawerOpen(true);
  };

  // 저장 버튼
  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, { name: formName.trim(), color: formColor });
    } else {
      addCategory({ name: formName.trim(), type: activeTab, color: formColor, isDefault: false });
    }
    setIsDrawerOpen(false);
  };

  // 삭제 버튼 (Drawer 내)
  const handleDelete = () => {
    if (editingCategory) {
      deleteCategory(editingCategory.id);
      setIsDrawerOpen(false);
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

      {/* 카테고리 목록 */}
      <div className="divide-y">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between px-4 py-3"
          >
            {/* 카테고리 색상 아이콘 + 이름 */}
            <button
              onClick={() => handleItemClick(category)}
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

            {/* 삭제 버튼 (기본 카테고리는 비활성) */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-red-500",
                category.isDefault && "opacity-30 cursor-not-allowed"
              )}
              onClick={() => !category.isDefault && deleteCategory(category.id)}
              disabled={category.isDefault}
              aria-label={`${category.name} 삭제`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

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
            {/* 드래그 핸들 */}
            <div className="mx-auto w-12 h-1.5 bg-muted-foreground/30 rounded-full mt-3 mb-2 flex-shrink-0" />

            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <Drawer.Title asChild>
                <h2 className="text-lg font-semibold text-center py-3">
                  {editingCategory ? "카테고리 수정" : "카테고리 추가"}
                </h2>
              </Drawer.Title>

              {/* 이름 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">이름</label>
                <Input
                  placeholder="카테고리 이름"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* 색상 선택 */}
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

              {/* 버튼 영역 */}
              <div className="space-y-2">
                {/* 수정 모드에서 삭제 버튼 (기본 카테고리 제외) */}
                {editingCategory && !editingCategory.isDefault && (
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-500"
                    onClick={handleDelete}
                  >
                    삭제
                  </Button>
                )}

                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={!formName.trim()}
                >
                  저장
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
