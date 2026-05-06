import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { formatMoney } from "@/lib/format";
import { rechargeOrders } from "@/lib/mock-data";
import { orderStatusMeta, payChannelMeta } from "@/lib/status";

export default function OrdersPage() {
  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>订单记录</h1>
        <p>覆盖人工充值待确认、已到账、关闭订单，以及支付宝 / 微信支付预留状态。</p>
      </div>
      <Card>
        <CardHeader title="充值订单" />
        <Table
          data={rechargeOrders}
          columns={[
            { key: "id", header: "订单号", render: (row) => <code className="font-bold text-primary">{row.id}</code> },
            { key: "item", header: "项目", render: (row) => row.item },
            { key: "amount", header: "金额 / 积分", render: (row) => `${formatMoney(row.amountCents)} / ${row.points}` },
            { key: "channel", header: "支付渠道", render: (row) => <Badge tone={payChannelMeta[row.channel].tone}>{payChannelMeta[row.channel].label}</Badge> },
            { key: "status", header: "状态", render: (row) => <Badge tone={orderStatusMeta[row.status].tone}>{orderStatusMeta[row.status].label}</Badge> },
            { key: "note", header: "说明", render: (row) => <span className="text-sm text-muted">{row.note}</span> }
          ]}
        />
      </Card>
    </UserDashboardLayout>
  );
}
