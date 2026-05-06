import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { systemHealth } from "@/lib/mock-data";

export default function HealthPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>系统健康</h1>
        <p>展示系统组件状态，并明确真实 API、数据库、Worker 调度和支付回调尚未接入。</p>
      </div>
      <Card>
        <CardHeader title="健康检查" />
        <Table
          data={systemHealth}
          columns={[
            { key: "name", header: "组件", render: (row) => <div className="font-black">{row.name}</div> },
            { key: "status", header: "状态", render: (row) => <Badge tone={row.status === "正常" ? "green" : "slate"}>{row.status}</Badge> },
            { key: "value", header: "说明", render: (row) => <span className="text-sm text-muted">{row.value}</span> }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
