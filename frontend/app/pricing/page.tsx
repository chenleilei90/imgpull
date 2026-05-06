import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { rechargePackages } from "@/lib/mock-data";
import { formatMoney } from "@/lib/format";

const plans = [
  { name: "普通会员", price: "基础额度", desc: "注册送积分，适合少量镜像同步。", tone: "blue" as const },
  { name: "专业会员", price: "更高额度", desc: "更高每日任务额度，适合高频 DevOps 场景。", tone: "cyan" as const },
  { name: "积分充值包", price: "按包购买", desc: "P0 支持管理员人工充值，在线支付保持预留状态。", tone: "green" as const }
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="section-title">
        <div className="eyebrow">价格会员</div>
        <h1>以积分为核心的轻量计费模型</h1>
        <p>第一版展示普通会员、专业会员和积分充值包。支付宝 / 微信支付暂未开通，只保留订单模型和界面占位。</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader title={plan.name} description={plan.desc} action={<Badge tone={plan.tone}>{plan.price}</Badge>} />
            <div className="space-y-2 text-sm leading-7 text-muted">
              <div>每日任务次数由后台套餐控制。</div>
              <div>任务按预估积分冻结，成功后结算。</div>
              <div>失败任务全额返还冻结积分。</div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <CardHeader title="充值包" description="用户可以在积分中心查看充值包和人工充值说明，管理员确认后到账。" />
        <div className="grid gap-3 md:grid-cols-3">
          {rechargePackages.map((pkg) => (
            <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4" key={pkg.id}>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-black">{pkg.name}</div>
                <Badge tone="green">启用</Badge>
              </div>
              <div className="text-2xl font-black">{formatMoney(pkg.amountCents)}</div>
              <div className="mt-1 text-sm text-muted">{pkg.points} 积分 / {pkg.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </PublicLayout>
  );
}
