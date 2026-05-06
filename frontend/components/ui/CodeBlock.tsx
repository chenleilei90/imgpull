"use client";

import { useState } from "react";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-800 bg-[#0B1220] text-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-300">
        <span className="font-extrabold">{label ?? "命令"}</span>
        <button className="rounded-lg border border-white/15 px-2.5 py-1 font-extrabold transition hover:bg-white/10" type="button" onClick={copy}>
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}
