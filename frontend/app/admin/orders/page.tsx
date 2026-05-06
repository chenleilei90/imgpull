import { ManualRechargePanel } from "@/components/business/ManualRechargePanel";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { formatMoney } from "@/lib/format";
import { rechargeOrders } from "@/lib/mock-data";
import { orderStatusMeta, payChannelMeta } from "@/lib/status";

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>订单管理</h1>
        <p>展示人工充值订单、支付渠道、到账状态和关闭订单。真实在线支付保持预留状态。</p>
      </div>
      <Card>
        <CardHeader title="人工充值操作" />
        <ManualRechargePanel />
      </Card>
      <Card className="mt-5">
        <CardHeader title="订单列表" />
        <Table
          data={rechargeOrders}
          columns={[
            { key: "id", header: "订单号", render: (row) => <code className="font-bold text-primary">{row.id}</code> },
            { key: "user", header: "用户", render: (row) => row.user },
            { key: "amount", header: "金额 / 积分", render: (row) => `${formatMoney(row.amountCents)} / ${row.points}` },
            { key: "channel", header: "渠道", render: (row) => <Badge tone={payChannelMeta[row.channel].tone}>{payChannelMeta[row.channel].label}</Badge> },
            { key: "status", header: "状态", render: (row) => <Badge tone={orderStatusMeta[row.status].tone}>{orderStatusMeta[row.status].label}</Badge> },
            { key: "note", header: "说明", render: (row) => <span className="text-sm text-muted">{row.note}</span> }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
