import { RegistryConnectionTester } from "@/components/business/RegistryConnectionTester";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { registryAccounts } from "@/lib/mock-data";

export default function DashboardRegistriesPage() {
  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>私有仓库管理</h1>
        <p>添加目标仓库、测试连接状态，并明确认证失败、无 push 权限、项目不存在和自签证书等常见问题。</p>
      </div>
      <Card>
        <CardHeader title="添加 / 测试仓库" />
        <RegistryConnectionTester registries={registryAccounts} />
      </Card>
    </UserDashboardLayout>
  );
}
