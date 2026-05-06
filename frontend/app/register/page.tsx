"use client";

import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { createMockSession } from "@/lib/mock-auth";

export default function RegisterPage() {
  const router = useRouter();

  function registerDemo() {
    createMockSession("user");
    router.push("/dashboard");
  }

  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-6xl gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <div className="eyebrow">首次注册赠送积分</div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-ink md:text-5xl">创建 ImgPull 账号</h1>
          <p className="mt-4 text-base leading-8 text-muted">
            注册页用于演示用户进入流程。当前不提交表单到后端，不保存真实密码；真实账号系统将在后端接入后启用。
          </p>
        </div>
        <Card className="p-6 md:p-8">
          <CardHeader title="注册信息" description="完成后进入用户控制台，并展示注册送积分流程。" />
          <div className="space-y-4">
            <label className="field">
              <span className="label">邮箱</span>
              <input className="input" defaultValue="new-ops@example.com" />
            </label>
            <label className="field">
              <span className="label">昵称</span>
              <input className="input" defaultValue="运维同学" />
            </label>
            <div className="rounded-[10px] border border-green-200 bg-green-50 p-4 text-sm font-extrabold text-green-700">
              注册成功后可领取 30 积分，用于首次镜像同步任务。
            </div>
            <Button onClick={registerDemo} variant="primary" size="lg" className="w-full">注册并进入用户控制台</Button>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}
