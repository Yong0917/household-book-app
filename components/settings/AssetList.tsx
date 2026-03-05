"use client";

// 자산 목록 컴포넌트 (Supabase server actions 연동, 드래그 정렬 지원)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Building2, CreditCard, HelpCircle, Trash2, Plus, GripVertical } from "lucide-react";
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
import { addAsset, updateAsset, deleteAsset, reorderAssets } from "@/lib/actions/assets";
import type { Asset, AssetType } from "@/lib/mock/types";

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  cash: Wallet,
  bank: Building2,
  card: CreditCard,
  other: HelpCircle,
};

const ASSET_LABELS: Record<AssetType, string> = {
  cash: "현금",
  bank: "은행",
  card: "카드",
  other: "기타",
};

const selectClass =
  "border border-input rounded-lg px-3 py-2 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring";

// 드래그 가능한 개별 자산 아이템
function SortableAssetItem({
  asset,
  onItemClick,
  onDelete,
  isPending,
}: {
  asset: Asset;
  onItemClick: (a: Asset) => void;
  onDelete: (a: Asset) => void;
  isPending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const IconComponent = ASSET_ICONS[asset.type];

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

      {/* 자산 아이콘 + 정보 */}
      <button
        onClick={() => onItemClick(asset)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{asset.name}</p>
          <p className="text-xs text-muted-foreground">{ASSET_LABELS[asset.type]}</p>
        </div>
        {asset.isDefault && (
          <span className="text-xs text-muted-foreground ml-1">(기본)</span>
        )}
      </button>

      {/* 삭제 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "text-muted-foreground hover:text-red-500",
          asset.isDefault && "opacity-30 cursor-not-allowed"
        )}
        onClick={() => onDelete(asset)}
        disabled={asset.isDefault || isPending}
        aria-label={`${asset.name} 삭제`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface AssetListProps {
  initialAssets: Asset[];
}

export function AssetList({ initialAssets }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<AssetType>("cash");
  const [isPending, setIsPending] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Asset | null>(null);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // 드래그 종료 → 순서 업데이트
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = assets.findIndex((a) => a.id === active.id);
    const newIndex = assets.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(assets, oldIndex, newIndex);
    setAssets(reordered);

    await reorderAssets(reordered.map((a) => a.id));
  };

  const handleAddClick = () => {
    setEditingAsset(null);
    setFormName("");
    setFormType("cash");
    setIsDrawerOpen(true);
  };

  const handleItemClick = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.type);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || isPending) return;
    setIsPending(true);
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, { name: formName.trim(), type: formType });
      } else {
        await addAsset({ name: formName.trim(), type: formType, isDefault: false });
      }
      setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = () => {
    if (!editingAsset || isPending) return;
    setConfirmTarget(editingAsset);
  };

  const handleDirectDelete = (asset: Asset) => {
    if (asset.isDefault || isPending) return;
    setConfirmTarget(asset);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget || isPending) return;
    const wasInDrawer = editingAsset?.id === confirmTarget.id;
    setIsPending(true);
    try {
      await deleteAsset(confirmTarget.id);
      if (wasInDrawer) setIsDrawerOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
      setConfirmTarget(null);
    }
  };

  return (
    <div>
      {/* 드래그 정렬 목록 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={assets.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y border-t border-b">
            {assets.map((asset) => (
              <SortableAssetItem
                key={asset.id}
                asset={asset}
                onItemClick={handleItemClick}
                onDelete={handleDirectDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 자산 추가 버튼 */}
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
        title="자산 삭제"
        description={`'${confirmTarget?.name}' 자산을 삭제할까요? 이 자산을 사용한 거래의 자산 정보가 미분류로 변경됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        destructive
      />

      {/* 추가/수정 Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[70dvh] flex flex-col">
            <div className="mx-auto w-12 h-1.5 bg-muted-foreground/30 rounded-full mt-3 mb-2 flex-shrink-0" />

            <div className="overflow-y-auto flex-1 px-4 pb-8">
              <Drawer.Title asChild>
                <h2 className="text-lg font-semibold text-center py-3">
                  {editingAsset ? "자산 수정" : "자산 추가"}
                </h2>
              </Drawer.Title>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">이름</label>
                <Input
                  placeholder="자산 이름"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

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

              <div className="space-y-2">
                {editingAsset && !editingAsset.isDefault && (
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
