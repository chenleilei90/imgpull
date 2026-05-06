import type { BillingStatus, TaskStatus, WorkerTaskStatus } from "@/types/task";
import type { RegistryConnectionStatus } from "@/types/registry";
import type { WorkerNodeStatus } from "@/types/worker";
import type { OrderStatus, PayChannel } from "@/types/order";

export type BadgeTone = "blue" | "cyan" | "green" | "amber" | "red" | "slate" | "violet";

export interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

export const taskStatusMeta: Record<TaskStatus, StatusMeta> = {
  draft: { label: "草稿", tone: "slate" },
  validating: { label: "校验中", tone: "cyan" },
  queued: { label: "排队中", tone: "amber" },
  assigned: { label: "已分配", tone: "blue" },
  running: { label: "执行中", tone: "cyan" },
  succeeded: { label: "已成功", tone: "green" },
  failed: { label: "已失败", tone: "red" },
  canceled: { label: "已取消", tone: "slate" }
};

export const billingStatusMeta: Record<BillingStatus, StatusMeta> = {
  not_frozen: { label: "未冻结", tone: "slate" },
  frozen: { label: "已冻结", tone: "amber" },
  settled: { label: "已结算", tone: "green" },
  refunding: { label: "返还中", tone: "cyan" },
  refunded: { label: "已返还", tone: "green" },
  settlement_failed: { label: "结算异常", tone: "red" }
};

export const workerTaskStatusMeta: Record<WorkerTaskStatus, StatusMeta> = {
  unclaimed: { label: "未领取", tone: "slate" },
  claimed: { label: "已领取", tone: "blue" },
  running: { label: "运行中", tone: "cyan" },
  heartbeat_lost: { label: "心跳丢失", tone: "red" },
  completed: { label: "已完成", tone: "green" }
};

export const workerNodeStatusMeta: Record<WorkerNodeStatus, StatusMeta> = {
  pending: { label: "待注册", tone: "blue" },
  online: { label: "在线", tone: "green" },
  offline: { label: "离线", tone: "red" },
  maintenance: { label: "维护中", tone: "amber" },
  draining: { label: "排空中", tone: "cyan" },
  disabled: { label: "禁用", tone: "slate" },
  retired: { label: "退役", tone: "violet" },
  deleted: { label: "软删除", tone: "slate" }
};

export const registryConnectionMeta: Record<RegistryConnectionStatus, StatusMeta> = {
  success: { label: "测试成功", tone: "green" },
  auth_failed: { label: "认证失败", tone: "red" },
  push_denied: { label: "无 push 权限", tone: "red" },
  namespace_missing: { label: "项目不存在", tone: "amber" },
  tls_ca_required: { label: "需配置 CA", tone: "cyan" }
};

export const orderStatusMeta: Record<OrderStatus, StatusMeta> = {
  pending: { label: "待确认", tone: "amber" },
  paid: { label: "已到账", tone: "green" },
  closed: { label: "已关闭", tone: "slate" },
  reserved: { label: "预留未开通", tone: "cyan" }
};

export const payChannelMeta: Record<PayChannel, StatusMeta> = {
  manual: { label: "人工充值：可用", tone: "green" },
  alipay: { label: "支付宝：暂未开通", tone: "slate" },
  wechat: { label: "微信支付：暂未开通", tone: "slate" }
};

export function displayTaskResult(status: TaskStatus, billingStatus: BillingStatus) {
  if (status === "failed" && billingStatus === "refunded") return "失败，积分已返还";
  return taskStatusMeta[status].label;
}
