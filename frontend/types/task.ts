export type TaskStatus =
  | "draft"
  | "validating"
  | "queued"
  | "assigned"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export type BillingStatus =
  | "not_frozen"
  | "frozen"
  | "settled"
  | "refunding"
  | "refunded"
  | "settlement_failed";

export type WorkerTaskStatus =
  | "unclaimed"
  | "claimed"
  | "running"
  | "heartbeat_lost"
  | "completed";

export type TaskStageStatus = "pending" | "running" | "success" | "failed";

export interface TaskStage {
  name: string;
  status: TaskStageStatus;
  time: string;
}

export interface TaskAttempt {
  attemptNo: number;
  worker: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  endedAt?: string;
  logs: string[];
}

export interface ImageTask {
  id: string;
  taskNo: string;
  taskNoNormalized: string;
  title: string;
  sourceImage: string;
  targetImage: string;
  sourceType?: "single" | "batch";
  batchId?: string;
  batchNo?: string;
  batchIndex?: number;
  batchTotal?: number;
  registryName: string;
  workerName: string;
  taskStatus: TaskStatus;
  billingStatus: BillingStatus;
  workerStatus: WorkerTaskStatus;
  currentStage: string;
  progress: number;
  estimatedPoints: number;
  frozenPoints: number;
  settledPoints: number;
  refundedPoints: number;
  sourceDigest: string;
  sourceManifestDigest: string;
  targetDigest: string;
  targetManifestDigest: string;
  tagPullCommand: string;
  digestPullCommand: string;
  errorCode?: string;
  failureReason?: string;
  stages: TaskStage[];
  attempts: TaskAttempt[];
  createdAt: string;
}

export interface ImageTaskBatch {
  id: string;
  batchNo: string;
  sourceType: "manual_text";
  totalCount: number;
  validCount: number;
  invalidCount: number;
  estimatedFrozenPoints: number;
  status: "submitted" | "queued" | "partial_failed" | "completed";
  createdAt: string;
}
