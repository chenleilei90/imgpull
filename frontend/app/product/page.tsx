import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardHeader } from "@/components/ui/Card";

const flow = ["配置私有仓库", "提交源镜像", "预估并冻结积分", "分配 Worker", "复制并推送", "验证 digest", "结算或返还"];

export default function ProductPage() {
  return (
    <PublicLayout>
      <div className="section-title">
        <div className="eyebrow">产品介绍</div>
        <h1>面向 DevOps 的容器镜像同步平台</h1>
        <p>ImgPull 用于解决海外镜像在国内环境难以直接拉取的问题。用户提交源镜像和目标私有仓库后，平台负责复制、推送、校验和积分结算。</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="平台能力" />
          <ul className="space-y-3 text-sm leading-7 text-muted">
            <li>提交 Docker Hub、GHCR、Quay 等公开源镜像。</li>
            <li>推送到用户配置的 ACR、Harbor 或通用 Docker Registry。</li>
            <li>成功后展示 tag pull 和 digest pull 命令。</li>
            <li>失败后展示错误码、attempt 日志和积分返还结果。</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="适用场景" />
          <ul className="space-y-3 text-sm leading-7 text-muted">
            <li>国内环境无法直接拉取海外容器镜像。</li>
            <li>团队希望把常用镜像沉淀到自己的私有仓库。</li>
            <li>希望用积分和会员额度控制镜像同步成本。</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="计费简述" />
          <ul className="space-y-3 text-sm leading-7 text-muted">
            <li>提交任务前预估积分并冻结。</li>
            <li>成功后按实际消耗结算，P0 不超过冻结上限。</li>
            <li>任务失败全额返还冻结积分，并记录失败成本用于风控。</li>
          </ul>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader title="任务流程" description="流程既面向普通用户展示结果，也为后续 Worker 协议和后端状态机预留清晰节点。" />
        <div className="grid gap-3 md:grid-cols-7">
          {flow.map((item, index) => (
            <div className="rounded-[10px] border border-borderSoft bg-blue-50 p-4 text-center" key={item}>
              <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-primary">{index + 1}</div>
              <div className="text-sm font-black">{item}</div>
            </div>
          ))}
        </div>
      </Card>
    </PublicLayout>
  );
}
