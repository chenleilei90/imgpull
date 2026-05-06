import type { BadgeTone } from "@/lib/status";

const toneClass: Record<BadgeTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  green: "border-green-200 bg-green-50 text-green-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700"
};

export function Badge({ children, tone = "slate", className = "" }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-extrabold leading-none ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}
