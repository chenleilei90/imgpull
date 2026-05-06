import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { activities } from "@/lib/mock-data";

export default function AdminActivitiesPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>活动管理</h1>
        <p>管理注册赠送、活动赠送和后台人工发放类活动。P0 仅展示状态和操作入口。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader title={activity.name} description={activity.rule} />
            <div className="mb-3 text-2xl font-black text-primary">{activity.reward}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={activity.status === "进行中" ? "green" : activity.status === "草稿" ? "amber" : "slate"}>{activity.status}</Badge>
              <Button variant="secondary">编辑</Button>
              <Button variant={activity.status === "进行中" ? "warning" : "success"}>{activity.status === "进行中" ? "停用" : "启用"}</Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
