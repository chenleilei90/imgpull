import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { errorCodes } from "@/lib/mock-data";

export default function AdminErrorCodesPage() {
  return (
    <AdminLayout>
      <div className="section-title">
        <h1>错误码内容已并入帮助文档</h1>
        <p>管理员不再单独维护一套错误码页面。错误码说明应作为帮助文章的一部分维护，避免用户在帮助中心和错误码中心之间来回查找。</p>
      </div>
      <Card className="mb-5 border-blue-100 bg-blue-50">
        <CardHeader
          title="去帮助文档管理中维护错误排查文章"
          description="P0 保留基础 Markdown 帮助文章管理；错误码可写入“错误排查”分类文章。"
          action={<Button href="/admin/docs" variant="primary">进入帮助文档管理</Button>}
        />
      </Card>
      <Card>
        <CardHeader title="错误码速查" description="用于管理员参考，正式维护入口在帮助文档管理。" />
        <Table
          data={errorCodes}
          columns={[
            { key: "code", header: "错误码", className: "w-[220px]", render: (row) => <code className="whitespace-nowrap font-bold text-primary">{row.code}</code> },
            { key: "meaning", header: "含义", render: (row) => row.meaning },
            { key: "suggestion", header: "处理建议", render: (row) => <span className="text-sm text-muted">{row.suggestion}</span> }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
