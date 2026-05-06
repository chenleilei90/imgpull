import { ManualRechargePanel } from "@/components/business/ManualRechargePanel";
import { PointLedger } from "@/components/business/PointLedger";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { pointTransactions } from "@/lib/mock-data";

export default function AdminPointsPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>积分管理</h1>
        <p>管理员可以查看积分流水，并通过独立的人工充值流程给用户加积分。积分修正和人工充值在业务上保持区分。</p>
      </div>
      <Card>
        <CardHeader title="人工充值" description="该操作会创建订单、支付记录、积分流水、操作日志和用户到账通知。当前为前端演示。" />
        <ManualRechargePanel />
      </Card>
      <Card className="mt-5">
        <CardHeader title="积分流水" />
        <PointLedger rows={pointTransactions} />
      </Card>
    </AdminLayout>
  );
}
