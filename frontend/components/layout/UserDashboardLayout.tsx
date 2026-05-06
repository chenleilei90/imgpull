"use client";

import Link from "next/link";
import { useState } from "react";
import { MockAuthGate } from "@/components/auth/MockAuthGate";
import { ConsoleLegalNote } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { clearMockSession, useMockSession } from "@/lib/mock-auth";
import { userRoutes } from "@/lib/routes";

const USER_SIDEBAR_COLLAPSED_KEY = "imgpull:user-sidebar-collapsed";

function readStoredSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(USER_SIDEBAR_COLLAPSED_KEY) === "true";
}

export function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = useMockSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readStoredSidebarCollapsed);

  function logout() {
    clearMockSession();
    window.location.href = "/";
  }

  function handleSidebarCollapsedChange(nextCollapsed: boolean) {
    setSidebarCollapsed(nextCollapsed);
    window.localStorage.setItem(USER_SIDEBAR_COLLAPSED_KEY, String(nextCollapsed));
  }

  return (
    <MockAuthGate requiredRole="user">
      <div className="min-h-screen bg-page">
        <header className="sticky top-0 z-30 border-b border-borderSoft bg-white/92 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[68px] w-[min(1440px,calc(100vw-28px))] items-center gap-3">
            <Link className="flex items-center gap-3 text-lg font-black text-ink" href="/" title="返回首页">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-sm font-black text-white shadow-soft">IP</span>
              <span className="hidden sm:inline">ImgPull 控制台</span>
            </Link>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <span className="text-sm font-extrabold text-slate-700">{session?.name ?? "运维同学"}</span>
              <Link className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-primary" href="/dashboard/points">
                可用 {session?.points ?? 576} 积分
              </Link>
              <Link className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700" href="/dashboard/points">
                冻结 {session?.frozenPoints ?? 8} 积分
              </Link>
              <Link className="relative rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700" href="/dashboard/messages">
                消息
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>
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
        <main className={`mx-auto grid w-[min(1440px,calc(100vw-28px))] grid-cols-1 gap-5 py-5 transition-all duration-200 ease-out ${sidebarCollapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[264px_minmax(0,1fr)]"}`}>
          <Sidebar title="用户控制台" routes={userRoutes} collapsed={sidebarCollapsed} onCollapsedChange={handleSidebarCollapsedChange} />
          <section className="min-w-0">
            <MobileNav label="用户控制台导航" routes={userRoutes} />
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
