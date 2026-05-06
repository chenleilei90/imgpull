import { Badge } from "@/components/ui/Badge";
import { billingStatusMeta, taskStatusMeta, workerTaskStatusMeta } from "@/lib/status";
import type { ImageTask } from "@/types/task";

export function TaskStatusBadges({ task, showLabels = false }: { task: ImageTask; showLabels?: boolean }) {
  if (!showLabels) {
    return (
      <div className="flex flex-wrap gap-2">
        <Badge tone={taskStatusMeta[task.taskStatus].tone}>{taskStatusMeta[task.taskStatus].label}</Badge>
        <Badge tone={billingStatusMeta[task.billingStatus].tone}>{billingStatusMeta[task.billingStatus].label}</Badge>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Badge tone={taskStatusMeta[task.taskStatus].tone}>task_status: {task.taskStatus} / {taskStatusMeta[task.taskStatus].label}</Badge>
      <Badge tone={billingStatusMeta[task.billingStatus].tone}>billing_status: {task.billingStatus} / {billingStatusMeta[task.billingStatus].label}</Badge>
      <Badge tone={workerTaskStatusMeta[task.workerStatus].tone}>worker_status: {task.workerStatus} / {workerTaskStatusMeta[task.workerStatus].label}</Badge>
      <Badge tone="blue">current_stage: {task.currentStage}</Badge>
    </div>
  );
}
