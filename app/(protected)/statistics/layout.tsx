import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh" style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}>
      {children}
      <BottomTabBar />
    </div>
  );
}
