import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata = {
  title: "이용약관 | 가계부",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 bg-background border-b border-border/40 z-10 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center gap-3">
          <Link
            href="/settings"
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">이용약관</h1>
        </div>
      </header>
      <TermsContent />
    </div>
  );
}
