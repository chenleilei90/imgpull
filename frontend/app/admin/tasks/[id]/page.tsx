import { DigestPanel } from "@/components/business/DigestPanel";
import { TaskListPreviewPanel } from "@/components/business/TaskListPreviewPanel";
import { TaskLogs } from "@/components/business/TaskLogs";
import { TaskStatusBadges } from "@/components/business/TaskStatusBadges";
import { TaskSyncResultPanel } from "@/components/business/TaskSyncResultPanel";
import { TaskTimeline } from "@/components/business/TaskTimeline";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { mockApi } from "@/lib/mock-api";

export default async function AdminTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = mockApi.getTask(id);
  const previewTasks = mockApi.getTasks().slice(0, 2);

  return (
    <AdminLayout>
      <div className="section-title">
        <div className="mb-4 flex min-h-10 flex-wrap items-center gap-3">
          <Button href="/admin/tasks" variant="secondary" size="md" className="relative top-[3px] h-10 leading-none">← 返回任务列表</Button>
          <span className="flex h-10 items-center text-sm font-black leading-none text-muted">管理员仪表盘 / 任务管理 / 任务详情</span>
        </div>
        <h1>任务详情</h1>
        <p>任务编号 {task.taskNo} / {task.title}</p>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="同步结果" description="管理员查看任务结果、目标镜像、积分结算、Worker 执行和失败原因。" />
          <TaskSyncResultPanel task={task} audience="admin" />
        </Card>

        <TaskListPreviewPanel tasks={previewTasks} />

        <Card>
          <CardHeader title="拉取命令与 Digest" description="tag 适合日常使用，digest 适合固定版本和审计。" />
          <DigestPanel task={task} />
        </Card>

        <Card>
          <CardHeader title="技术状态" description="底层状态字段用于后续后端状态机和 Worker 协议对齐。" />
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
    </AdminLayout>
  );
}
