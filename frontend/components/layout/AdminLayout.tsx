"use client";

import Link from "next/link";
import { useState } from "react";
import { MockAuthGate } from "@/components/auth/MockAuthGate";
import { ConsoleLegalNote } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { clearMockSession, useMockSession } from "@/lib/mock-auth";
import { adminRoutes } from "@/lib/routes";

const ADMIN_SIDEBAR_COLLAPSED_KEY = "imgpull:admin-sidebar-collapsed";

function readStoredSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === "true";
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useMockSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readStoredSidebarCollapsed);

  function logout() {
    clearMockSession();
    window.location.href = "/";
  }

  function handleSidebarCollapsedChange(nextCollapsed: boolean) {
    setSidebarCollapsed(nextCollapsed);
    window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, String(nextCollapsed));
  }

  return (
    <MockAuthGate requiredRole="admin">
      <div className="min-h-screen bg-page">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/94 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[68px] w-[min(1440px,calc(100vw-28px))] items-center gap-3">
            <Link className="flex items-center gap-3 text-lg font-black text-ink" href="/" title="返回首页">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-xs font-black text-white shadow-soft">AD</span>
              <span className="hidden sm:inline">管理后台</span>
            </Link>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">系统健康：正常</span>
              <span className="text-sm font-extrabold text-slate-700">{session?.name ?? "super_admin"}</span>
              <Button onClick={logout} variant="ghost">
                退出
              </Button>
            </div>
            <div className="ml-auto md:hidden">
              <Button onClick={logout} variant="ghost">
                退出
              </Button>
            </div>
          </div>
        </header>
        <main className={`mx-auto grid w-[min(1440px,calc(100vw-28px))] grid-cols-1 gap-5 py-5 transition-all duration-200 ease-out ${sidebarCollapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[188px_minmax(0,1fr)]"}`}>
          <Sidebar title="管理后台" routes={adminRoutes} collapsed={sidebarCollapsed} onCollapsedChange={handleSidebarCollapsedChange} />
          <section className="min-w-0">
            <MobileNav label="管理后台导航" routes={adminRoutes} />
            {children}
            <div className="mt-6 lg:hidden">
              <ConsoleLegalNote />
            </div>
          </section>
        </main>
      </div>
    </MockAuthGate>
  );
}
