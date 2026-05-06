import Link from "next/link";
import { MessageList } from "@/components/business/MessageList";
import { TaskStatusBadges } from "@/components/business/TaskStatusBadges";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table } from "@/components/ui/Table";
import { dashboardStats, imageTasks, pointTransactions, registryAccounts, userMessages } from "@/lib/mock-data";
import { formatPoints } from "@/lib/format";
import { displayTaskResult, registryConnectionMeta } from "@/lib/status";

export default function DashboardPage() {
  const runningTask = imageTasks.find((task) => task.taskStatus === "running");
  const recentTasks = imageTasks.slice(0, 3);

  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>仪表盘</h1>
        <p>快速查看可用积分、冻结积分、执行中的镜像任务、仓库连接状态、最近积分流水和站内消息。</p>
      </div>
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {dashboardStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader
            title="正在执行"
            description={runningTask ? `${runningTask.sourceImage} 正在推送到 ${runningTask.registryName}` : "当前没有执行中的任务。"}
            action={<Button href="/dashboard/tasks/new" variant="primary">快速创建任务</Button>}
          />
          {runningTask ? (
            <div className="rounded-[12px] border border-blue-100 bg-blue-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="font-black">{runningTask.title}</div>
                <Badge tone="cyan">{runningTask.progress}%</Badge>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${runningTask.progress}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                <span>当前阶段：{runningTask.currentStage}</span>
                <span>冻结积分：{runningTask.frozenPoints}</span>
                <Link className="font-extrabold text-primary" href={`/dashboard/tasks/${runningTask.id}`}>查看详情</Link>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="仓库连接" description="建议只选择测试成功的仓库提交同步任务。" />
          <div className="space-y-3">
            {registryAccounts.slice(0, 3).map((registry) => (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-borderSoft bg-slate-50 p-3" key={registry.id}>
                <div>
                  <div className="font-black">{registry.name}</div>
                  <div className="break-all text-xs text-muted">{registry.endpoint}/{registry.namespace}</div>
                </div>
                <Badge tone={registryConnectionMeta[registry.status].tone}>{registryConnectionMeta[registry.status].label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader title="最近同步结果" action={<Button href="/dashboard/tasks">查看全部</Button>} />
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div className="rounded-[10px] border border-borderSoft bg-white p-4 shadow-soft" key={task.id}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Link className="font-black text-primary" href={`/dashboard/tasks/${task.id}`}>{task.title}</Link>
                  <span className="text-sm font-extrabold text-slate-600">{displayTaskResult(task.taskStatus, task.billingStatus)}</span>
                </div>
                <TaskStatusBadges task={task} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="最近积分流水" action={<Button href="/dashboard/points">积分中心</Button>} />
          <Table
            data={pointTransactions.slice(0, 4)}
            columns={[
              { key: "title", header: "类型", render: (row) => <span className="font-black">{row.title}</span> },
              { key: "balance", header: "余额", render: (row) => formatPoints(row.balanceDelta) },
              { key: "frozen", header: "冻结", render: (row) => formatPoints(row.frozenDelta) }
            ]}
          />
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="最近消息" action={<Button href="/dashboard/messages">消息中心</Button>} />
        <MessageList messages={userMessages.slice(0, 3)} />
      </Card>
    </UserDashboardLayout>
  );
}
