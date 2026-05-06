import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { activities } from "@/lib/mock-data";

export default function ActivitiesPage() {
  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>活动中心</h1>
        <p>用户可以查看活动并领取积分，活动赠送会写入积分流水并发送到账通知。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader title={activity.name} description={activity.rule} />
            <div className="mb-3 text-2xl font-black text-primary">{activity.reward}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={activity.status === "进行中" ? "green" : "slate"}>{activity.status}</Badge>
              <Button variant="secondary">领取积分</Button>
            </div>
          </Card>
        ))}
      </div>
    </UserDashboardLayout>
  );
}
