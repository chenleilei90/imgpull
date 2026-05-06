import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="rounded-panel border border-dashed border-blue-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[10px] bg-blue-50 text-lg font-black text-primary">404</div>
        <h1 className="mb-2 text-2xl font-black text-ink">页面不存在</h1>
        <p className="mx-auto mb-5 max-w-xl text-sm font-bold leading-7 text-muted">
          没有找到对应页面。你可以返回首页，或进入帮助中心查看镜像同步、私有仓库配置和常见错误说明。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary">返回首页</Button>
          <Button href="/help" variant="secondary">返回帮助中心</Button>
        </div>
      </div>
    </PublicLayout>
  );
}
