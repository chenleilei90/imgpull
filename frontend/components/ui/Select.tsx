"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Select({
  value,
  defaultValue,
  options,
  placeholder = "请选择",
  className = "",
  onChange
}: {
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const currentValue = value ?? internalValue;
  const selected = useMemo(() => options.find((item) => item.value === currentValue), [currentValue, options]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectOption(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div className={`relative w-full ${className}`} ref={rootRef}>
      <button
        aria-expanded={open}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-control border bg-white px-3 text-left text-sm text-ink outline-none transition duration-150 ease-out ${
          open ? "border-primary shadow-focus" : "border-borderSoft hover:border-blue-200 hover:bg-blue-50/35"
        }`}
        type="button"
        onClick={() => setOpen((next) => !next)}
      >
        <span className={`min-w-0 truncate ${selected ? "font-bold text-ink" : "text-slate-400"}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-150 ${open ? "rotate-180 text-primary" : ""}`} fill="none" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-panel border border-blue-100 bg-white p-1.5 shadow-panel">
          {options.map((option) => {
            const active = option.value === currentValue;
            return (
              <button
                className={`flex w-full items-start justify-between gap-3 rounded-[9px] px-3 py-2.5 text-left transition duration-150 ease-out ${
                  active ? "bg-blue-50 text-primary" : "text-slate-700 hover:bg-slate-50 hover:text-ink"
                } ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={option.disabled}
                key={option.value}
                type="button"
                onClick={() => selectOption(option.value)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{option.label}</span>
                  {option.description ? <span className="mt-0.5 block truncate text-xs font-bold text-muted">{option.description}</span> : null}
                </span>
                {active ? (
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-black text-white">✓</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
