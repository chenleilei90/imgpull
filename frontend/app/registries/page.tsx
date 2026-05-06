import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

const registryMatrix = [
  {
    name: "阿里云 ACR",
    method: "Registry V2 push",
    namespace: "需提前创建命名空间和仓库路径",
    test: "登录校验 + push 权限探测",
    tls: "云厂商证书，通常无需额外 CA",
    note: "作为 UI 预设和配置指引，不调用阿里云 OpenAPI",
    tone: "blue" as const
  },
  {
    name: "腾讯云 TCR",
    method: "Registry V2 push",
    namespace: "需提前创建 namespace / project",
    test: "登录校验 + push 权限探测",
    tls: "云厂商证书，P0 不处理 OpenAPI 权限",
    note: "建议使用专用 Robot Account",
    tone: "cyan" as const
  },
  {
    name: "华为云 SWR",
    method: "Registry V2 push",
    namespace: "组织或命名空间需提前存在",
    test: "登录校验 + push 权限探测",
    tls: "标准 HTTPS registry 地址",
    note: "按用户填写的 registry 地址推送",
    tone: "blue" as const
  },
  {
    name: "火山云镜像仓库",
    method: "Registry V2 push",
    namespace: "目标项目和路径需提前存在",
    test: "登录校验 + push 权限探测",
    tls: "标准 registry TLS 校验",
    note: "作为界面预设和帮助说明",
    tone: "green" as const
  },
  {
    name: "自建 Harbor",
    method: "Registry V2 push",
    namespace: "Harbor project 必须提前创建",
    test: "登录校验 + push 权限探测",
    tls: "自签名证书需管理员在 Worker 配可信 CA",
    note: "适合企业自建 Harbor 或公网可访问 Harbor",
    tone: "amber" as const
  },
  {
    name: "通用 Docker Registry",
    method: "Registry V2 push",
    namespace: "仓库路径由用户自行规划",
    test: "登录校验 + push 权限探测",
    tls: "建议使用可信证书",
    note: "兼容标准 Docker Registry V2 的私有仓库",
    tone: "slate" as const
  }
];

const boundaries = [
  "目标 namespace / project 需提前存在，P0 不自动创建仓库或项目。",
  "各云厂商仅作为 UI 预设和帮助说明，后端统一走 Docker Registry V2 push。",
  "Harbor 自签名证书需要管理员在 Worker 节点配置可信 CA。",
  "测试连接只验证登录和 push 权限，不调用云厂商 OpenAPI。"
];

export default function RegistriesPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden rounded-panel border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-cyan-50 p-6 shadow-soft md:p-8">
        <div className="hero-grid absolute inset-0 opacity-35" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <div className="eyebrow">支持仓库</div>
            <h1 className="mt-4 max-w-4xl text-[32px] font-black leading-tight text-ink md:text-[46px]">
              一套 Registry V2 推送协议，覆盖主流云仓库和自建 Harbor
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
              P0 后端统一使用 Docker Registry V2 push。阿里云、腾讯云、华为云、火山云、Harbor 和通用 Registry 作为 UI 预设和帮助说明，不接云厂商 OpenAPI。
            </p>
          </div>
          <div className="rounded-panel border border-blue-100 bg-white/90 p-5 shadow-soft">
            <div className="text-sm font-black text-primary">统一协议边界</div>
            <div className="mt-3 grid gap-3 text-sm">
              <InfoLine label="后端协议" value="Docker Registry V2 push" />
              <InfoLine label="创建策略" value="P0 不自动创建 namespace / project" />
              <InfoLine label="权限建议" value="专用 Robot Account + 最小 push 权限" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader
            title="仓库支持矩阵"
            description="以矩阵方式说明每类仓库的接入方式、权限边界和证书要求，便于用户在创建任务前自查配置。"
          />
          <Table
            data={registryMatrix}
            rowKey={(row) => row.name}
            minWidth="min-w-[1080px]"
            columns={[
              {
                key: "name",
                header: "仓库类型",
                className: "w-[160px]",
                render: (row) => <div className="flex items-center gap-2"><Badge tone={row.tone}>{row.name}</Badge></div>
              },
              { key: "method", header: "支持方式", className: "w-[150px]", render: (row) => <span className="font-bold text-ink">{row.method}</span> },
              { key: "namespace", header: "namespace / project", className: "w-[210px]", render: (row) => <span className="text-sm leading-6 text-slate-700">{row.namespace}</span> },
              { key: "test", header: "测试连接能力", className: "w-[180px]", render: (row) => <span className="text-sm leading-6 text-slate-700">{row.test}</span> },
              { key: "tls", header: "自签名证书说明", className: "w-[220px]", render: (row) => <span className="text-sm leading-6 text-slate-700">{row.tls}</span> },
              { key: "note", header: "备注", className: "w-[260px]", render: (row) => <span className="text-sm leading-6 text-muted">{row.note}</span> }
            ]}
          />
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {boundaries.map((item, index) => (
          <div className="rounded-panel border border-borderSoft bg-white p-4 shadow-soft" key={item}>
            <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-blue-50 text-sm font-black text-primary">{index + 1}</div>
            <p className="mt-3 text-sm font-bold leading-7 text-slate-700">{item}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
      <div className="text-xs font-black uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-bold leading-6 text-ink">{value}</div>
    </div>
  );
}
