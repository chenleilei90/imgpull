import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SITE_COMPLIANCE_CONFIG } from "@/lib/constants";

const sections = [
  {
    title: "收集的信息类型",
    body: "正式环境可能处理账号资料、镜像地址、目标仓库配置、任务状态、积分流水、订单记录和必要的安全审计信息。当前演示版本不连接真实账号系统。"
  },
  {
    title: "仓库凭据保护",
    body: "仓库凭据按加密字段、密钥版本、解密审计和短期凭据引用方向设计。管理员不可查看明文凭据，日志不应输出密码、Token 或 authfile 内容。"
  },
  {
    title: "任务日志和镜像地址",
    body: "镜像地址、阶段日志、错误码和 digest 信息用于展示任务进度、排查失败原因和生成拉取命令。正式上线前需定义日志脱敏和保留周期。"
  },
  {
    title: "积分与订单数据",
    body: "积分余额、冻结积分、流水、充值订单和支付记录用于费用结算、人工充值确认和账务审计。P0 在线支付仅保留模型与页面占位。"
  },
  {
    title: "数据保留",
    body: "正式环境需要配置任务记录、日志、订单、积分流水和审计日志的保留策略。当前页面只说明产品设计方向，不代表最终保留期限。"
  },
  {
    title: "数据安全",
    body: "产品设计包含凭据加密、日志脱敏、管理员操作审计、Worker 短期凭据和失败返还记录。真实安全实现需在后端阶段完成并验证。"
  },
  {
    title: "用户权利",
    body: "正式上线后，用户应能够查询账号资料、任务记录、订单记录，并根据适用规则申请更正、删除或导出相关数据。"
  },
  {
    title: "联系方式",
    body: `隐私相关问题可通过占位邮箱联系：${SITE_COMPLIANCE_CONFIG.contactEmail}。正式上线前需替换为真实联系方式和处理流程。`
  }
];

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="rounded-[14px] border border-cyan-100 bg-white p-6 shadow-panel md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">数据安全说明</div>
            <h1 className="mt-5 max-w-3xl text-[30px] font-black leading-tight text-ink md:text-[44px]">隐私政策</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
              本页面为 ImgPull 前端演示版本的隐私政策占位。正式上线前，需要补充完整数据处理规则、运营主体、用户权利和合规联系方式。
            </p>
          </div>
          <Badge tone="cyan">隐私政策待正式配置</Badge>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader title="隐私边界" description="当前演示环境不接真实后端，不处理真实支付、Worker 或 registry copy。" />
          <div className="space-y-3 text-sm leading-7 text-muted">
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">不写真实备案号或公司资质。</div>
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">不保存真实 token、password、AccessKey 或仓库凭据。</div>
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">正式上线前需补充完整隐私政策和数据安全流程。</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/terms" variant="secondary">
              查看服务条款
            </Button>
            <Button href="/product" variant="ghost">
              查看安全说明
            </Button>
          </div>
        </Card>

        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.title}>
              <h2 className="m-0 text-lg font-black text-ink">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{section.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
