"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { MockRole } from "@/lib/mock-auth";
import { useMockSession } from "@/lib/mock-auth";

export function MockAuthGate({
  children,
  requiredRole
}: {
  children: React.ReactNode;
  requiredRole: MockRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useMockSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole === "admin" && session.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    if (requiredRole === "user" && session.role !== "user") {
      router.replace("/admin");
    }
  }, [mounted, pathname, requiredRole, router, session]);

  if (!mounted || !session || session.role !== requiredRole) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-extrabold text-slate-500">
        正在进入控制台...
      </div>
    );
  }

  return <>{children}</>;
}
