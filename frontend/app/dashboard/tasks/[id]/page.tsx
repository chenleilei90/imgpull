import { DigestPanel } from "@/components/business/DigestPanel";
import { TaskLogs } from "@/components/business/TaskLogs";
import { TaskStatusBadges } from "@/components/business/TaskStatusBadges";
import { TaskSyncResultPanel } from "@/components/business/TaskSyncResultPanel";
import { TaskTimeline } from "@/components/business/TaskTimeline";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { mockApi } from "@/lib/mock-api";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = mockApi.getTask(id);

  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>任务详情</h1>
        <p>任务编号 {task.taskNo} / {task.title}</p>
      </div>
      <div className="space-y-5">
        <Card>
          <CardHeader title="同步结果" description="先看任务结果、镜像地址、积分处理和下一步建议；技术字段放在下方。" />
          <TaskSyncResultPanel task={task} />
        </Card>

        <Card>
          <CardHeader title="拉取命令与 Digest" description="tag 适合日常使用，digest 更适合固定版本和审计。" />
          <DigestPanel task={task} />
        </Card>

        {task.sourceType === "batch" ? (
          <Card>
            <CardHeader
              title="批量导入信息"
              description="该镜像来自轻量批量导入。批次只用于展示和管理，本任务仍按独立 ImageTask 冻结积分、执行和结算。"
              action={<Button href="/dashboard/tasks" variant="secondary">返回批次任务列表</Button>}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">
                <div className="text-xs font-black text-muted">所属批次</div>
                <div className="mt-1 break-all font-mono text-sm font-black text-ink">{task.batchNo ?? task.batchId}</div>
              </div>
              <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">
                <div className="text-xs font-black text-muted">批次内序号</div>
                <div className="mt-1 text-2xl font-black text-ink">{task.batchIndex} / {task.batchTotal}</div>
              </div>
              <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">
                <div className="text-xs font-black text-muted">结算方式</div>
                <div className="mt-1 text-sm font-extrabold text-slate-700">按单条任务独立结算</div>
              </div>
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="技术信息" description="底层状态字段保留给技术用户和后端状态机对齐。" />
          <TaskStatusBadges task={task} showLabels />
        </Card>

        <Card>
          <CardHeader title="阶段时间线" />
          <TaskTimeline task={task} />
        </Card>

        <Card>
          <CardHeader title="Attempt 记录与阶段日志" />
          <TaskLogs task={task} />
        </Card>
      </div>
    </UserDashboardLayout>
  );
}
