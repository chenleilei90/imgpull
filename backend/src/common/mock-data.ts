export const mockUsers = [
  { id: 1, email: "ops@example.test", status: "normal", balancePoints: 576, frozenPoints: 8 },
  { id: 2, email: "dev@example.test", status: "normal", balancePoints: 86, frozenPoints: 0 }
];

export const mockAdmins = [
  { id: 1, username: "super_admin", role: "super_admin", status: "normal" }
];

export const mockRegistryAccounts = [
  {
    id: 1,
    name: "阿里云测试仓库",
    provider: "aliyun_acr",
    registryUrl: "registry.cn-hangzhou.example.test",
    namespace: "ops",
    status: "test_success"
  },
  {
    id: 2,
    name: "Harbor 只读仓库",
    provider: "harbor",
    registryUrl: "harbor.example.test",
    namespace: "readonly",
    status: "push_denied"
  }
];

export const mockImageTasks = [
  {
    id: 1,
    taskNo: "img-20260503-000",
    title: "成功任务",
    sourceImage: "ghcr.io/acme/api:v1.8",
    targetImage: "harbor.example.test/platform/api:v1.8",
    taskStatus: "succeeded",
    billingStatus: "settled",
    workerStatus: "completed",
    currentStage: "completed",
    errorCode: null
  },
  {
    id: 2,
    taskNo: "img-20260503-001",
    title: "执行中任务",
    sourceImage: "docker.io/library/nginx:latest",
    targetImage: "registry.cn-hangzhou.example.test/ops/nginx:latest",
    taskStatus: "running",
    billingStatus: "frozen",
    workerStatus: "running",
    currentStage: "pushing",
    errorCode: null
  },
  {
    id: 3,
    taskNo: "img-20260502-118",
    title: "失败并返还积分任务",
    sourceImage: "quay.io/coreos/etcd:v3.5",
    targetImage: "ccr.example.test/ops/etcd:v3.5",
    taskStatus: "failed",
    billingStatus: "refunded",
    workerStatus: "completed",
    currentStage: "failed",
    errorCode: "TARGET_AUTH_FAILED"
  },
  {
    id: 4,
    taskNo: "img-20260502-119",
    title: "排队任务",
    sourceImage: "registry.k8s.io/pause:3.9",
    targetImage: "swr.example.test/ops/pause:3.9",
    taskStatus: "queued",
    billingStatus: "frozen",
    workerStatus: "unclaimed",
    currentStage: "queued",
    errorCode: null
  }
];

export const mockPointTransactions = [
  { id: 1, type: "register_bonus", balanceDelta: 30, frozenDelta: 0, refType: "user" },
  { id: 2, type: "freeze", balanceDelta: -8, frozenDelta: 8, refType: "image_task" },
  { id: 3, type: "consume", balanceDelta: 3, frozenDelta: -10, refType: "image_task" },
  { id: 4, type: "refund", balanceDelta: 12, frozenDelta: -12, refType: "image_task" },
  { id: 5, type: "manual_recharge", balanceDelta: 200, frozenDelta: 0, refType: "recharge_order" },
  { id: 6, type: "activity_grant", balanceDelta: 50, frozenDelta: 0, refType: "activity" }
];

export const mockOrders = [
  { id: 1, orderNo: "ord-20260503-001", status: "pending", payChannel: "manual", amountCents: 1000, points: 100 },
  { id: 2, orderNo: "ord-20260503-002", status: "paid", payChannel: "manual", amountCents: 2000, points: 200 },
  { id: 3, orderNo: "ord-20260502-010", status: "closed", payChannel: "manual", amountCents: 500, points: 50 }
];

export const mockWorkers = [
  { id: 1, name: "harbor-01", status: "online", executorType: "skopeo" },
  { id: 2, name: "harbor-02", status: "maintenance", executorType: "crane" },
  { id: 3, name: "harbor-03", status: "draining", executorType: "nerdctl" },
  { id: 4, name: "harbor-04", status: "offline", executorType: "docker" },
  { id: 5, name: "harbor-disabled", status: "disabled", executorType: "skopeo" },
  { id: 6, name: "harbor-old", status: "retired", executorType: "docker" },
  { id: 7, name: "harbor-deleted", status: "deleted", executorType: "skopeo" }
];

export const mockActivities = [
  { id: 1, title: "新用户注册送积分", type: "register_bonus", rewardPoints: 30, status: "enabled" },
  { id: 2, title: "五一运维活动", type: "claim_points", rewardPoints: 50, status: "enabled" }
];

export const mockMessages = [
  { id: 1, title: "任务成功通知", type: "task", read: false },
  { id: 2, title: "任务失败并积分返还通知", type: "task", read: false },
  { id: 3, title: "人工充值到账通知", type: "order", read: true }
];

export const mockAnnouncements = [
  { id: 1, title: "Worker 节点扩容公告", status: "published" }
];

export const mockHelpArticles = [
  { id: 1, slug: "registry-credentials", title: "如何配置私有仓库凭据", status: "published" }
];

export const mockErrorCodes = [
  { code: "TARGET_AUTH_FAILED", message: "目标仓库认证失败", suggestion: "检查用户名、Robot Account 或 Token" },
  { code: "TARGET_NAMESPACE_MISSING", message: "目标 namespace / project 不存在", suggestion: "先创建 namespace / project" }
];

export const mockAuditLogs = [
  { id: 1, actor: "super_admin", action: "manual_recharge", detail: "人工充值骨架审计记录" }
];

export const mockMembershipPlans = [
  { id: 1, code: "free", name: "免费用户", grantPoints: 30 },
  { id: 2, code: "standard", name: "普通会员", grantPoints: 300 },
  { id: 3, code: "pro", name: "专业会员", grantPoints: 1500 }
];

export const mockSystemConfigs = [
  { key: "payment.manual.enabled", value: true },
  { key: "payment.alipay.enabled", value: false },
  { key: "worker.execution.enabled", value: false }
];
