"use client";

import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { createMockSession } from "@/lib/mock-auth";

export default function LoginPage() {
  const router = useRouter();

  function enter(role: "user" | "admin") {
    createMockSession(role);
    const next = new URLSearchParams(window.location.search).get("next");
    if (role === "admin") {
      router.push(next?.startsWith("/admin") ? next : "/admin");
      return;
    }
    router.push(next?.startsWith("/dashboard") ? next : "/dashboard");
  }

  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-6xl gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center rounded-[14px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 text-ink shadow-panel">
          <div className="mb-4 inline-flex w-fit rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-black text-primary shadow-soft">
            前端演示环境
          </div>
          <h1 className="m-0 text-4xl font-black leading-tight md:text-5xl">登录 ImgPull 控制台</h1>
          <p className="mt-4 text-base leading-8 text-muted">
            当前登录仅用于演示用户后台和管理员后台的访问保护，不连接真实账号系统，也不会保存真实 token、密码或 AccessKey。
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="rounded-[10px] border border-blue-100 bg-white/82 p-4 shadow-soft">普通用户：进入用户控制台，创建镜像同步任务。</div>
            <div className="rounded-[10px] border border-blue-100 bg-white/82 p-4 shadow-soft">管理员：进入管理后台，查看任务、Worker、订单和积分。</div>
          </div>
        </div>
        <Card className="p-6 md:p-8">
          <CardHeader title="选择演示身份" description="选择身份后会写入本地演示 session，用于前端路由保护。" />
          <div className="space-y-4">
            <label className="field">
              <span className="label">账号</span>
              <input className="input" defaultValue="ops@demo.com / super_admin" />
            </label>
            <label className="field">
              <span className="label">登录凭据</span>
              <input className="input" value="演示环境无需输入真实密码" readOnly />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={() => enter("user")} variant="primary" size="lg">以普通用户身份进入</Button>
              <Button onClick={() => enter("admin")} variant="secondary" size="lg">以管理员身份进入</Button>
            </div>
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm font-extrabold leading-7 text-amber-800">
              当前为演示模式。刷新页面后仍会保留本地 session；点击控制台右上角“退出”会清除 session。
            </div>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}
