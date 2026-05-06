import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>账号设置</h1>
        <p>展示基础账号信息、会员类型和通知偏好。真实账号、鉴权和密钥管理将在后端接入后启用。</p>
      </div>
      <Card>
        <CardHeader title="基础信息" />
        <div className="form-grid">
          <label className="field">
            <span className="label">邮箱</span>
            <input className="input" defaultValue="ops@demo.com" />
          </label>
          <label className="field">
            <span className="label">会员类型</span>
            <input className="input" defaultValue="专业会员" />
          </label>
          <label className="field">
            <span className="label">消息通知</span>
            <input className="input" defaultValue="站内消息开启" />
          </label>
          <label className="field">
            <span className="label">安全提示</span>
            <input className="input" value="前端演示环境不保存真实仓库凭据" readOnly />
          </label>
        </div>
        <div className="mt-4">
          <Button variant="primary">保存设置</Button>
        </div>
      </Card>
    </UserDashboardLayout>
  );
}
