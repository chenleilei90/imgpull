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

export function CopyButton({
  value,
  children = "复制"
}: {
  value: string;
  children?: React.ReactNode;
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
    <button
      className={`inline-flex h-9 min-w-[190px] items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border px-4 text-sm font-black shadow-sm transition ${
        copied
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          : "border-primary bg-white text-primary hover:bg-blue-50"
      }`}
      type="button"
      onClick={copy}
    >
      {copied ? <CheckGlyph /> : <CopyGlyph />}
      {copied ? "已复制" : children}
    </button>
  );
}

export function CopyIconButton({ value, label = "复制" }: { value: string; label?: string }) {
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
    <button
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-[7px] border transition ${
        copied
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-blue-100 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-primary"
      }`}
      type="button"
      title={copied ? "已复制" : label}
      onClick={copy}
    >
      {copied ? <CheckGlyph /> : <CopyGlyph />}
    </button>
  );
}

function CopyGlyph() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7 7.5V5.8c0-1 .8-1.8 1.8-1.8h5.4c1 0 1.8.8 1.8 1.8v5.4c0 1-.8 1.8-1.8 1.8h-1.7" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M4 8.8C4 7.8 4.8 7 5.8 7h5.4c1 0 1.8.8 1.8 1.8v5.4c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8V8.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 10.4 3.1 3.1L15.5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" />
    </svg>
  );
}
