import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SITE_COMPLIANCE_CONFIG } from "@/lib/constants";

const sections = [
  {
    title: "服务范围",
    body: "ImgPull 面向容器镜像同步场景，帮助用户提交公开镜像地址，并在真实后端接入后推送到用户配置的私有仓库。当前页面为演示版本占位，不构成正式服务承诺。"
  },
  {
    title: "用户账号",
    body: "用户应妥善保管账号信息，并确保提交的镜像同步请求、目标仓库地址和仓库权限来自合法授权。演示环境中的登录仅用于前端路由体验。"
  },
  {
    title: "积分与充值",
    body: "P0 展示积分冻结、成功结算、失败返还和管理员人工充值流程。正式上线前需要补充完整计费规则、退款规则和支付渠道条款。"
  },
  {
    title: "镜像同步任务",
    body: "用户提交任务后，每个镜像任务独立排队、执行、结算和失败返还。批量导入仅创建多条独立任务，不改变 Worker 执行模型。"
  },
  {
    title: "用户私有仓库凭据",
    body: "平台按凭据加密保存、管理员不可见明文、Worker 使用短期凭据的方向设计。正式上线前需要完成加密、审计、轮换和访问控制实现。"
  },
  {
    title: "禁止行为",
    body: "禁止提交未获授权的镜像、滥用同步资源、攻击平台或第三方 Registry、规避访问控制、上传或传播违法违规内容。"
  },
  {
    title: "免责声明",
    body: "当前为前端演示环境，不接真实后端、真实 Worker、真实支付或真实镜像复制。正式服务条款需由运营主体和法律顾问上线前确认。"
  },
  {
    title: "联系方式",
    body: `当前联系方式为占位：${SITE_COMPLIANCE_CONFIG.contactEmail}。正式上线前需配置真实客服邮箱、联系电话和服务支持渠道。`
  }
];

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="rounded-[14px] border border-blue-100 bg-white p-6 shadow-panel md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">公司与法律</div>
            <h1 className="mt-5 max-w-3xl text-[30px] font-black leading-tight text-ink md:text-[44px]">服务条款</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
              本页面为 ImgPull 前端演示版本的服务条款占位。正式上线前，需要由运营主体补充完整条款、主体信息、争议处理和合规要求。
            </p>
          </div>
          <Badge tone="amber">正式上线前待完善</Badge>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader title="条款状态" description="当前只提供页面位置和信息结构，不写真实公司资质或备案号。" />
          <div className="space-y-3 text-sm leading-7 text-muted">
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">版本：前端演示占位版</div>
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">适用范围：ImgPull 镜像同步服务展示流程</div>
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4">主体信息：{SITE_COMPLIANCE_CONFIG.companyName}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/privacy" variant="secondary">
              查看隐私政策
            </Button>
            <Button href="/help" variant="ghost">
              联系支持
            </Button>
          </div>
        </Card>

        <div className="grid gap-4">
          {sections.map((section, index) => (
            <Card key={section.title}>
              <div className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-primary">
                  {index + 1}
                </div>
                <div>
                  <h2 className="m-0 text-lg font-black text-ink">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{section.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
