import Client from "./Client";
export default function Page() {
  const p = new Promise<{ ok: number }>((r) => setTimeout(() => r({ ok: 1 }), 300));
  return <Client p={p} />;
}
