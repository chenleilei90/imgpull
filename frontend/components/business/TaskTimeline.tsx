import { Badge } from "@/components/ui/Badge";
import type { ImageTask, TaskStageStatus } from "@/types/task";

const toneByStage: Record<TaskStageStatus, "slate" | "cyan" | "green" | "red"> = {
  pending: "slate",
  running: "cyan",
  success: "green",
  failed: "red"
};

const labelByStage: Record<TaskStageStatus, string> = {
  pending: "等待",
  running: "进行中",
  success: "成功",
  failed: "失败"
};

export function TaskTimeline({ task }: { task: ImageTask }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {task.stages.map((stage, index) => (
        <div className="flex gap-3 rounded-[10px] border border-borderSoft bg-white p-3 shadow-sm" key={stage.name}>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-primary">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-extrabold text-ink">{stage.name}</div>
              <Badge tone={toneByStage[stage.status]}>{labelByStage[stage.status]}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted">{stage.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
