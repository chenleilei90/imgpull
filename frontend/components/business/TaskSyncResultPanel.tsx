import { Badge } from "@/components/ui/Badge";
import { CopyOnDoubleClick } from "@/components/ui/CopyOnDoubleClick";
import { billingStatusMeta, displayTaskResult, taskStatusMeta } from "@/lib/status";
import type { ImageTask } from "@/types/task";

function resultTone(task: ImageTask) {
  if (task.taskStatus === "failed") return "red" as const;
  if (task.taskStatus === "running") return "cyan" as const;
  if (task.taskStatus === "queued") return "amber" as const;
  return "green" as const;
}

function nextStepText(task: ImageTask) {
  if (task.taskStatus === "failed") {
    return "检查目标仓库凭据、项目 / namespace 和 push 权限；该任务冻结积分会按结算状态返还。";
  }
  if (task.taskStatus === "running") {
    return "任务正在执行，完成后会生成 tag pull 和 digest pull 命令，并完成积分结算。";
  }
  if (task.taskStatus === "queued") {
    return "任务已进入队列，系统会根据 Worker 状态、并发和权重自动分配执行。";
  }
  return "复制下方 docker pull 命令，在你的运行环境中拉取目标仓库镜像。";
}

const pointItems = [
  { key: "estimatedPoints", label: "预估", hint: "提交前预估", color: "text-slate-900", dot: "bg-slate-500" },
  { key: "frozenPoints", label: "冻结", hint: "排队 / 执行占用", color: "text-amber-700", dot: "bg-amber-500" },
  { key: "settledPoints", label: "消费", hint: "成功后扣除", color: "text-primary", dot: "bg-blue-500" },
  { key: "refundedPoints", label: "返还", hint: "失败或差额退回", color: "text-green-700", dot: "bg-green-500" }
] as const;

function imageName(image: string) {
  const part = image.split("/").pop() ?? image;
  return part.length > 36 ? `${part.slice(0, 33)}...` : part;
}

export function TaskSyncResultPanel({ task, audience = "user" }: { task: ImageTask; audience?: "user" | "admin" }) {
  const result = displayTaskResult(task.taskStatus, task.billingStatus);
  const tone = resultTone(task);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="min-w-0 rounded-[12px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/45 to-cyan-50/70 p-4 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={tone}>{result}</Badge>
              <Badge tone={billingStatusMeta[task.billingStatus].tone}>{billingStatusMeta[task.billingStatus].label}</Badge>
              <Badge tone="blue">阶段：{task.currentStage}</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-muted">任务编号</div>
                <div className="mt-1 font-mono text-[28px] font-black leading-none tracking-tight text-ink">{task.taskNo}</div>
              </div>
              <div className="min-w-0 pb-0.5 text-sm font-bold leading-6 text-muted sm:max-w-[420px]">{task.title}</div>
            </div>
          </div>
          <div className="shrink-0 rounded-[10px] border border-blue-100 bg-white/90 px-4 py-3 text-sm shadow-soft">
            <div className="text-xs font-black text-muted">Worker</div>
            <div className="mt-1 max-w-[200px] truncate font-mono font-black text-slate-800" title={task.workerName}>
              {task.workerName}
            </div>
          </div>
        </div>

        {task.batchNo ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[10px] border border-cyan-100 bg-white/80 px-3 py-2 text-sm font-bold text-cyan-800">
            <span>批次</span>
            <span className="font-mono text-cyan-900">{task.batchNo}</span>
            <span className="text-cyan-700">第 {task.batchIndex} / {task.batchTotal} 条</span>
          </div>
        ) : null}

        <div className="mt-4 rounded-[12px] border border-borderSoft bg-white p-3 shadow-soft">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] lg:items-center">
            <div className="min-w-0 rounded-[10px] bg-slate-50 px-3 py-3">
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-muted">源镜像</div>
              <div className="font-black text-ink">{imageName(task.sourceImage)}</div>
              <CopyOnDoubleClick value={task.sourceImage} className="mt-1 font-mono text-xs font-bold text-slate-500" />
            </div>
            <div className="hidden items-center justify-center lg:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-lg font-black text-primary shadow-soft">→</div>
            </div>
            <div className="min-w-0 rounded-[10px] bg-slate-50 px-3 py-3">
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-muted">目标镜像</div>
              <div className="font-black text-ink">{imageName(task.targetImage)}</div>
              <CopyOnDoubleClick value={task.targetImage} className="mt-1 font-mono text-xs font-bold text-slate-500" />
            </div>
          </div>
        </div>

        <div className={`mt-4 rounded-[10px] border px-4 py-3 text-sm font-bold leading-7 ${
          task.taskStatus === "failed" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
        }`}>
          {task.errorCode ? (
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone="red">{task.errorCode}</Badge>
              <span>失败原因：{task.failureReason}</span>
            </div>
          ) : null}
          <span>{audience === "admin" ? "处理建议：" : "下一步："}</span>
          <span className="ml-1">{nextStepText(task)}</span>
        </div>
      </div>

      <aside className="rounded-[12px] border border-borderSoft bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-black text-ink">积分结算</div>
            <div className="mt-1 text-xs font-bold leading-5 text-muted">冻结、消费和返还拆开展示，避免挤出表格。</div>
          </div>
          <Badge tone={task.refundedPoints > 0 ? "green" : "blue"}>{task.refundedPoints > 0 ? "含返还" : "已记录"}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {pointItems.map((item) => (
            <div className="min-w-0 rounded-[10px] border border-borderSoft bg-slate-50/85 p-3" key={item.key}>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                <span className="truncate text-xs font-black text-muted">{item.label}积分</span>
              </div>
              <div className={`mt-2 truncate text-[28px] font-black leading-none ${item.color}`}>{task[item.key]}</div>
              <div className="mt-2 truncate text-[11px] font-bold text-slate-500">{item.hint}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
