"use client";

import { useState } from "react";
import { BatchTaskImportPanel } from "@/components/business/BatchTaskImportPanel";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Select } from "@/components/ui/Select";
import { registryAccounts } from "@/lib/mock-data";

type CreateMode = "single" | "batch";

export default function NewTaskPage() {
  const [mode, setMode] = useState<CreateMode>("single");
  const availableWorkers = 3;

  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>新建镜像任务</h1>
        <p>支持单个镜像创建，也支持一次粘贴多行镜像地址并生成多条独立任务。每条任务独立冻结积分、执行和失败返还。</p>
      </div>

      <div className="mb-5">
        <DemoNotice tone="security" />
      </div>

      <div className={`mb-5 rounded-panel border p-4 text-sm font-bold leading-7 ${
        availableWorkers > 0 ? "border-blue-100 bg-blue-50/70 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-800"
      }`}>
        {availableWorkers > 0 ? (
          <>当前可用 Worker 节点：{availableWorkers} 个。任务会根据节点状态、并发、权重和队列长度自动排队执行。</>
        ) : (
          <>当前暂无可用 Worker 节点，任务提交后将进入队列，管理员恢复节点后继续执行。</>
        )}
      </div>

      <div className="mb-5 inline-flex rounded-[10px] border border-borderSoft bg-white p-1 shadow-soft">
        {[
          { key: "single", label: "单个镜像" },
          { key: "batch", label: "批量导入" }
        ].map((item) => (
          <button
            className={`h-10 rounded-[8px] px-4 text-sm font-black transition ${
              mode === item.key ? "bg-primary text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:bg-slate-100"
            }`}
            key={item.key}
            onClick={() => setMode(item.key as CreateMode)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader title="任务参数" description="适合临时同步单个公开镜像，提交后系统会冻结预计积分并进入队列。" />
            <div className="space-y-4">
              <label className="field">
                <span className="label">源镜像地址</span>
                <input className="input" defaultValue="docker.io/library/nginx:latest" />
              </label>
              <label className="field">
                <span className="label">目标私有仓库</span>
                <Select
                  defaultValue={registryAccounts[0].id}
                  options={registryAccounts.map((registry) => ({
                    value: registry.id,
                    label: `${registry.name} / ${registry.namespace}`,
                    description: registry.endpoint
                  }))}
                />
              </label>
              <label className="field">
                <span className="label">目标镜像名</span>
                <input className="input" defaultValue="ops/nginx:latest" />
              </label>
              <label className="field">
                <span className="label">架构策略</span>
                <input className="input" value="P0 默认 all，后续可由后台配置" readOnly />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary">预估积分</Button>
                <Button href="/dashboard/tasks" variant="primary">提交并冻结积分</Button>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="预估结果" />
            <div className="space-y-3 text-sm leading-7 text-muted">
              <div className="rounded-[10px] bg-blue-50 p-4 font-extrabold text-primary">预计冻结 8 积分</div>
              <div>成功后按实际大小结算，P0 不超过冻结上限。</div>
              <div>失败后全额返还冻结积分，并写入积分流水和用户消息。</div>
            </div>
          </Card>
        </div>
      ) : (
        <BatchTaskImportPanel />
      )}
    </UserDashboardLayout>
  );
}
