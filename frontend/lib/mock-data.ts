import type { Activity, AdminUser, AuditLog, ErrorCodeDoc, HelpArticle, HelpCategory } from "@/types/admin";
import type { PointTransaction, RechargePackage } from "@/types/billing";
import type { UserMessage } from "@/types/message";
import type { RechargeOrder } from "@/types/order";
import type { RegistryAccount } from "@/types/registry";
import type { ImageTask, ImageTaskBatch, TaskStageStatus } from "@/types/task";
import type { WorkerNode } from "@/types/worker";

const stageNames = [
  "提交任务",
  "参数校验",
  "积分冻结",
  "进入排队",
  "节点分配",
  "解析源镜像",
  "复制镜像",
  "推送目标仓库",
  "验证 digest",
  "积分结算"
];

function stages(activeIndex: number, failedIndex?: number) {
  return stageNames.map((name, index) => {
    let status: TaskStageStatus = "pending";
    if (failedIndex === index) status = "failed";
    else if (index < activeIndex) status = "success";
    else if (index === activeIndex) status = "running";

    return {
      name,
      status,
      time: index < activeIndex || failedIndex === index ? `2026-05-03 0${Math.min(index, 8)}:${index}0` : "-"
    };
  });
}

export const imageTasks: ImageTask[] = [
  {
    id: "img-20260503-000",
    taskNo: "IMG-QNX-8042",
    taskNoNormalized: "IMGQNX8042",
    title: "生产 API 镜像同步完成",
    sourceImage: "ghcr.io/acme/api:v1.8",
    targetImage: "harbor.ops.example.com/platform/api:v1.8",
    registryName: "Harbor 运维项目",
    workerName: "worker-online",
    taskStatus: "succeeded",
    billingStatus: "settled",
    workerStatus: "completed",
    currentStage: "积分结算",
    progress: 100,
    estimatedPoints: 10,
    frozenPoints: 0,
    settledPoints: 7,
    refundedPoints: 3,
    sourceDigest: "sha256:source-api-a12f",
    sourceManifestDigest: "sha256:manifest-source-api-a12f",
    targetDigest: "sha256:target-api-a12f",
    targetManifestDigest: "sha256:manifest-api-a12f",
    tagPullCommand: "docker pull harbor.ops.example.com/platform/api:v1.8",
    digestPullCommand: "docker pull harbor.ops.example.com/platform/api@sha256:manifest-api-a12f",
    stages: stages(10),
    attempts: [
      {
        attemptNo: 1,
        worker: "worker-online",
        status: "success",
        startedAt: "2026-05-03 00:11",
        endedAt: "2026-05-03 00:18",
        logs: [
          "任务编号 IMG-QNX-8042",
          "skopeo inspect 成功，解析 source digest",
          "copy 完成，pulled=4.6GB pushed=4.6GB",
          "target manifest digest 校验一致",
          "冻结 10 积分，成功结算 7，退回差额 3"
        ]
      }
    ],
    createdAt: "2026-05-03 00:10"
  },
  {
    id: "img-20260503-001",
    taskNo: "IMG-ACR-4827",
    taskNoNormalized: "IMGACR4827",
    title: "Nginx 官方镜像同步中",
    sourceImage: "docker.io/library/nginx:latest",
    targetImage: "registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest",
    registryName: "阿里云 ACR 测试仓库",
    workerName: "worker-online",
    taskStatus: "running",
    billingStatus: "frozen",
    workerStatus: "running",
    currentStage: "推送目标仓库",
    progress: 72,
    estimatedPoints: 8,
    frozenPoints: 8,
    settledPoints: 0,
    refundedPoints: 0,
    sourceDigest: "sha256:source-nginx-91c4",
    sourceManifestDigest: "sha256:manifest-source-nginx-91c4",
    targetDigest: "等待推送完成",
    targetManifestDigest: "等待目标验证",
    tagPullCommand: "docker pull registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest",
    digestPullCommand: "等待 target digest 生成后展示",
    stages: stages(7),
    attempts: [
      {
        attemptNo: 1,
        worker: "worker-online",
        status: "running",
        startedAt: "2026-05-03 00:22",
        logs: [
          "任务编号 IMG-ACR-4827",
          "Worker 已领取任务",
          "源镜像 manifest 解析成功，架构策略 linux/amd64",
          "正在复制 layer sha256:ab12",
          "已推送 3.8GB / 5.2GB"
        ]
      }
    ],
    createdAt: "2026-05-03 00:20"
  },
  {
    id: "img-20260502-118",
    taskNo: "IMG-HBR-2190",
    taskNoNormalized: "IMGHBR2190",
    title: "目标仓库认证失败，积分已返还",
    sourceImage: "quay.io/coreos/etcd:v3.5",
    targetImage: "ccr.ccs.tencentyun.com/ops/etcd:v3.5",
    registryName: "腾讯云 TCR",
    workerName: "worker-draining",
    taskStatus: "failed",
    billingStatus: "refunded",
    workerStatus: "completed",
    currentStage: "推送目标仓库",
    progress: 58,
    estimatedPoints: 12,
    frozenPoints: 0,
    settledPoints: 0,
    refundedPoints: 12,
    sourceDigest: "sha256:source-etcd-ff91",
    sourceManifestDigest: "sha256:manifest-source-etcd-ff91",
    targetDigest: "未生成",
    targetManifestDigest: "未生成",
    tagPullCommand: "任务失败，未生成可拉取 tag",
    digestPullCommand: "任务失败，未生成 digest pull 命令",
    errorCode: "TARGET_AUTH_FAILED",
    failureReason: "目标仓库认证失败，请检查用户名、Robot Account 或 Token。",
    stages: stages(7, 7),
    attempts: [
      {
        attemptNo: 1,
        worker: "worker-draining",
        status: "failed",
        startedAt: "2026-05-02 23:10",
        endedAt: "2026-05-02 23:25",
        logs: ["任务编号 IMG-HBR-2190", "拉取阶段超时，触发一次自动重试", "失败成本已记录到风控统计"]
      },
      {
        attemptNo: 2,
        worker: "worker-draining",
        status: "failed",
        startedAt: "2026-05-02 23:28",
        endedAt: "2026-05-02 23:31",
        logs: [
          "任务编号 IMG-HBR-2190",
          "目标仓库认证失败",
          "错误码 TARGET_AUTH_FAILED",
          "冻结 12 积分已全额返还",
          "用户消息已生成：任务失败并积分返还"
        ]
      }
    ],
    createdAt: "2026-05-02 23:08"
  },
  {
    id: "img-20260502-119",
    taskNo: "IMG-SWR-3906",
    taskNoNormalized: "IMGSWR3906",
    title: "Pause 镜像排队中",
    sourceImage: "registry.k8s.io/pause:3.9",
    targetImage: "swr.cn-east-3.myhuaweicloud.com/ops/pause:3.9",
    registryName: "华为云 SWR",
    workerName: "等待分配",
    taskStatus: "queued",
    billingStatus: "frozen",
    workerStatus: "unclaimed",
    currentStage: "进入排队",
    progress: 30,
    estimatedPoints: 3,
    frozenPoints: 3,
    settledPoints: 0,
    refundedPoints: 0,
    sourceDigest: "等待解析",
    sourceManifestDigest: "等待解析",
    targetDigest: "等待推送",
    targetManifestDigest: "等待验证",
    tagPullCommand: "等待任务成功后生成",
    digestPullCommand: "等待任务成功后生成",
    stages: stages(3),
    attempts: [
      {
        attemptNo: 1,
        worker: "等待分配",
        status: "running",
        startedAt: "2026-05-02 23:40",
        logs: ["任务编号 IMG-SWR-3906", "任务已创建", "冻结 3 积分", "等待 Worker 调度"]
      }
    ],
    createdAt: "2026-05-02 23:40"
  },
  {
    id: "img-20260504-b001-01",
    taskNo: "IMG-BAT-1001",
    taskNoNormalized: "IMGBAT1001",
    title: "批量导入：nginx 镜像排队中",
    sourceImage: "docker.io/library/nginx:latest",
    targetImage: "registry.cn-hangzhou.aliyuncs.com/ops/nginx:latest",
    sourceType: "batch",
    batchId: "batch-20260504-001",
    batchNo: "BAT-HBR-2190",
    batchIndex: 1,
    batchTotal: 3,
    registryName: "阿里云 ACR 测试仓库",
    workerName: "等待分配",
    taskStatus: "queued",
    billingStatus: "frozen",
    workerStatus: "unclaimed",
    currentStage: "进入排队",
    progress: 25,
    estimatedPoints: 8,
    frozenPoints: 8,
    settledPoints: 0,
    refundedPoints: 0,
    sourceDigest: "等待解析",
    sourceManifestDigest: "等待解析",
    targetDigest: "等待推送",
    targetManifestDigest: "等待验证",
    tagPullCommand: "等待任务成功后生成",
    digestPullCommand: "等待任务成功后生成",
    stages: stages(3),
    attempts: [
      {
        attemptNo: 1,
        worker: "等待分配",
        status: "running",
        startedAt: "2026-05-04 09:00",
        logs: ["任务编号 IMG-BAT-1001", "批次编号 BAT-HBR-2190", "当前镜像作为独立任务进入队列", "冻结 8 积分"]
      }
    ],
    createdAt: "2026-05-04 09:00"
  },
  {
    id: "img-20260504-b001-02",
    taskNo: "IMG-BAT-1002",
    taskNoNormalized: "IMGBAT1002",
    title: "批量导入：etcd 镜像同步中",
    sourceImage: "quay.io/coreos/etcd:v3.5",
    targetImage: "registry.cn-hangzhou.aliyuncs.com/ops/etcd:v3.5",
    sourceType: "batch",
    batchId: "batch-20260504-001",
    batchNo: "BAT-HBR-2190",
    batchIndex: 2,
    batchTotal: 3,
    registryName: "阿里云 ACR 测试仓库",
    workerName: "worker-online",
    taskStatus: "running",
    billingStatus: "frozen",
    workerStatus: "running",
    currentStage: "复制镜像",
    progress: 61,
    estimatedPoints: 12,
    frozenPoints: 12,
    settledPoints: 0,
    refundedPoints: 0,
    sourceDigest: "sha256:source-etcd-batch-35",
    sourceManifestDigest: "sha256:manifest-source-etcd-batch-35",
    targetDigest: "等待推送完成",
    targetManifestDigest: "等待目标验证",
    tagPullCommand: "docker pull registry.cn-hangzhou.aliyuncs.com/ops/etcd:v3.5",
    digestPullCommand: "等待 target digest 生成后展示",
    stages: stages(6),
    attempts: [
      {
        attemptNo: 1,
        worker: "worker-online",
        status: "running",
        startedAt: "2026-05-04 09:02",
        logs: ["任务编号 IMG-BAT-1002", "批次编号 BAT-HBR-2190", "Worker 已领取批量导入中的第 2 条任务", "源镜像解析完成", "正在复制 layer sha256:7f35"]
      }
    ],
    createdAt: "2026-05-04 09:00"
  },
  {
    id: "img-20260504-b001-03",
    taskNo: "IMG-BAT-1003",
    taskNoNormalized: "IMGBAT1003",
    title: "批量导入：pause 镜像同步完成",
    sourceImage: "registry.k8s.io/pause:3.9",
    targetImage: "registry.cn-hangzhou.aliyuncs.com/ops/pause:3.9",
    sourceType: "batch",
    batchId: "batch-20260504-001",
    batchNo: "BAT-HBR-2190",
    batchIndex: 3,
    batchTotal: 3,
    registryName: "阿里云 ACR 测试仓库",
    workerName: "worker-online",
    taskStatus: "succeeded",
    billingStatus: "settled",
    workerStatus: "completed",
    currentStage: "积分结算",
    progress: 100,
    estimatedPoints: 3,
    frozenPoints: 0,
    settledPoints: 2,
    refundedPoints: 1,
    sourceDigest: "sha256:source-pause-batch-39",
    sourceManifestDigest: "sha256:manifest-source-pause-batch-39",
    targetDigest: "sha256:target-pause-batch-39",
    targetManifestDigest: "sha256:manifest-pause-batch-39",
    tagPullCommand: "docker pull registry.cn-hangzhou.aliyuncs.com/ops/pause:3.9",
    digestPullCommand: "docker pull registry.cn-hangzhou.aliyuncs.com/ops/pause@sha256:manifest-pause-batch-39",
    stages: stages(10),
    attempts: [
      {
        attemptNo: 1,
        worker: "worker-online",
        status: "success",
        startedAt: "2026-05-04 09:03",
        endedAt: "2026-05-04 09:06",
        logs: ["任务编号 IMG-BAT-1003", "批次编号 BAT-HBR-2190", "target manifest digest 校验一致", "冻结 3 积分，成功结算 2，退回差额 1"]
      }
    ],
    createdAt: "2026-05-04 09:00"
  }
];

export const taskBatches: ImageTaskBatch[] = [
  {
    id: "batch-20260504-001",
    batchNo: "BAT-HBR-2190",
    sourceType: "manual_text",
    totalCount: 5,
    validCount: 3,
    invalidCount: 2,
    estimatedFrozenPoints: 23,
    status: "submitted",
    createdAt: "2026-05-04 09:00"
  }
];

export const pointTransactions: PointTransaction[] = [
  { id: "pt-001", type: "register_bonus", title: "注册赠送", refType: "user", refId: "user-001", balanceDelta: 30, frozenDelta: 0, balanceAfter: 330, frozenAfter: 0, remark: "首次注册赠送 30 积分", createdAt: "2026-05-01 10:00" },
  { id: "pt-002", type: "task_freeze", title: "积分冻结", refType: "image_task", refId: "img-20260503-001", balanceDelta: -8, frozenDelta: 8, balanceAfter: 322, frozenAfter: 8, remark: "新任务提交，冻结预计积分", createdAt: "2026-05-03 00:20" },
  { id: "pt-003", type: "task_settle", title: "成功结算", refType: "image_task", refId: "img-20260503-000", balanceDelta: 3, frozenDelta: -10, balanceAfter: 326, frozenAfter: 8, remark: "实际消费 7 积分，退回差额 3", createdAt: "2026-05-03 00:18" },
  { id: "pt-004", type: "task_refund", title: "失败返还", refType: "image_task", refId: "img-20260502-118", balanceDelta: 12, frozenDelta: -12, balanceAfter: 323, frozenAfter: 0, remark: "任务失败，全额返还冻结积分", createdAt: "2026-05-02 23:32" },
  { id: "pt-005", type: "manual_recharge", title: "管理员人工充值", refType: "recharge_order", refId: "ord-20260503-002", balanceDelta: 200, frozenDelta: 0, balanceAfter: 526, frozenAfter: 8, remark: "线下收款后管理员确认到账", createdAt: "2026-05-03 00:21" },
  { id: "pt-006", type: "activity_bonus", title: "活动赠送", refType: "activity", refId: "act-202605", balanceDelta: 50, frozenDelta: 0, balanceAfter: 576, frozenAfter: 8, remark: "活动中心领取五一运维活动积分", createdAt: "2026-05-02 18:20" }
];

export const rechargePackages: RechargePackage[] = [
  { id: "pkg-100", name: "积分包 100", amountCents: 1000, points: 100, description: "适合少量镜像同步", enabled: true },
  { id: "pkg-500", name: "积分包 500", amountCents: 3900, points: 500, description: "适合批量常用镜像", enabled: true },
  { id: "pkg-1500", name: "积分包 1500", amountCents: 9900, points: 1500, description: "适合高频运维场景", enabled: true }
];

export const rechargeOrders: RechargeOrder[] = [
  { id: "ord-20260503-001", user: "ops@demo.com", item: "人工充值订单：待确认", amountCents: 1000, points: 100, channel: "manual", status: "pending", note: "用户线下付款后等待管理员确认", createdAt: "2026-05-03 00:02" },
  { id: "ord-20260503-002", user: "ops@demo.com", item: "人工充值订单：已到账", amountCents: 2000, points: 200, channel: "manual", status: "paid", note: "管理员确认到账，已写入积分流水", createdAt: "2026-05-03 00:21" },
  { id: "ord-20260502-010", user: "ops@demo.com", item: "关闭订单", amountCents: 500, points: 50, channel: "manual", status: "closed", note: "用户取消线下付款", createdAt: "2026-05-02 18:10" },
  { id: "ord-20260502-011", user: "dev@demo.com", item: "支付宝预留状态", amountCents: 3900, points: 500, channel: "alipay", status: "reserved", note: "暂未开通，不生成二维码", createdAt: "2026-05-02 17:40" },
  { id: "ord-20260502-012", user: "dev@demo.com", item: "微信支付预留状态", amountCents: 3900, points: 500, channel: "wechat", status: "reserved", note: "暂未开通，不接支付 SDK", createdAt: "2026-05-02 17:42" }
];

export const registryAccounts: RegistryAccount[] = [
  { id: "reg-001", name: "阿里云 ACR 测试仓库", provider: "aliyun_acr", endpoint: "registry.cn-hangzhou.aliyuncs.com", namespace: "ops", usernameHint: "Robot Account", status: "success", lastTestAt: "2026-05-03 00:01", remark: "login + push 权限探测通过" },
  { id: "reg-002", name: "腾讯云 TCR", provider: "tencent_tcr", endpoint: "ccr.ccs.tencentyun.com", namespace: "ops", usernameHint: "Robot Account", status: "auth_failed", lastTestAt: "2026-05-02 22:12", remark: "认证失败，请检查凭据" },
  { id: "reg-003", name: "只读 Harbor", provider: "harbor", endpoint: "harbor.ops.example.com", namespace: "readonly", usernameHint: "Robot Account", status: "push_denied", lastTestAt: "2026-05-02 21:48", remark: "账号只有 pull 权限" },
  { id: "reg-004", name: "华为云 SWR", provider: "huawei_swr", endpoint: "swr.cn-east-3.myhuaweicloud.com", namespace: "missing-project", usernameHint: "用户名", status: "namespace_missing", lastTestAt: "2026-05-02 21:30", remark: "namespace / project 需先创建" },
  { id: "reg-005", name: "自建 Harbor", provider: "harbor", endpoint: "harbor.internal.example.com", namespace: "platform", usernameHint: "Robot Account", status: "tls_ca_required", lastTestAt: "2026-05-02 20:16", remark: "自签证书需管理员在 Worker 配可信 CA" }
];

export const workerNodes: WorkerNode[] = [
  {
    id: "worker-001",
    name: "worker-hangzhou-acr-01",
    status: "online",
    executor: "skopeo",
    activeTasks: 3,
    maxConcurrency: 8,
    weight: 100,
    labels: ["aliyun-acr", "high-bandwidth"],
    version: "v0.1.0-poc",
    lastHeartbeat: "1 分钟前",
    failureRate: "1.8%",
    cpu: 42,
    disk: 64,
    successRate: "98.2%",
    region: "华东 1",
    updatedAt: "1 分钟前",
    note: "参与正常调度",
    runningTasks: [
      { id: "img-20260503-001", title: "Nginx 官方镜像同步中", stage: "推送目标仓库" },
      { id: "img-20260503-010", title: "API 镜像推送中", stage: "复制镜像" }
    ],
    recentEvents: ["1 分钟前：心跳正常", "3 分钟前：领取 img-20260503-001", "8 分钟前：完成 img-20260503-000"],
    recentError: "最近 24 小时无严重错误"
  },
  {
    id: "worker-002",
    name: "worker-harbor-maintenance",
    status: "maintenance",
    executor: "crane",
    activeTasks: 0,
    maxConcurrency: 4,
    weight: 60,
    labels: ["harbor", "backup"],
    version: "v0.1.0-poc",
    lastHeartbeat: "8 分钟前",
    failureRate: "2.6%",
    cpu: 11,
    disk: 44,
    successRate: "97.4%",
    region: "本地实验室",
    updatedAt: "8 分钟前",
    note: "维护中，不领取新任务",
    runningTasks: [],
    recentEvents: ["8 分钟前：进入维护", "12 分钟前：心跳正常", "20 分钟前：管理员更新权重"],
    recentError: "升级窗口内暂停调度"
  },
  {
    id: "worker-003",
    name: "worker-hk-draining",
    status: "draining",
    executor: "nerdctl",
    activeTasks: 1,
    maxConcurrency: 6,
    weight: 80,
    labels: ["harbor", "legacy"],
    version: "v0.1.0-poc",
    lastHeartbeat: "2 分钟前",
    failureRate: "3.9%",
    cpu: 31,
    disk: 58,
    successRate: "96.1%",
    region: "华南",
    updatedAt: "2 分钟前",
    note: "排空中，只完成已领取任务",
    runningTasks: [{ id: "img-20260502-118", title: "etcd 镜像重试任务", stage: "等待失败返还" }],
    recentEvents: ["2 分钟前：心跳正常", "5 分钟前：进入排空", "16 分钟前：目标仓库认证失败"],
    recentError: "TARGET_AUTH_FAILED：目标仓库认证失败"
  },
  {
    id: "worker-004",
    name: "worker-local-offline",
    status: "offline",
    executor: "docker",
    activeTasks: 0,
    maxConcurrency: 3,
    weight: 30,
    labels: ["local-lab"],
    version: "v0.0.9",
    lastHeartbeat: "35 分钟前",
    failureRate: "8.2%",
    cpu: 0,
    disk: 72,
    successRate: "91.8%",
    region: "本地实验室",
    updatedAt: "35 分钟前",
    note: "心跳超时",
    runningTasks: [],
    recentEvents: ["35 分钟前：最后一次心跳", "36 分钟前：网络探测失败", "40 分钟前：磁盘使用率 72%"],
    recentError: "WORKER_HEARTBEAT_LOST：心跳超时"
  },
  {
    id: "worker-005",
    name: "worker-disabled-risk",
    status: "disabled",
    executor: "skopeo",
    activeTasks: 0,
    maxConcurrency: 4,
    weight: 40,
    labels: ["risk-hold"],
    version: "v0.1.0-poc",
    lastHeartbeat: "1 天前",
    failureRate: "停用",
    cpu: 0,
    disk: 18,
    successRate: "停用",
    region: "华东 1",
    updatedAt: "1 天前",
    note: "管理员禁用，不参与调度",
    runningTasks: [],
    recentEvents: ["1 天前：管理员禁用节点", "1 天前：清理临时目录", "2 天前：失败率超过阈值"],
    recentError: "管理员手动禁用"
  },
  {
    id: "worker-006",
    name: "worker-retired-legacy",
    status: "retired",
    executor: "docker",
    activeTasks: 0,
    maxConcurrency: 2,
    weight: 0,
    labels: ["archive"],
    version: "v0.0.8",
    lastHeartbeat: "7 天前",
    failureRate: "退役",
    cpu: 0,
    disk: 0,
    successRate: "退役",
    region: "旧节点",
    updatedAt: "7 天前",
    note: "保留历史任务记录",
    runningTasks: [],
    recentEvents: ["7 天前：节点退役", "7 天前：停止领取任务", "8 天前：迁移任务记录"],
    recentError: "无"
  },
  {
    id: "worker-007",
    name: "worker-soft-deleted",
    status: "deleted",
    executor: "skopeo",
    activeTasks: 0,
    maxConcurrency: 0,
    weight: 0,
    labels: ["soft-deleted"],
    version: "v0.0.8",
    lastHeartbeat: "10 天前",
    failureRate: "已软删除",
    cpu: 0,
    disk: 0,
    successRate: "已软删除",
    region: "旧节点",
    updatedAt: "10 天前",
    note: "不参与调度，可恢复或最终清理",
    runningTasks: [],
    recentEvents: ["10 天前：软删除节点", "10 天前：退役完成", "11 天前：确认无运行任务"],
    recentError: "无"
  }
];

export const userMessages: UserMessage[] = [
  { id: "msg-001", title: "任务 IMG-QNX-8042 同步成功", type: "task", read: false, time: "2026-05-03 00:26", content: "任务 IMG-QNX-8042 已成功，目标镜像可拉取。", targetText: "查看任务", targetUrl: "/dashboard/tasks/img-20260503-000" },
  { id: "msg-002", title: "任务 IMG-HBR-2190 失败，积分已返还", type: "task", read: false, time: "2026-05-03 00:12", content: "任务 IMG-HBR-2190 失败，错误码 TARGET_AUTH_FAILED，12 积分已返还。", targetText: "查看任务", targetUrl: "/dashboard/tasks/img-20260502-118" },
  { id: "msg-003", title: "人工充值到账通知", type: "order", read: true, time: "2026-05-03 00:21", content: "管理员已确认 ord-20260503-002，200 积分已到账。", targetText: "查看订单", targetUrl: "/dashboard/orders" },
  { id: "msg-004", title: "活动积分到账通知", type: "points", read: true, time: "2026-05-02 18:20", content: "五一运维活动 50 积分已到账。", targetText: "查看积分流水", targetUrl: "/dashboard/points" },
  { id: "msg-005", title: "系统公告通知", type: "announcement", read: false, time: "2026-05-02 09:00", content: "本周将扩容 Worker 节点，不影响已提交任务。", targetText: "查看公告", targetUrl: "/dashboard/messages" }
];

export const activities: Activity[] = [
  { id: "act-register", name: "新用户注册赠送", reward: "注册后领取 30 积分", status: "进行中", rule: "每个账号一次" },
  { id: "act-202605", name: "五一运维活动", reward: "点击领取 50 积分", status: "进行中", rule: "2026-05-01 至 2026-05-07" },
  { id: "act-harbor", name: "Harbor 迁移补贴", reward: "低失败率用户额外赠送", status: "已结束", rule: "后台人工发放" }
];

export const errorCodes: ErrorCodeDoc[] = [
  { code: "SOURCE_NOT_FOUND", meaning: "源镜像不存在或无法访问", suggestion: "检查镜像名、tag 和源站连通性。" },
  { code: "SOURCE_REGISTRY_UNREACHABLE", meaning: "源 registry 网络不可达", suggestion: "更换可访问源、配置代理或等待网络恢复。" },
  { code: "TARGET_AUTH_FAILED", meaning: "目标仓库认证失败", suggestion: "检查用户名、密码、Robot Account 或 Token。" },
  { code: "TARGET_NAMESPACE_MISSING", meaning: "目标 namespace / project 不存在", suggestion: "先在云厂商控制台创建 namespace / project，P0 不自动创建。" },
  { code: "TARGET_PUSH_DENIED", meaning: "目标仓库无 push 权限", suggestion: "给 Robot Account 增加 push 权限，避免使用只读账号。" },
  { code: "REGISTRY_TLS_ERROR", meaning: "目标 registry TLS 校验失败", suggestion: "Harbor 自签证书需管理员在 Worker 节点配置可信 CA。" },
  { code: "WORKER_LEASE_EXPIRED", meaning: "Worker 租约过期", suggestion: "系统会重新调度或标记失败返还积分。" }
];

export const adminUsers: AdminUser[] = [
  { id: "user-001", email: "ops@demo.com", role: "专业会员", balance: 576, frozen: 8, taskCount: 38, risk: "正常" },
  { id: "user-002", email: "dev@demo.com", role: "普通会员", balance: 86, frozen: 0, taskCount: 9, risk: "正常" },
  { id: "user-003", email: "risk@demo.com", role: "普通会员", balance: 12, frozen: 0, taskCount: 24, risk: "关注" }
];

export const auditLogs: AuditLog[] = [
  { id: "audit-001", time: "2026-05-03 00:21", actor: "super_admin", action: "人工充值", detail: "为 ops@demo.com 增加 200 积分，写入 manual_recharge 流水。" },
  { id: "audit-002", time: "2026-05-03 00:18", actor: "super_admin", action: "排空节点", detail: "worker-draining 进入 draining，只完成已领取任务。" },
  { id: "audit-003", time: "2026-05-03 00:12", actor: "system", action: "失败返还", detail: "img-20260502-118 全额返还 12 积分。" },
  { id: "audit-004", time: "2026-05-02 22:40", actor: "super_admin", action: "更新公告", detail: "发布 Worker 扩容公告。" }
];

export const announcements = [
  { id: "ann-001", title: "Worker 节点扩容公告", status: "已发布", time: "2026-05-02 09:00", summary: "本周扩容节点，不影响已提交任务。" },
  { id: "ann-002", title: "人工充值说明更新", status: "草稿", time: "2026-05-01 18:00", summary: "补充线下付款和管理员确认流程。" }
];

export const helpCategories: HelpCategory[] = [
  { id: "hc-quickstart", slug: "quickstart", name: "快速开始", description: "新用户配置仓库、提交任务和查看同步结果的入门内容。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-tasks", slug: "image-tasks", name: "镜像任务", description: "镜像地址、单个任务、批量导入、任务状态和结果查看。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-registries", slug: "registry-accounts", name: "私有仓库配置", description: "目标 Registry 地址、命名空间、Robot Account 和 push 权限说明。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-cloud", slug: "cloud-registries", name: "云厂商仓库", description: "阿里云 ACR、腾讯云 TCR、华为云 SWR 和火山云仓库配置说明。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-harbor", slug: "harbor", name: "Harbor / 自建仓库", description: "自建 Harbor、通用 Docker Registry 和自签名证书边界。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-billing", slug: "billing", name: "计费与积分", description: "积分冻结、成功结算、失败返还和人工充值说明。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-troubleshooting", slug: "troubleshooting", name: "错误排查", description: "常见错误码、认证失败、namespace 不存在和 push 权限处理。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-runtime", slug: "docker-containerd", name: "Docker / containerd", description: "同步后的镜像在 Docker、containerd 和常见容器运行环境中的使用。", status: "enabled", updatedAt: "2026-05-04" },
  { id: "hc-nas", slug: "nas-1panel", name: "NAS / 群晖 / 1Panel", description: "面向 NAS、群晖、1Panel 等轻量运行环境的镜像使用说明。", status: "enabled", updatedAt: "2026-05-04" }
];

export const helpArticles: HelpArticle[] = [
  {
    id: "help-001",
    slug: "docker-hub-image-address",
    title: "如何填写 Docker Hub 镜像地址",
    summary: "说明 Docker Hub 官方镜像、组织镜像和 tag 的填写方式，避免源镜像解析失败。",
    category: "快速开始",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 4,
    tags: ["推荐", "常见"],
    contentMarkdown: `# 如何填写 Docker Hub 镜像地址

Docker Hub 镜像地址建议写完整路径，避免同名镜像造成歧义。

## 官方镜像

- nginx: \`docker.io/library/nginx:latest\`
- redis: \`docker.io/library/redis:7\`
- postgres: \`docker.io/library/postgres:16\`

## 组织镜像

如果镜像属于某个组织，需要包含组织名：

\`\`\`bash
docker.io/bitnami/nginx:latest
docker.io/grafana/grafana:10.4.0
\`\`\`

## 建议

- 始终填写 tag，不建议只写镜像名。
- 生产环境优先使用固定版本 tag。
- 如果任务成功，结果页会同时给出 tag pull 和 digest pull 命令。`
  },
  {
    id: "help-002",
    slug: "aliyun-acr-setup",
    title: "如何配置阿里云 ACR",
    summary: "配置阿里云 ACR registry 地址、命名空间和 Robot Account 的基本步骤。",
    category: "云厂商仓库",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 5,
    tags: ["推荐"],
    contentMarkdown: `# 如何配置阿里云 ACR

ImgPull 在 P0 阶段统一使用 Docker Registry V2 push，不调用阿里云 OpenAPI。

## 准备工作

1. 在 ACR 控制台创建命名空间。
2. 创建目标仓库或确认目标路径可 push。
3. 准备只用于同步的 Robot Account。
4. 给 Robot Account 最小 push 权限。

## 填写示例

\`\`\`text
Registry 地址: registry.cn-hangzhou.aliyuncs.com
Namespace / Project: ops
用户名: Robot Account
密码 / Token: 由阿里云控制台生成
\`\`\`

## 注意

目标 namespace / project 需要提前存在，P0 不自动创建仓库或项目。`
  },
  {
    id: "help-003",
    slug: "tencent-tcr-setup",
    title: "如何配置腾讯云 TCR",
    summary: "说明腾讯云 TCR 的地址、项目路径和 push 权限配置注意事项。",
    category: "云厂商仓库",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 4,
    tags: ["常见"],
    contentMarkdown: `# 如何配置腾讯云 TCR

腾讯云 TCR 在 ImgPull 中作为 Registry V2 push 目标仓库使用。

## 检查项

- 目标实例地址可访问。
- 命名空间或项目已存在。
- 账号具备 push 权限。
- 不要使用只有 pull 权限的只读账号。

## 常见错误

- \`TARGET_AUTH_FAILED\`: 用户名、密码或 Token 错误。
- \`TARGET_PUSH_DENIED\`: 账号没有 push 权限。
- \`TARGET_NAMESPACE_MISSING\`: 目标 namespace / project 未创建。`
  },
  {
    id: "help-004",
    slug: "harbor-setup",
    title: "如何配置自建 Harbor",
    summary: "自建 Harbor 的 project、Robot Account、自签名证书和权限说明。",
    category: "Harbor / 自建仓库",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 6,
    tags: ["推荐", "常见"],
    contentMarkdown: `# 如何配置自建 Harbor

Harbor 适合企业内部私有仓库场景。ImgPull 只需要能访问 Harbor 的 Registry V2 接口。

## 必要条件

1. Harbor project 已提前创建。
2. Robot Account 具有 push 权限。
3. Worker 节点能访问 Harbor 地址。
4. 如果 Harbor 使用自签名证书，需要管理员在 Worker 节点配置可信 CA。

## 不支持的自动行为

P0 不自动创建 Harbor project，也不自动配置自签名证书。`
  },
  {
    id: "help-005",
    slug: "namespace-missing",
    title: "目标 namespace 不存在怎么办",
    summary: "解释 TARGET_NAMESPACE_MISSING 的原因和处理方式。",
    category: "错误排查",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 3,
    tags: ["常见"],
    contentMarkdown: `# 目标 namespace 不存在怎么办

当目标仓库返回 namespace、project 或 repository path 不存在时，任务会失败并返回对应冻结积分。

## 处理方式

- 到云厂商或 Harbor 控制台创建 namespace / project。
- 检查目标镜像路径是否写错。
- 确认账号对该路径有 push 权限。

P0 阶段不自动创建仓库或项目。`
  },
  {
    id: "help-006",
    slug: "target-push-denied",
    title: "目标仓库无 push 权限怎么办",
    summary: "解释 TARGET_PUSH_DENIED 的排查路径和权限建议。",
    category: "错误排查",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 3,
    tags: ["常见"],
    contentMarkdown: `# 目标仓库无 push 权限怎么办

\`TARGET_PUSH_DENIED\` 表示目标仓库认证可能成功，但账号不允许推送镜像。

## 建议

- 使用专用 Robot Account。
- 只授予目标 namespace / project 的 push 权限。
- 不要使用生产管理员账号。
- 不要使用只有 pull 权限的账号。`
  },
  {
    id: "help-007",
    slug: "points-refund",
    title: "任务失败后积分如何返还",
    summary: "说明冻结积分、成功结算和失败返还的用户可见规则。",
    category: "计费与积分",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 4,
    tags: ["推荐"],
    contentMarkdown: `# 任务失败后积分如何返还

创建镜像任务时，系统会先冻结预计积分。任务结束后按结果处理。

## 成功任务

- 按实际消耗积分结算。
- 如果实际消耗低于冻结积分，差额退回余额。

## 失败任务

- P0 阶段失败任务全额返还该任务冻结积分。
- 失败原因和错误码会展示在任务详情。
- 批量导入中的每条镜像任务独立返还，不影响其他任务继续执行。`
  },
  {
    id: "help-008",
    slug: "docker-pull-command",
    title: "Docker pull 命令怎么使用",
    summary: "说明同步成功后如何复制 tag pull 或 digest pull 命令。",
    category: "Docker / containerd",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 3,
    tags: ["常见"],
    contentMarkdown: `# Docker pull 命令怎么使用

任务成功后，详情页会展示两种命令。

## tag pull

\`\`\`bash
docker pull registry.example.com/ops/nginx:latest
\`\`\`

## digest pull

\`\`\`bash
docker pull registry.example.com/ops/nginx@sha256:xxxx
\`\`\`

tag 适合日常使用，digest 适合固定版本和审计。`
  },
  {
    id: "help-009",
    slug: "digest-vs-tag",
    title: "digest pull 和 tag pull 有什么区别",
    summary: "解释 tag 可变、digest 稳定的差异和推荐使用场景。",
    category: "镜像任务",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 4,
    tags: ["推荐"],
    contentMarkdown: `# digest pull 和 tag pull 有什么区别

tag 是人类可读的版本标识，但同一个 tag 可能被覆盖。digest 是 manifest 的内容地址，更适合固定版本。

## 建议

- 测试环境可以使用 tag pull。
- 生产环境建议记录 digest pull。
- 如果需要审计某次同步结果，优先查看 source digest 和 target digest。`
  },
  {
    id: "help-010",
    slug: "nas-1panel-synology",
    title: "在 1Panel / 群晖环境中如何使用同步后的镜像",
    summary: "说明在 NAS、群晖和 1Panel 中使用私有仓库镜像的基本注意事项。",
    category: "NAS / 群晖 / 1Panel",
    status: "published",
    updatedAt: "2026-05-04",
    readingMinutes: 5,
    tags: ["新增"],
    contentMarkdown: `# 在 1Panel / 群晖环境中如何使用同步后的镜像

同步完成后，镜像已经推送到你自己的私有仓库。使用方式取决于本地运行环境。

## 1Panel

- 在容器配置中填写同步后的目标镜像地址。
- 如果仓库需要认证，请在主机上先完成 registry 登录。

## 群晖 / NAS

- 确认 NAS 能访问目标私有仓库。
- 如需认证，按系统提供的容器注册表配置入口填写账号。

## 注意

ImgPull 不接管用户业务集群，只负责把镜像同步到用户指定仓库。`
  }
];

export const systemHealth = [
  { name: "Web 前端", status: "正常", value: "页面与路由保护可用" },
  { name: "API 服务", status: "待接入", value: "当前为前端演示环境，真实环境需接入后端 API" },
  { name: "数据库", status: "待接入", value: "前端页面读取本地示例数据" },
  { name: "Worker 调度", status: "待接入", value: "真实镜像复制将在 Worker 设计阶段接入" },
  { name: "支付回调", status: "待接入", value: "支付宝 / 微信支付保持预留状态" }
];

export const dashboardStats = [
  { label: "可用积分", value: "576", hint: "包含人工充值与活动赠送" },
  { label: "冻结积分", value: "8", hint: "执行中任务已冻结" },
  { label: "今日任务", value: "4", hint: "成功 1 / 执行中 1 / 失败 1 / 排队 1" },
  { label: "可用仓库", value: "1", hint: "其余仓库需修复连接状态" }
];
