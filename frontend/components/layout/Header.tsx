"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { authRoutes, publicRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/Button";
import { clearMockSession, useMockSession } from "@/lib/mock-auth";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useMockSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function logout() {
    clearMockSession();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-borderSoft bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-[min(1240px,calc(100vw-32px))] items-center gap-4">
        <Link className="flex min-w-[150px] items-center gap-3 text-lg font-black text-ink" href="/" title="返回首页">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-sm font-black text-white shadow-soft">IP</span>
          <span>{APP_NAME}</span>
        </Link>
        <nav className="hidden flex-1 flex-wrap justify-center gap-1 lg:flex">
          {publicRoutes.map((route) => (
            <Link
              className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition ${
                pathname === route.href ? "bg-blue-50 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
              }`}
              href={route.href}
              key={route.href}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {mounted && session ? (
            <>
              <Button href={session.role === "admin" ? "/admin" : "/dashboard"} variant="secondary">
                进入控制台
              </Button>
              <Button onClick={logout} variant="ghost">
                退出
              </Button>
            </>
          ) : (
            <>
              <Button href={authRoutes[0].href} variant="secondary">
                {authRoutes[0].label}
              </Button>
              <Button href={authRoutes[1].href} variant="primary">
                {authRoutes[1].label}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
