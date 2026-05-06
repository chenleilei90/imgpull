import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { workerNodeStatusMeta } from "@/lib/status";
import type { WorkerNode, WorkerNodeStatus } from "@/types/worker";

export type WorkerAction = "online" | "maintenance" | "draining" | "disabled" | "retired" | "deleted" | "restore";

export const workerActionLabel: Record<WorkerAction, string> = {
  online: "恢复上线",
  maintenance: "进入维护",
  draining: "排空",
  disabled: "禁用",
  retired: "退役",
  deleted: "软删除",
  restore: "恢复"
};

export const workerActionDescription: Record<WorkerAction, string> = {
  online: "让节点重新参与调度，开始接收新的镜像同步任务。",
  maintenance: "暂停调度，用于升级、排查或调整节点环境。",
  draining: "停止接收新任务，等待当前运行任务完成后再处理节点。",
  disabled: "立即停止参与调度，适合风险控制或故障隔离。",
  retired: "节点不再使用，但保留历史任务、心跳和审计记录。",
  deleted: "软删除节点，从默认列表隐藏，不参与任何调度。",
  restore: "恢复软删除节点，恢复后保持禁用状态，需要管理员再启用。"
};

const statusActions: Partial<Record<WorkerNodeStatus, WorkerAction[]>> = {
  pending: ["disabled"],
  online: ["maintenance", "draining", "disabled"],
  maintenance: ["online", "disabled"],
  draining: ["online", "retired"],
  offline: ["disabled", "retired"],
  disabled: ["online", "retired"],
  retired: ["deleted"],
  deleted: ["restore"]
};

export function getWorkerActions(status: WorkerNodeStatus) {
  return statusActions[status] ?? [];
}

export function nextStatusFromAction(action: WorkerAction): WorkerNodeStatus {
  if (action === "restore") return "disabled";
  return action;
}

function loadPercent(worker: WorkerNode) {
  const max = worker.maxConcurrency ?? 0;
  if (max <= 0) return 0;
  return Math.min(100, Math.round((worker.activeTasks / max) * 100));
}

export function WorkerNodeTable({
  workers,
  onCreate,
  onDetail,
  onEdit,
  onMore
}: {
  workers: WorkerNode[];
  onCreate?: () => void;
  onDetail?: (worker: WorkerNode) => void;
  onEdit?: (worker: WorkerNode) => void;
  onMore?: (worker: WorkerNode) => void;
}) {
  if (workers.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
        <div className="text-lg font-black text-ink">未找到符合条件的 Worker 节点。</div>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">请调整筛选条件，或新增节点并复制注册命令完成接入。Worker 节点只由管理员统一管理。</p>
        {onCreate ? (
          <div className="mt-5">
            <Button variant="primary" onClick={onCreate}>新增 Worker 节点</Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Table
      data={workers}
      rowKey={(row) => row.id}
      minWidth="min-w-[1320px]"
      columns={[
        {
          key: "name",
          header: "节点",
          className: "w-[220px]",
          render: (row) => (
            <div className={row.status === "deleted" ? "text-slate-400" : ""}>
              <div className="max-w-[180px] truncate font-black" title={row.name}>{row.name}</div>
              <div className="mt-1 font-mono text-xs text-muted">{row.id}</div>
              {row.status === "deleted" ? <div className="mt-1 text-xs font-bold text-muted">已软删除，不参与调度</div> : null}
            </div>
          )
        },
        {
          key: "region",
          header: "区域 / 标签",
          className: "w-[210px]",
          render: (row) => (
            <div>
              <div className="font-bold text-slate-700">{row.region}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(row.labels ?? []).map((label) => (
                  <span className="rounded-[7px] bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )
        },
        { key: "executor", header: "执行器", className: "w-[92px]", render: (row) => <span className="font-bold">{row.executor}</span> },
        { key: "status", header: "状态", className: "w-[118px]", render: (row) => <Badge tone={workerNodeStatusMeta[row.status].tone}>{workerNodeStatusMeta[row.status].label}</Badge> },
        {
          key: "capacity",
          header: "当前负载",
          className: "w-[165px]",
          render: (row) => {
            const percent = loadPercent(row);
            return (
              <div className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black">{row.activeTasks} / {row.maxConcurrency ?? 0}</span>
                  <span className="text-xs font-bold text-muted">权重 {row.weight ?? 0}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          }
        },
        {
          key: "tasks",
          header: "当前任务",
          className: "w-[260px]",
          render: (row) => {
            const tasks = row.runningTasks ?? [];
            if (tasks.length === 0) {
              return <span className="text-sm font-bold text-muted">暂无运行任务</span>;
            }

            return (
              <div className="space-y-2">
                {tasks.slice(0, 2).map((task) => (
                  <div className="rounded-[8px] border border-blue-100 bg-blue-50/70 px-2 py-1.5" key={task.id}>
                    <div className="font-mono text-xs font-black text-blue-700">{task.id}</div>
                    <div className="mt-1 truncate text-xs font-bold text-slate-600" title={`${task.title} - ${task.stage}`}>{task.title}</div>
                  </div>
                ))}
                {tasks.length > 2 ? <div className="text-xs font-bold text-muted">另有 {tasks.length - 2} 个任务</div> : null}
              </div>
            );
          }
        },
        {
          key: "heartbeat",
          header: "心跳 / 版本",
          className: "w-[145px]",
          render: (row) => (
            <div className="text-sm">
              <div className="font-bold">{row.lastHeartbeat ?? row.updatedAt}</div>
              <div className="mt-1 text-xs text-muted">{row.version ?? "-"}</div>
            </div>
          )
        },
        {
          key: "quality",
          header: "健康",
          className: "w-[210px]",
          render: (row) => (
            <div className="text-sm">
              <div className="font-black">失败率 {row.failureRate ?? "-"}</div>
              <div className="mt-1 text-xs text-muted">成功率 {row.successRate}</div>
              <div className="mt-1 truncate text-xs font-bold text-slate-500" title={row.recentError ?? row.note}>{row.recentError ?? row.note}</div>
            </div>
          )
        },
        {
          key: "actions",
          header: "操作",
          className: "w-[170px]",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => onDetail?.(row)}>详情</Button>
              <Button size="sm" variant="secondary" onClick={() => onEdit?.(row)}>编辑</Button>
              <Button size="sm" variant="ghost" onClick={() => onMore?.(row)}>更多</Button>
            </div>
          )
        }
      ]}
    />
  );
}
