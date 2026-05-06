export type PointTransactionType =
  | "register_bonus"
  | "task_freeze"
  | "task_settle"
  | "task_refund"
  | "manual_recharge"
  | "activity_bonus";

export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  title: string;
  refType: string;
  refId: string;
  balanceDelta: number;
  frozenDelta: number;
  balanceAfter: number;
  frozenAfter: number;
  remark: string;
  createdAt: string;
}

export interface RechargePackage {
  id: string;
  name: string;
  amountCents: number;
  points: number;
  description: string;
  enabled: boolean;
}
