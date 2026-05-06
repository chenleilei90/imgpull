import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { adminUsers } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>用户管理</h1>
        <p>P0 管理员只保留 super_admin 视角，不做 RBAC。用户信息展示已脱敏为前端可演示字段。</p>
      </div>
      <Card>
        <CardHeader title="用户列表" />
        <Table
          data={adminUsers}
          columns={[
            { key: "email", header: "用户", render: (row) => <div className="font-black">{row.email}</div> },
            { key: "role", header: "会员", render: (row) => row.role },
            { key: "balance", header: "积分", render: (row) => `${row.balance} / 冻结 ${row.frozen}` },
            { key: "tasks", header: "任务数", render: (row) => row.taskCount },
            { key: "risk", header: "风险", render: (row) => <Badge tone={row.risk === "正常" ? "green" : "amber"}>{row.risk}</Badge> }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
