"use client";

import { useState } from "react";

export function CopyOnDoubleClick({
  value,
  className = ""
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <span className="relative inline-block max-w-full">
      <span
        className={`block cursor-copy truncate whitespace-nowrap rounded-[6px] px-1 transition hover:bg-blue-50 hover:text-primary ${className}`}
        title={`${value}，双击复制`}
        onDoubleClick={copy}
      >
        {value}
      </span>
      {copied ? (
        <span className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-primary px-2 py-1 text-xs font-black text-white shadow-soft">
          已复制
        </span>
      ) : null}
    </span>
  );
}
