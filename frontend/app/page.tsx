import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const trustItems = ["支持 ACR / Harbor / Docker Registry", "失败返还积分", "Digest 校验", "凭据安全"];

const heroMetrics = [
  ["同步结果", "已完成"],
  ["Digest", "已校验"],
  ["积分", "返还 3"]
];

const capabilities = [
  ["公开镜像同步", "Docker Hub、GHCR、Quay 等公开镜像快速同步。"],
  ["推送到私有仓库", "目标仓库由用户自己控制，支持 ACR、Harbor 和通用 Docker Registry。"],
  ["轻量批量导入", "一次粘贴多行镜像地址，批量创建独立任务。"],
  ["失败返还与 Digest 校验", "任务失败自动返还积分，成功后展示 tag pull 和 digest pull。"]
];

const flow = [
  ["配置私有仓库", "添加 ACR、Harbor 或 Docker Registry 凭据。"],
  ["提交镜像任务", "支持单个镜像和最多 50 行轻量批量导入。"],
  ["拉取同步结果", "复制 tag pull 或 digest pull 命令，在自己的仓库中使用镜像。"]
];

const security = [
  ["凭据加密保存", "仓库凭据按加密字段设计，避免明文暴露。"],
  ["管理员不可见明文", "后台只展示凭据状态和连接结果。"],
  ["Worker 短期凭据", "后续真实执行节点只获取短期凭据引用。"],
  ["操作日志审计", "任务、积分、充值和管理员操作保留记录。"]
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="relative min-w-0 overflow-hidden rounded-panel border border-blue-100 bg-gradient-to-br from-white via-blue-50/45 to-cyan-50/35 px-5 py-8 shadow-soft md:px-10 lg:grid lg:grid-cols-[1.05fr_0.82fr] lg:items-center lg:gap-8">
        <div className="hero-grid absolute inset-0 opacity-55" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-green-400" />
        <div className="relative z-10">
          <div className="eyebrow">镜像同步到私有仓库</div>
          <h1 className="mt-5 max-w-4xl text-[31px] font-black leading-[1.16] text-ink md:text-[52px]">
            把海外容器镜像同步到你的私有仓库
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted md:text-lg">
            提交 Docker Hub、GHCR、Quay 等公开镜像地址，平台自动拉取、校验并推送到你的 ACR、Harbor 或 Docker Registry。支持单个任务和最多 50 行轻量批量导入。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/login" variant="primary" size="lg">
              立即同步镜像
            </Button>
            <Button href="/pricing" size="lg">
              查看价格
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {trustItems.map((item) => (
              <span className="rounded-[9px] border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-primary" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <Card className="relative z-10 mt-8 justify-self-end border-blue-100 bg-white/95 p-4 lg:mt-0 lg:max-w-[450px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-black text-ink">同步任务预览</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted">公开镜像同步到私有仓库，自动校验 Digest 并结算积分。</p>
            </div>
            <Badge tone="green">已同步</Badge>
          </div>
          <div className="mt-4 rounded-[12px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">已同步</Badge>
              <Badge tone="cyan">Digest 已校验</Badge>
              <Badge tone="green">失败自动返还</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <PreviewLine label="源镜像" value="docker.io/library/nginx:latest" />
              <PreviewLine label="目标仓库" value="registry.example.com/ops/nginx:latest" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {heroMetrics.map(([label, value]) => (
                <div className="rounded-[10px] border border-white bg-white/85 p-3" key={label}>
                  <div className="text-xs font-black text-muted">{label}</div>
                  <div className="mt-1 text-sm font-black text-ink">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-7">
        <SectionHeading title="核心能力" description="围绕镜像复制、私有仓库推送、批量提交和结果校验，保留访客最需要理解的四件事。" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map(([title, desc], index) => (
            <Card className="p-5" key={title}>
              <div className="grid h-9 w-9 place-items-center rounded-[9px] bg-blue-50 text-sm font-black text-primary">{index + 1}</div>
              <div className="mt-4 text-lg font-black text-ink">{title}</div>
              <p className="mt-2 text-sm leading-7 text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-7 rounded-panel border border-blue-100 bg-white p-5 shadow-soft md:p-6">
        <SectionHeading title="三步完成同步" description="从仓库配置到最终拉取命令，保持流程短、结果清楚。" compact />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {flow.map(([title, desc], index) => (
            <div className="relative rounded-[12px] border border-borderSoft bg-slate-50 p-5" key={title}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-sm font-black text-white">{index + 1}</span>
                <div className="text-lg font-black text-ink">{title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading title="安全与信任" description="关键凭据和任务过程保持可追踪、可审计，正式上线前补齐合规配置。" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {security.map(([title, desc]) => (
            <Card className="p-5" key={title}>
              <div className="mb-3 h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" />
              <div className="text-lg font-black text-ink">{title}</div>
              <p className="mt-2 text-sm leading-7 text-muted">{desc}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 rounded-[12px] border border-blue-100 bg-blue-50/70 p-4 text-sm font-bold leading-7 text-slate-700">
          正式上线前可配置 ICP 备案、公安备案、服务条款、隐私政策和联系方式；更详细的数据安全说明可查看隐私政策。
        </div>
      </section>

      <section className="mt-7 rounded-panel border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 text-ink shadow-soft md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-sm font-black text-primary">按积分使用，失败自动返还</div>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">从一条镜像开始，把常用镜像沉淀到自己的仓库</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              注册送积分，支持管理员人工充值，后续预留支付宝 / 微信支付。完整套餐和会员权益请查看价格页面。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/pricing" size="lg">
              查看价格
            </Button>
            <Button href="/login" variant="primary" size="lg">
              立即开始
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 break-all rounded-[10px] bg-white px-3 py-2 font-mono text-xs font-bold text-slate-700">
        {value}
      </div>
    </div>
  );
}

function SectionHeading({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "section-title"}>
      <h1 className={compact ? "m-0 text-2xl font-black text-ink md:text-3xl" : undefined}>{title}</h1>
      <p className={compact ? "mt-2 max-w-3xl text-sm leading-7 text-muted" : undefined}>{description}</p>
    </div>
  );
}
