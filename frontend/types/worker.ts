export type WorkerNodeStatus =
  | "pending"
  | "online"
  | "offline"
  | "maintenance"
  | "draining"
  | "disabled"
  | "retired"
  | "deleted";

export interface WorkerNode {
  id: string;
  name: string;
  status: WorkerNodeStatus;
  executor: "skopeo" | "crane" | "docker" | "nerdctl";
  activeTasks: number;
  maxConcurrency?: number;
  weight?: number;
  labels?: string[];
  version?: string;
  lastHeartbeat?: string;
  failureRate?: string;
  runningTasks?: Array<{
    id: string;
    title: string;
    stage: string;
  }>;
  recentEvents?: string[];
  recentError?: string;
  cpu: number;
  disk: number;
  successRate: string;
  region: string;
  updatedAt: string;
  note: string;
}
