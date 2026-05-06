import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table } from "@/components/ui/Table";
import { auditLogs, imageTasks, rechargeOrders, workerNodes } from "@/lib/mock-data";
import { formatMoney } from "@/lib/format";

export default function AdminDashboardPage() {
  const paidOrders = rechargeOrders.filter((order) => order.status === "paid");
  const paidAmount = paidOrders.reduce((sum, order) => sum + order.amountCents, 0);

  return (
    <AdminLayout>
      <div className="section-title">
        <h1>管理员仪表盘</h1>
        <p>查看任务、Worker、积分订单和系统状态，保持 P0 运营视角清晰可控。</p>
      </div>
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard label="任务总数" value={String(imageTasks.length)} hint="成功 / 执行中 / 失败 / 排队" />
        <StatCard label="Worker 节点" value={String(workerNodes.length)} hint="含在线、维护、排空、软删除" />
        <StatCard label="今日人工充值" value={formatMoney(paidAmount)} hint="manual_recharge 已到账案例" />
        <StatCard label="系统模式" value="演示" hint="真实 API / DB / Worker 尚未接入" />
      </div>
      <Card>
        <CardHeader title="最近操作" />
        <Table
          data={auditLogs}
          columns={[
            { key: "time", header: "时间", render: (row) => row.time },
            { key: "actor", header: "操作者", render: (row) => row.actor },
            { key: "action", header: "动作", render: (row) => row.action },
            { key: "detail", header: "详情", render: (row) => <span className="text-sm text-muted">{row.detail}</span> }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
