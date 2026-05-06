import { PublicLayout } from "@/components/layout/PublicLayout";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <EmptyState title="页面不存在" description="没有找到对应页面，请返回首页或进入控制台继续操作。" actionHref="/" actionText="返回首页" />
    </PublicLayout>
  );
}
