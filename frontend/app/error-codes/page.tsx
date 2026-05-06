import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { errorCodes } from "@/lib/mock-data";

export default function ErrorCodesPage() {
  return (
    <PublicLayout>
      <div className="section-title">
        <div className="eyebrow">帮助中心 / 错误排查</div>
        <h1>错误码已并入帮助文档</h1>
        <p>错误码不再作为独立产品入口展示，统一放在帮助中心的“错误排查”分类中，方便用户按问题场景查找处理建议。</p>
      </div>
      <Card className="mb-5 border-blue-100 bg-blue-50">
        <CardHeader
          title="建议从帮助中心查看错误排查文章"
          description="常见错误码、认证失败、namespace 不存在、无 push 权限和 Worker 租约问题，都应该由帮助文档承接。"
          action={<Button href="/help" variant="primary">进入帮助中心</Button>}
        />
      </Card>
      <Card>
        <CardHeader title="常见错误码速查" description="当前保留速查表，后续可沉淀为帮助文章内容。" />
        <Table
          data={errorCodes}
          columns={[
            { key: "code", header: "错误码", className: "w-[220px]", render: (row) => <code className="whitespace-nowrap font-bold text-primary">{row.code}</code> },
            { key: "meaning", header: "含义", render: (row) => row.meaning },
            { key: "suggestion", header: "处理建议", render: (row) => <span className="text-sm text-muted">{row.suggestion}</span> }
          ]}
        />
      </Card>
    </PublicLayout>
  );
}
