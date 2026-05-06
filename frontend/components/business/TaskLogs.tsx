import { Badge } from "@/components/ui/Badge";
import type { ImageTask } from "@/types/task";

const statusLabel = {
  success: "成功",
  failed: "失败",
  running: "执行中"
};

const statusTone = {
  success: "green",
  failed: "red",
  running: "cyan"
} as const;

export function TaskLogs({ task }: { task: ImageTask }) {
  return (
    <div className="space-y-4">
      {task.attempts.map((attempt) => (
        <div className="overflow-hidden rounded-[10px] border border-borderSoft bg-white text-ink shadow-soft" key={attempt.attemptNo}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borderSoft bg-slate-50 px-4 py-3">
            <div className="font-black">Attempt #{attempt.attemptNo}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{attempt.worker}</span>
              <Badge tone={statusTone[attempt.status]}>{statusLabel[attempt.status]}</Badge>
              <span>{attempt.startedAt}{attempt.endedAt ? ` - ${attempt.endedAt}` : ""}</span>
            </div>
          </div>
          <ol className="space-y-2 p-4 text-sm leading-6 text-slate-700">
            {attempt.logs.map((line, index) => (
              <li className="flex gap-2" key={`${attempt.attemptNo}-${index}`}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
