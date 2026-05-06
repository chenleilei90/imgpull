import { PointLedger } from "@/components/business/PointLedger";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { formatMoney } from "@/lib/format";
import { payChannelMeta } from "@/lib/status";
import { pointTransactions, rechargePackages } from "@/lib/mock-data";

export default function PointsPage() {
  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>积分中心</h1>
        <p>查看当前积分、冻结积分、充值包、人工充值说明和支付渠道状态。</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader title="账户积分" />
          <div className="grid gap-3">
            <div className="rounded-[10px] bg-blue-50 p-4">
              <div className="text-sm font-extrabold text-muted">当前积分</div>
              <div className="text-4xl font-black text-primary">576</div>
            </div>
            <div className="rounded-[10px] bg-amber-50 p-4">
              <div className="text-sm font-extrabold text-muted">冻结积分</div>
              <div className="text-4xl font-black text-warning">8</div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="充值包" description="P0 支持管理员人工充值，支付宝 / 微信支付暂未开通。" />
          <Table
            data={rechargePackages}
            columns={[
              { key: "name", header: "名称", render: (row) => <div className="font-black">{row.name}</div> },
              { key: "amount", header: "金额", render: (row) => formatMoney(row.amountCents) },
              { key: "points", header: "积分", render: (row) => row.points },
              { key: "desc", header: "说明", render: (row) => row.description }
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={payChannelMeta.manual.tone}>{payChannelMeta.manual.label}</Badge>
            <Badge tone={payChannelMeta.alipay.tone}>{payChannelMeta.alipay.label}</Badge>
            <Badge tone={payChannelMeta.wechat.tone}>{payChannelMeta.wechat.label}</Badge>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted">
            人工充值说明：用户线下付款或联系管理员，管理员后台确认后创建订单、支付记录、积分流水、操作日志和到账通知。
          </p>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader title="积分流水" />
        <PointLedger rows={pointTransactions} />
      </Card>
    </UserDashboardLayout>
  );
}
