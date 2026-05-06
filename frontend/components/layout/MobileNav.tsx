"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import type { NavRoute } from "@/lib/routes";

export function MobileNav({ routes, label }: { routes: NavRoute[]; label: string }) {
  const router = useRouter();

  return (
    <div className="mb-4 lg:hidden">
      <label className="field">
        <span className="label">{label}</span>
        <Select
          placeholder="选择页面"
          onChange={(value) => router.push(value)}
          options={routes.map((route) => ({
            value: route.href,
            label: route.label
          }))}
        />
      </label>
    </div>
  );
}
