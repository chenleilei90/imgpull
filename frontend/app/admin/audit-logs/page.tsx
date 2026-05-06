import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { auditLogs } from "@/lib/mock-data";

export default function AdminAuditLogsPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>操作日志</h1>
        <p>记录管理员人工充值、节点状态调整、公告更新和系统自动返还等关键动作。</p>
      </div>
      <Card>
        <CardHeader title="审计记录" />
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
