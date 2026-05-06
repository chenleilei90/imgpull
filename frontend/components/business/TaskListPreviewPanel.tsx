import { Badge } from "@/components/ui/Badge";
import { CopyOnDoubleClick } from "@/components/ui/CopyOnDoubleClick";
import { billingStatusMeta, displayTaskResult } from "@/lib/status";
import type { ImageTask } from "@/types/task";

function resultTone(task: ImageTask) {
  if (task.taskStatus === "failed") return "red" as const;
  if (task.taskStatus === "running") return "cyan" as const;
  if (task.taskStatus === "queued") return "amber" as const;
  return "green" as const;
}

export function TaskListPreviewPanel({ tasks }: { tasks: ImageTask[] }) {
  return (
    <section className="rounded-[12px] border border-borderSoft bg-white p-5 shadow-soft">
      <h2 className="text-lg font-black text-ink">任务列表（预览）</h2>
      <div className="mt-4 overflow-hidden rounded-[10px] border border-blue-100">
        <div className="grid min-w-[1060px] grid-cols-[150px_110px_150px_220px_260px_110px_170px] border-b border-blue-100 bg-slate-50/80 px-4 py-3 text-xs font-black text-slate-500">
          <div>任务编号</div>
          <div>来源</div>
          <div>状态 / 结果</div>
          <div>源镜像</div>
          <div>目标镜像</div>
          <div>积分</div>
          <div>创建时间</div>
        </div>
        {tasks.map((task) => (
          <div
            className="grid min-w-[1060px] grid-cols-[150px_110px_150px_220px_260px_110px_170px] items-center border-b border-blue-100 px-4 py-4 text-sm last:border-b-0 hover:bg-blue-50/35"
            key={task.id}
          >
            <div className="font-mono font-black text-primary">{task.taskNo}</div>
            <div>
              <Badge tone="slate">{task.sourceType === "batch" ? "批量导入" : "单个任务"}</Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={resultTone(task)}>{displayTaskResult(task.taskStatus, task.billingStatus)}</Badge>
                <Badge tone={billingStatusMeta[task.billingStatus].tone}>{billingStatusMeta[task.billingStatus].label}</Badge>
              </div>
              <div className="text-xs font-bold text-muted">{task.currentStage}</div>
            </div>
            <CopyOnDoubleClick value={task.sourceImage} className="font-mono text-sm text-slate-700" />
            <CopyOnDoubleClick value={task.targetImage} className="font-mono text-sm text-slate-700" />
            <div className="flex flex-col items-start gap-1.5">
              <Badge tone="blue">预估 {task.estimatedPoints}</Badge>
              {task.refundedPoints > 0 ? <Badge tone="green">返还 {task.refundedPoints}</Badge> : null}
              {task.frozenPoints > 0 ? <Badge tone="amber">冻结 {task.frozenPoints}</Badge> : null}
            </div>
            <div className="font-bold text-slate-600">{task.createdAt}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-sm">
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-blue-100 text-muted" type="button">‹</button>
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-primary bg-white text-primary" type="button">1</button>
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-blue-100 text-muted" type="button">2</button>
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-blue-100 text-muted" type="button">3</button>
        <span className="px-2 font-bold text-muted">...</span>
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-blue-100 text-muted" type="button">10</button>
        <button className="grid h-9 w-9 place-items-center rounded-[8px] border border-blue-100 text-muted" type="button">›</button>
        <button className="h-9 rounded-[8px] border border-blue-100 px-3 font-bold text-muted" type="button">10 条/页⌄</button>
      </div>
    </section>
  );
}
