"use client";

// 자산 목록 컴포넌트 (Mock CRUD 구현)
import { useState } from "react";
import { Wallet, Building2, CreditCard, HelpCircle, Trash2, Plus } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMock } from "@/lib/mock/context";
import type { Asset, AssetType } from "@/lib/mock/types";

// 자산 타입별 아이콘 매핑
const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  cash: Wallet,
  bank: Building2,
  card: CreditCard,
  other: HelpCircle,
};

// 자산 타입별 한글 레이블
const ASSET_LABELS: Record<AssetType, string> = {
  cash: "현금",
  bank: "은행",
  card: "카드",
  other: "기타",
};

// select 공통 스타일
const selectClass =
  "border border-input rounded-lg px-3 py-2 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function AssetList() {
  // Drawer 열림 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // 수정 중인 자산 (null이면 추가 모드)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  // 폼 상태
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<AssetType>("cash");

  const { assets, addAsset, updateAsset, deleteAsset } = useMock();

  // 추가 버튼 클릭
  const handleAddClick = () => {
    setEditingAsset(null);
    setFormName("");
    setFormType("cash");
    setIsDrawerOpen(true);
  };

  // 항목 클릭 (수정)
  const handleItemClick = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.type);
    setIsDrawerOpen(true);
  };

  // 저장 버튼
  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingAsset) {
      updateAsset(editingAsset.id, { name: formName.trim(), type: formType });
    } else {
      addAsset({ name: formName.trim(), type: formType, isDefault: false });
    }
    setIsDrawerOpen(false);
  };

  // 삭제 버튼 (Drawer 내)
  const handleDelete = () => {
    if (editingAsset) {
      deleteAsset(editingAsset.id);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div>
      {/* 자산 목록 */}
      <div className="divide-y border-t border-b">
        {assets.map((asset) => {
          const IconComponent = ASSET_ICONS[asset.type];

          return (
            <div
              key={asset.id}
              className="flex items-center justify-between px-4 py-3"
            >
              {/* 자산 아이콘 + 정보 */}
              <button
                onClick={() => handleItemClick(asset)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ASSET_LABELS[asset.type]}
                  </p>
                </div>
                {asset.isDefault && (
                  <span className="text-xs text-muted-foreground ml-1">(기본)</span>
                )}
              </button>

              {/* 삭제 버튼 (기본 자산은 비활성) */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground hover:text-red-500",
                  asset.isDefault && "opacity-30 cursor-not-allowed"
                )}
                onClick={() => !asset.isDefault && deleteAsset(asset.id)}
                disabled={asset.isDefault}
                aria-label={`${asset.name} 삭제`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* 자산 추가 버튼 */}
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
          <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[70dvh] flex flex-col">
            {/* 드래그 핸들 */}
            <div className="mx-auto w-12 h-1.5 bg-muted-foreground/30 rounded-full mt-3 mb-2 flex-shrink-0" />

            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <Drawer.Title asChild>
                <h2 className="text-lg font-semibold text-center py-3">
                  {editingAsset ? "자산 수정" : "자산 추가"}
                </h2>
              </Drawer.Title>

              {/* 이름 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">이름</label>
                <Input
                  placeholder="자산 이름"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* 타입 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5">유형</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as AssetType)}
                  className={selectClass}
                >
                  <option value="cash">현금</option>
                  <option value="bank">은행</option>
                  <option value="card">카드</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* 버튼 영역 */}
              <div className="space-y-2">
                {/* 수정 모드에서 삭제 버튼 (기본 자산 제외) */}
                {editingAsset && !editingAsset.isDefault && (
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
