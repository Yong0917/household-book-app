import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default async function LedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  return (
    <div className="min-h-dvh pb-16">
      {children}
      <BottomTabBar />
    </div>
  );
}
