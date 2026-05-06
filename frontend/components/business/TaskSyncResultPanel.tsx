import { Badge } from "@/components/ui/Badge";
import { CopyButton, CopyIconButton, CopyOnDoubleClick } from "@/components/ui/CopyOnDoubleClick";
import { billingStatusMeta, displayTaskResult } from "@/lib/status";
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

function resultIcon(task: ImageTask) {
  if (task.taskStatus === "failed") return "!";
  if (task.taskStatus === "running") return ">";
  if (task.taskStatus === "queued") return "...";
  return "✓";
}

function taskIconClass(task: ImageTask) {
  if (task.taskStatus === "failed") return "border-red-200 bg-red-50 text-red-700";
  if (task.taskStatus === "running") return "border-cyan-200 bg-cyan-50 text-cyan-700";
  if (task.taskStatus === "queued") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function pointIcon(label: string) {
  if (label === "预估") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 6.5h10M5 10h10M5 13.5h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (label === "冻结") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M6 8V6.7a4 4 0 0 1 8 0V8M5.5 8h9v7.5h-9V8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }
  if (label === "消费") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 12.5h3l1.5-4 3 7 1.5-3h3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M15.5 8.2A5.8 5.8 0 0 0 5.2 6.1L4 7.5M4 7.5V4.2M4 7.5h3.3M4.5 11.8a5.8 5.8 0 0 0 10.3 2.1l1.2-1.4M16 12.5v3.3M16 12.5h-3.3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export function TaskSyncResultPanel({ task, audience = "user" }: { task: ImageTask; audience?: "user" | "admin" }) {
  const result = displayTaskResult(task.taskStatus, task.billingStatus);
  const tone = resultTone(task);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={tone} className="h-10 rounded-[8px] px-5 text-sm shadow-sm">
            <span className={`mr-2 grid h-5 w-5 place-items-center rounded-full border text-xs ${taskIconClass(task)}`}>
              {resultIcon(task)}
            </span>
            {result}
          </Badge>
          <Badge tone="green" className="h-10 rounded-[8px] px-5 text-sm shadow-sm">
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 3.5 15 5.2v4.4c0 3-1.8 5.2-5 6.9-3.2-1.7-5-3.9-5-6.9V5.2l5-1.7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
              <path d="M7.8 10.1 9.3 11.6l3.1-3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
            </svg>
            Digest 已校验
          </Badge>
          <Badge tone={billingStatusMeta[task.billingStatus].tone} className="h-10 rounded-[8px] px-5 text-sm shadow-sm">
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 4.5h10v11H5v-11Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
              <path d="M7.5 7.5h5M7.5 10h5M7.5 12.5h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
            </svg>
            {billingStatusMeta[task.billingStatus].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-muted">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Worker:</span>
          <span className="font-mono font-black text-primary">{task.workerName}</span>
        </div>
      </div>

      {task.batchNo ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-cyan-100 bg-cyan-50/80 px-3 py-2 text-sm font-bold text-cyan-800">
          <span>批次</span>
          <span className="font-mono text-cyan-900">{task.batchNo}</span>
          <span className="text-cyan-700">第 {task.batchIndex} / {task.batchTotal} 条</span>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-3">
          <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="flex min-h-[150px] items-center gap-4 rounded-[10px] border border-blue-100 bg-white px-5 py-4 shadow-soft">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-2xl font-black ${taskIconClass(task)}`}>
                {resultIcon(task)}
              </div>
              <div className="min-w-0">
                <div className="text-[30px] font-black leading-tight text-ink">{result}</div>
                <p className="mt-3 text-sm font-bold leading-6 text-green-700">
                  {task.taskStatus === "failed" ? "镜像同步失败，相关冻结积分按规则返还。" : "镜像同步完成，目标镜像可正常使用。"}
                </p>
              </div>
            </div>

            <div className="grid min-w-0 items-center rounded-[10px] border border-blue-100 bg-white px-5 py-4 shadow-soft">
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-xs font-black text-muted">源镜像</div>
                  <div className="flex min-w-0 items-center rounded-[8px] border border-blue-100 bg-blue-50/25 px-3 py-2">
                    <CopyOnDoubleClick value={task.sourceImage} className="font-mono text-sm font-black text-blue-900" />
                  </div>
                </div>
                <div className="flex justify-center text-2xl font-black leading-none text-ink">↓</div>
                <div>
                  <div className="mb-1 text-xs font-black text-muted">目标镜像</div>
                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-[8px] border border-blue-100 bg-blue-50/25 px-3 py-2">
                    <CopyOnDoubleClick value={task.targetImage} className="font-mono text-sm font-black text-blue-900" />
                    <CopyIconButton value={task.targetImage} label="复制目标镜像" />
                  </div>
                </div>
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-[8px] bg-primary text-base font-black text-white">›</span>
                  <span>{audience === "admin" ? "处理建议：" : "下一步："}</span>
                  <span className="ml-1">{nextStepText(task)}</span>
              </div>
              <CopyButton value={task.tagPullCommand}>复制 docker pull 命令</CopyButton>
            </div>
          </div>
        </div>

        <aside className="overflow-hidden rounded-[10px] border border-blue-100 bg-white shadow-soft">
          <div className="grid grid-cols-2">
          {pointItems.map((item) => (
            <div className="min-h-[112px] min-w-0 border-b border-r border-blue-100 p-5 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0" key={item.key}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 ${item.color}`}>{pointIcon(item.label)}</span>
                <span className="truncate text-sm font-black text-muted">{item.label}积分</span>
              </div>
              <div className={`mt-4 max-w-full overflow-hidden text-[28px] font-black leading-none ${item.color}`}>{task[item.key]}</div>
              <div className="mt-3 truncate text-xs font-bold text-slate-500">{item.hint}</div>
            </div>
          ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
