"use client";
import { useEffect, useState } from "react";
import { settlePromise } from "@/lib/utils/settlePromise";
export default function Client({ p }: { p: Promise<{ ok: number }> }) {
  const [out, setOut] = useState("pending");
  useEffect(() => {
    let old = "old:ok";
    try { p.catch(() => undefined).then(() => {}); } catch (e) { old = "old:" + (e as Error).message; }
    settlePromise(p).then((v) => setOut(old + " | new:" + JSON.stringify(v)));
  }, [p]);
  return <div id="out">{out}</div>;
}
