import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-16">
      {children}
      <BottomTabBar />
    </div>
  );
}
