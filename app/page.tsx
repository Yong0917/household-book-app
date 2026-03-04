import { redirect } from "next/navigation";

// 루트 진입 시 가계부 일일 보기로 리디렉션
// 미인증 사용자는 proxy.ts에서 /auth/login으로 자동 리디렉션됨
export default function Home() {
  redirect("/ledger/daily");
}
