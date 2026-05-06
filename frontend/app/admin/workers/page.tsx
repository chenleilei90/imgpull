"use client";

import { useMemo, useState } from "react";
import {
  WorkerNodeTable,
  getWorkerActions,
  nextStatusFromAction,
  workerActionDescription,
  workerActionLabel,
  type WorkerAction
} from "@/components/business/WorkerNodeTable";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { workerNodes as initialWorkerNodes } from "@/lib/mock-data";
import { workerNodeStatusMeta, type BadgeTone } from "@/lib/status";
import type { WorkerNode, WorkerNodeStatus } from "@/types/worker";

type WorkerForm = {
  name: string;
  region: string;
  labels: string;
  executor: WorkerNode["executor"];
  maxConcurrency: string;
  weight: string;
  note: string;
};

type QuickFilter = "all" | "online" | "draining" | "maintenance" | "unavailable" | "capacity" | "running";
type StatusFilter = "all" | WorkerNodeStatus;
type ExecutorFilter = "all" | WorkerNode["executor"];
type ConnectionStatus = "idle" | "waiting" | "success" | "invalid";

const defaultForm: WorkerForm = {
  name: "worker-cn-hangzhou-01",
  region: "华东 1",
  labels: "aliyun-acr, high-bandwidth",
  executor: "skopeo",
  maxConcurrency: "6",
  weight: "80",
  note: "POC 接入节点，仅用于前端演示"
};

const quickFilterLabel: Record<QuickFilter, string> = {
  all: "全部节点",
  online: "在线节点",
  draining: "排空中",
  maintenance: "维护中",
  unavailable: "离线 / 禁用",
  capacity: "全部节点",
  running: "运行中节点"
};

function toWorkerForm(worker: WorkerNode): WorkerForm {
  return {
    name: worker.name,
    region: worker.region,
    labels: (worker.labels ?? []).join(", "),
    executor: worker.executor,
    maxConcurrency: String(worker.maxConcurrency ?? 4),
    weight: String(worker.weight ?? 50),
    note: worker.note
  };
}

function labelsFromInput(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function linuxWorkerCommand() {
  return `IMGPULL_API_ENDPOINT=https://api.example.com \\
IMGPULL_WORKER_TOKEN=worker_token_demo_**** \\
IMGPULL_EXECUTOR=skopeo \\
./imgpull-worker`;
}

function dockerWorkerCommand() {
  return `docker run -d --name imgpull-worker \\
  -e IMGPULL_API_ENDPOINT=https://api.example.com \\
  -e IMGPULL_WORKER_TOKEN=worker_token_demo_**** \\
  -e IMGPULL_EXECUTOR=skopeo \\
  registry.example.com/imgpull/worker:v0.1.0`;
}

function connectionLabel(status: ConnectionStatus) {
  if (status === "success") return "连接成功";
  if (status === "waiting") return "等待心跳";
  if (status === "invalid") return "Token 无效";
  return "等待测试";
}

function connectionTone(status: ConnectionStatus): BadgeTone {
  if (status === "success") return "green";
  if (status === "waiting") return "amber";
  if (status === "invalid") return "red";
  return "slate";
}

function workerMatchesSearch(worker: WorkerNode, keyword: string) {
  const text = [
    worker.name,
    worker.id,
    worker.region,
    worker.executor,
    worker.status,
    worker.version,
    ...(worker.labels ?? [])
  ].join(" ").toLowerCase();

  return text.includes(keyword.toLowerCase());
}

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<WorkerNode[]>(initialWorkerNodes);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [executorFilter, setExecutorFilter] = useState<ExecutorFilter>("all");
  const [runningOnly, setRunningOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<WorkerForm>(defaultForm);
  const [editing, setEditing] = useState<WorkerNode | null>(null);
  const [detailWorker, setDetailWorker] = useState<WorkerNode | null>(null);
  const [guideWorker, setGuideWorker] = useState<WorkerNode | null>(null);
  const [moreWorker, setMoreWorker] = useState<WorkerNode | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ worker: WorkerNode; action: WorkerAction } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [notice, setNotice] = useState("当前页面只是前端演示：新增节点、测试连接、模拟心跳都只更新浏览器中的示例状态，不会启动真实 Worker，也不会拉取或推送镜像。");

  const stats = useMemo(() => {
    const online = workers.filter((item) => item.status === "online").length;
    const draining = workers.filter((item) => item.status === "draining").length;
    const maintenance = workers.filter((item) => item.status === "maintenance").length;
    const unavailable = workers.filter((item) => ["offline", "disabled"].includes(item.status)).length;
    const concurrency = workers.filter((item) => item.status === "online").reduce((sum, item) => sum + (item.maxConcurrency ?? 0), 0);
    const active = workers.reduce((sum, item) => sum + item.activeTasks, 0);

    return [
      { key: "online" as QuickFilter, label: "在线节点", value: online, hint: "可领取新任务" },
      { key: "draining" as QuickFilter, label: "排空中", value: draining, hint: "只完成已领取任务" },
      { key: "maintenance" as QuickFilter, label: "维护中", value: maintenance, hint: "暂停领取新任务" },
      { key: "unavailable" as QuickFilter, label: "离线 / 禁用", value: unavailable, hint: "不参与调度" },
      { key: "capacity" as QuickFilter, label: "当前总并发", value: concurrency, hint: "点击查看全部节点" },
      { key: "running" as QuickFilter, label: "运行任务数", value: active, hint: "只看运行中节点" }
    ];
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (statusFilter === "all" && worker.status === "deleted") return false;
      if (quickFilter === "online" && worker.status !== "online") return false;
      if (quickFilter === "draining" && worker.status !== "draining") return false;
      if (quickFilter === "maintenance" && worker.status !== "maintenance") return false;
      if (quickFilter === "unavailable" && !["offline", "disabled"].includes(worker.status)) return false;
      if (quickFilter === "running" && worker.activeTasks <= 0) return false;
      if (statusFilter !== "all" && worker.status !== statusFilter) return false;
      if (executorFilter !== "all" && worker.executor !== executorFilter) return false;
      if (runningOnly && worker.activeTasks <= 0) return false;
      if (search.trim() && !workerMatchesSearch(worker, search.trim())) return false;
      return true;
    });
  }, [executorFilter, quickFilter, runningOnly, search, statusFilter, workers]);

  function updateForm<K extends keyof WorkerForm>(key: K, value: WorkerForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setSearch("");
    setQuickFilter("all");
    setStatusFilter("all");
    setExecutorFilter("all");
    setRunningOnly(false);
  }

  function openCreate() {
    setForm(defaultForm);
    setCreateOpen(true);
  }

  function createWorker() {
    const id = `worker-${Date.now().toString().slice(-6)}`;
    const worker: WorkerNode = {
      id,
      name: form.name || "worker-pending",
      status: "pending",
      executor: form.executor,
      activeTasks: 0,
      maxConcurrency: Number(form.maxConcurrency) || 1,
      weight: Number(form.weight) || 50,
      labels: labelsFromInput(form.labels),
      version: "等待注册",
      lastHeartbeat: "等待首次心跳",
      failureRate: "-",
      runningTasks: [],
      recentEvents: ["刚刚：创建节点记录", "等待复制注册命令", "等待 Worker 首次心跳"],
      recentError: "无",
      cpu: 0,
      disk: 0,
      successRate: "-",
      region: form.region || "本地实验室",
      updatedAt: "刚刚创建",
      note: form.note || "等待复制注册命令完成接入"
    };
    setWorkers((prev) => [worker, ...prev]);
    setCreateOpen(false);
    setForm(defaultForm);
    setGuideWorker(worker);
    setConnectionStatus("idle");
    setNotice("节点已创建，但这仍然只是前端 mock。当前没有真实 Worker 程序或 Worker 镜像，不会真的启动服务器进程，也不会执行 registry-to-registry copy。");
  }

  function saveEdit() {
    if (!editing) return;
    const updated = {
      ...editing,
      name: form.name,
      region: form.region,
      labels: labelsFromInput(form.labels),
      maxConcurrency: Number(form.maxConcurrency) || editing.maxConcurrency,
      weight: Number(form.weight) || editing.weight,
      note: form.note,
      updatedAt: "刚刚"
    };
    setWorkers((prev) => prev.map((worker) => worker.id === editing.id ? updated : worker));
    setEditing(null);
    setNotice("节点配置已保存到当前页面状态。真实环境需要由后端 API 持久化并写入操作日志。");
  }

  function applyLifecycleAction() {
    if (!confirmAction) return;
    const { worker, action } = confirmAction;
    const nextStatus = nextStatusFromAction(action);
    const activeTasks = ["deleted", "retired", "disabled"].includes(nextStatus) ? 0 : worker.activeTasks;
    const updated: WorkerNode = {
      ...worker,
      status: nextStatus,
      activeTasks,
      updatedAt: "刚刚",
      note: action === "restore" ? "已从软删除恢复为禁用状态，需确认后再启用" : `${workerActionLabel[action]}已模拟执行`,
      recentEvents: [`刚刚：管理员执行${workerActionLabel[action]}`, ...(worker.recentEvents ?? []).slice(0, 4)]
    };
    setWorkers((prev) => prev.map((item) => item.id === worker.id ? updated : item));
    setConfirmAction(null);
    setNotice(`${worker.name} 已模拟执行“${workerActionLabel[action]}”。真实环境会校验运行任务、写入审计日志并通知调度器。`);
  }

  function simulateHeartbeatSuccess(worker: WorkerNode) {
    const updated: WorkerNode = {
      ...worker,
      status: "online",
      version: "v0.1.0-poc",
      lastHeartbeat: "刚刚",
      successRate: "待统计",
      failureRate: "0%",
      updatedAt: "刚刚",
      note: "注册成功，等待真实任务",
      recentEvents: ["刚刚：Worker 首次心跳成功", ...(worker.recentEvents ?? []).slice(0, 4)]
    };
    setWorkers((prev) => prev.map((item) => item.id === worker.id ? updated : item));
    setGuideWorker(updated);
    setConnectionStatus("success");
    setNotice(`${worker.name} 已模拟心跳成功，节点进入在线状态。该状态只存在于前端页面，不代表真实服务器已接入。`);
  }

  function runConnectionTest() {
    setConnectionStatus((prev) => {
      if (prev === "idle") return "waiting";
      if (prev === "waiting") return "success";
      if (prev === "success") return "invalid";
      return "success";
    });
  }

  const hasActiveFilters = search.trim() || quickFilter !== "all" || statusFilter !== "all" || executorFilter !== "all" || runningOnly;

  return (
    <AdminLayout>
      <div className="section-title">
        <h1>Worker 节点管理</h1>
        <p>Worker 节点本质上是一台能执行镜像同步任务的服务器、虚拟机、容器实例或后续 Kubernetes Pod，由管理员统一部署和管理。普通用户不添加 Worker 节点。</p>
      </div>

      <div className="mb-4 rounded-panel border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-700">
        {notice}
      </div>

      <WorkerBoundaryPanel />

      <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((item) => {
          const active = quickFilter === item.key;
          return (
            <button
              className={`rounded-panel border bg-white p-4 text-left shadow-soft transition duration-150 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 ${active ? "border-blue-400 bg-blue-50 shadow-focus" : "border-borderSoft"}`}
              key={item.key}
              type="button"
              onClick={() => {
                setQuickFilter(item.key === "capacity" ? "capacity" : item.key);
                setStatusFilter("all");
              }}
            >
              <div className="text-xs font-black text-muted">{item.label}</div>
              <div className="mt-2 text-2xl font-black text-ink">{item.value}</div>
              <div className="mt-1 text-xs font-bold text-slate-500">{item.hint}</div>
            </button>
          );
        })}
      </div>

      <div className="data-toolbar mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-bold text-slate-600">
            当前筛选：<span className="text-primary">{quickFilterLabel[quickFilter]}</span>
            {statusFilter !== "all" ? <span> / {workerNodeStatusMeta[statusFilter].label}</span> : null}
            {executorFilter !== "all" ? <span> / {executorFilter}</span> : null}
            {runningOnly ? <span> / 只看运行中</span> : null}
          </div>
          {hasActiveFilters ? <Button size="sm" variant="ghost" onClick={clearFilters}>清除筛选</Button> : null}
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.8fr_auto_auto]">
          <input
            className="input"
            placeholder="搜索节点名称、节点 ID、区域或标签"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(value) => { setStatusFilter(value as StatusFilter); setQuickFilter("all"); }}
            options={[
              { value: "all", label: "全部状态" },
              { value: "pending", label: "等待注册" },
              { value: "online", label: "在线" },
              { value: "maintenance", label: "维护" },
              { value: "draining", label: "排空" },
              { value: "offline", label: "离线" },
              { value: "disabled", label: "禁用" },
              { value: "retired", label: "退役" },
              { value: "deleted", label: "已删除" }
            ]}
          />
          <Select
            value={executorFilter}
            onChange={(value) => setExecutorFilter(value as ExecutorFilter)}
            options={[
              { value: "all", label: "全部执行器" },
              { value: "skopeo", label: "skopeo" },
              { value: "crane", label: "crane" },
              { value: "docker", label: "docker" },
              { value: "nerdctl", label: "nerdctl" }
            ]}
          />
          <label className="flex h-10 items-center gap-2 rounded-control border border-borderSoft bg-white px-3 text-sm font-bold text-slate-600">
            <input checked={runningOnly} type="checkbox" onChange={(event) => setRunningOnly(event.target.checked)} />
            只看运行中
          </label>
          <Button variant="secondary" onClick={clearFilters}>重置</Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="节点列表"
          description="覆盖在线、维护、排空、离线、禁用、退役和软删除状态。所有操作仅更新前端页面状态，不会调用真实 Worker。"
          action={<Button variant="primary" onClick={openCreate}>新增 Worker 节点</Button>}
        />
        <WorkerNodeTable
          workers={filteredWorkers}
          onCreate={openCreate}
          onDetail={(worker) => setDetailWorker(worker)}
          onEdit={(worker) => {
            setEditing(worker);
            setForm(toWorkerForm(worker));
          }}
          onMore={(worker) => setMoreWorker(worker)}
        />
      </Card>

      {createOpen ? (
        <Modal
          title="新增 Worker 节点"
          placement="drawer"
          onClose={() => setCreateOpen(false)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>取消</Button>
              <Button variant="primary" onClick={createWorker}>创建并生成注册指引</Button>
            </>
          )}
        >
          <WorkerNodeForm form={form} onChange={updateForm} showExecutor />
        </Modal>
      ) : null}

      {editing ? (
        <Modal
          title={`编辑节点：${editing.name}`}
          placement="drawer"
          onClose={() => setEditing(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>取消</Button>
              <Button variant="primary" onClick={saveEdit}>保存配置</Button>
            </>
          )}
        >
          <WorkerNodeForm form={form} onChange={updateForm} />
          <div className="mt-5 rounded-[10px] border border-blue-100 bg-blue-50/70 p-4 text-sm font-bold leading-7 text-slate-700">
            编辑仅更新当前前端页面状态。真实环境保存时需要后端校验、持久化并写入管理员审计日志。
          </div>
        </Modal>
      ) : null}

      {detailWorker ? (
        <Modal title={`节点详情：${detailWorker.name}`} placement="drawer" onClose={() => setDetailWorker(null)} footer={<Button variant="secondary" onClick={() => setDetailWorker(null)}>关闭</Button>}>
          <WorkerDetail worker={detailWorker} />
        </Modal>
      ) : null}

      {guideWorker ? (
        <Modal
          title="节点注册指引"
          placement="drawer"
          onClose={() => setGuideWorker(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={runConnectionTest}>测试连接</Button>
              <Button variant="primary" onClick={() => simulateHeartbeatSuccess(guideWorker)}>模拟心跳成功</Button>
            </>
          )}
        >
          <RegistrationGuide worker={guideWorker} connectionStatus={connectionStatus} />
        </Modal>
      ) : null}

      {moreWorker ? (
        <Modal title={`更多操作：${moreWorker.name}`} onClose={() => setMoreWorker(null)} footer={<Button variant="ghost" onClick={() => setMoreWorker(null)}>关闭</Button>}>
          <div className="space-y-3">
            {moreWorker.status === "pending" ? (
              <Button variant="secondary" onClick={() => { setGuideWorker(moreWorker); setMoreWorker(null); }}>查看注册指引</Button>
            ) : null}
            {getWorkerActions(moreWorker.status).map((action) => (
              <div className="rounded-[10px] border border-borderSoft bg-white p-4" key={action}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-black text-ink">{workerActionLabel[action]}</div>
                    <p className="mt-1 text-sm font-bold leading-6 text-muted">{workerActionDescription[action]}</p>
                  </div>
                  <Button
                    variant={["disabled", "retired", "deleted"].includes(action) ? "warning" : "secondary"}
                    onClick={() => {
                      setConfirmAction({ worker: moreWorker, action });
                      setMoreWorker(null);
                    }}
                  >
                    选择
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {confirmAction ? (
        <Modal title={`确认${workerActionLabel[confirmAction.action]}`} onClose={() => setConfirmAction(null)} footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>取消</Button>
            <Button variant={["disabled", "retired", "deleted"].includes(confirmAction.action) ? "warning" : "primary"} onClick={applyLifecycleAction}>确认执行</Button>
          </>
        )}>
          <div className="space-y-4">
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">
              {workerActionDescription[confirmAction.action]} 当前只是前端演示，真实环境需要校验运行任务、写入审计日志，并通知调度器更新节点状态。
            </div>
            <WorkerSummary worker={confirmAction.worker} />
          </div>
        </Modal>
      ) : null}
    </AdminLayout>
  );
}

function WorkerNodeForm({
  form,
  onChange,
  showExecutor = false
}: {
  form: WorkerForm;
  onChange: <K extends keyof WorkerForm>(key: K, value: WorkerForm[K]) => void;
  showExecutor?: boolean;
}) {
  return (
    <div className="form-grid">
      <label className="field">
        <span className="label">节点名称</span>
        <input className="input" value={form.name} onChange={(event) => onChange("name", event.target.value)} />
      </label>
      <label className="field">
        <span className="label">节点区域</span>
        <input className="input" value={form.region} onChange={(event) => onChange("region", event.target.value)} placeholder="华东 1 / 本地实验室 / 华南" />
      </label>
      <label className="field">
        <span className="label">节点标签</span>
        <input className="input" value={form.labels} onChange={(event) => onChange("labels", event.target.value)} placeholder="aliyun-acr, harbor, high-bandwidth" />
      </label>
      {showExecutor ? (
        <label className="field">
          <span className="label">执行器类型</span>
          <Select
            value={form.executor}
            onChange={(value) => onChange("executor", value as WorkerNode["executor"])}
            options={[
              { value: "skopeo", label: "skopeo", description: "推荐作为 P0 主执行器" },
              { value: "crane", label: "crane", description: "备用 registry copy 路径" },
              { value: "docker", label: "docker", description: "Docker CLI 兼容方案" },
              { value: "nerdctl", label: "nerdctl", description: "containerd 环境兼容方案" }
            ]}
          />
        </label>
      ) : null}
      <label className="field">
        <span className="label">最大并发</span>
        <input className="input" type="number" min="1" value={form.maxConcurrency} onChange={(event) => onChange("maxConcurrency", event.target.value)} />
      </label>
      <label className="field">
        <span className="label">权重</span>
        <input className="input" type="number" min="0" value={form.weight} onChange={(event) => onChange("weight", event.target.value)} />
      </label>
      <label className="field md:col-span-2">
        <span className="label">备注</span>
        <textarea className="min-h-24 rounded-control border border-borderSoft bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-primary focus:shadow-focus" value={form.note} onChange={(event) => onChange("note", event.target.value)} />
      </label>
    </div>
  );
}

function WorkerSummary({ worker }: { worker: WorkerNode }) {
  return (
    <div className="grid gap-3 text-sm md:grid-cols-3">
      <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
        <div className="font-black">节点</div>
        <div className="mt-1 text-muted">{worker.name}</div>
      </div>
      <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
        <div className="font-black">当前状态</div>
        <div className="mt-1"><Badge tone={workerNodeStatusMeta[worker.status].tone}>{workerNodeStatusMeta[worker.status].label}</Badge></div>
      </div>
      <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
        <div className="font-black">运行任务</div>
        <div className="mt-1 text-muted">{worker.activeTasks} 个</div>
      </div>
    </div>
  );
}

function WorkerDetail({ worker }: { worker: WorkerNode }) {
  const runningTasks = worker.runningTasks ?? [];
  const events = worker.recentEvents ?? [];

  return (
    <div className="space-y-5">
      <WorkerSummary worker={worker} />
      <div className="grid gap-3 md:grid-cols-2">
        <InfoBlock title="并发与权重" value={`${worker.activeTasks} / ${worker.maxConcurrency ?? 0}`} hint={`权重 ${worker.weight ?? 0}`} />
        <InfoBlock title="心跳信息" value={worker.lastHeartbeat ?? worker.updatedAt} hint={`版本 ${worker.version ?? "-"}`} />
        <InfoBlock title="执行器" value={worker.executor} hint={`区域 ${worker.region}`} />
        <InfoBlock title="健康" value={`失败率 ${worker.failureRate ?? "-"}`} hint={`成功率 ${worker.successRate}`} />
      </div>
      <section className="rounded-[10px] border border-borderSoft bg-white p-4">
        <h4 className="m-0 text-base font-black text-ink">运行中任务</h4>
        <div className="mt-3 space-y-2">
          {runningTasks.length > 0 ? runningTasks.map((task) => (
            <div className="rounded-[10px] border border-blue-100 bg-blue-50/70 p-3" key={task.id}>
              <div className="font-mono text-xs font-black text-blue-700">{task.id}</div>
              <div className="mt-1 font-bold text-ink">{task.title}</div>
              <div className="mt-1 text-sm text-muted">{task.stage}</div>
            </div>
          )) : <div className="text-sm font-bold text-muted">暂无运行任务</div>}
        </div>
      </section>
      <section className="rounded-[10px] border border-borderSoft bg-white p-4">
        <h4 className="m-0 text-base font-black text-ink">最近错误</h4>
        <p className="mt-2 text-sm font-bold leading-7 text-muted">{worker.recentError ?? "无"}</p>
      </section>
      <section className="rounded-[10px] border border-borderSoft bg-white p-4">
        <h4 className="m-0 text-base font-black text-ink">最近事件</h4>
        <div className="mt-3 space-y-2">
          {events.length > 0 ? events.slice(0, 5).map((event) => (
            <div className="flex gap-2 text-sm font-bold text-slate-600" key={event}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <span>{event}</span>
            </div>
          )) : <div className="text-sm font-bold text-muted">暂无事件记录</div>}
        </div>
      </section>
      <div className="rounded-[10px] border border-blue-100 bg-blue-50/70 p-4 text-sm font-bold leading-7 text-slate-700">
        生命周期说明：online 可领取新任务；maintenance 暂停调度；draining 只完成已领取任务；disabled、retired、deleted 均不参与调度。
      </div>
    </div>
  );
}

function RegistrationGuide({ worker, connectionStatus }: { worker: WorkerNode; connectionStatus: ConnectionStatus }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">
        当前阶段没有真实 Worker 程序、没有真实 Worker 镜像，也不会真的启动 Worker。下面命令只展示未来接入方式的占位形态，Token 已脱敏，域名为示例域名。
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["创建节点", "启动 Worker", "等待心跳"].map((step, index) => (
          <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4" key={step}>
            <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-blue-600 text-sm font-black text-white">{index + 1}</div>
            <div className="mt-3 font-black text-ink">{step}</div>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {index === 0 ? "前端已生成节点记录和脱敏 Token 占位。" : index === 1 ? "未来在服务器上启动 imgpull-worker 程序或容器。" : "真实 Worker 首次上报心跳后，节点才会变为 online。"}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-3">
        <InfoBlock title="节点名称" value={worker.name} hint={worker.id} />
        <InfoBlock title="注册 Token" value="worker_token_demo_****" hint="仅演示占位，非真实 token" />
        <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
          <div className="font-black">接入状态</div>
          <div className="mt-2"><Badge tone={connectionTone(connectionStatus)}>{connectionLabel(connectionStatus)}</Badge></div>
        </div>
      </div>
      <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">
        正式接入前必须先开发 imgpull-worker 程序，完成 heartbeat、claim、lease、stage、logs、complete、fail 协议，并集成 skopeo / crane 执行镜像复制。当前“测试连接”和“模拟心跳成功”都只是前端 mock。
      </div>
      <section className="rounded-[10px] border border-borderSoft bg-white p-4">
        <h4 className="m-0 text-base font-black text-ink">Linux 服务器部署，未来二进制占位</h4>
        <p className="mt-2 text-sm font-bold leading-7 text-muted">`./imgpull-worker` 是未来要开发的 Worker 二进制。服务器需要能访问平台 API、源 Registry 和目标 Registry，并安装 skopeo / crane，或由后续 Worker 程序内置执行环境。</p>
        <div className="mt-3">
          <CodeBlock label="Linux 占位命令" code={linuxWorkerCommand()} />
        </div>
      </section>
      <section className="rounded-[10px] border border-borderSoft bg-white p-4">
        <h4 className="m-0 text-base font-black text-ink">Docker 容器部署，未来镜像占位</h4>
        <p className="mt-2 text-sm font-bold leading-7 text-muted">`registry.example.com/imgpull/worker:v0.1.0` 是未来 Worker 镜像占位。当前没有真实镜像，正式接入前需要先开发 Worker 程序并构建发布镜像。</p>
        <div className="mt-3">
          <CodeBlock label="Docker 占位命令" code={dockerWorkerCommand()} />
        </div>
      </section>
    </div>
  );
}

function InfoBlock({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3">
      <div className="font-black">{title}</div>
      <div className="mt-1 text-sm font-bold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-xs font-bold text-muted">{hint}</div> : null}
    </div>
  );
}

function WorkerBoundaryPanel() {
  return (
    <details className="mb-5 rounded-panel border border-amber-200 bg-amber-50/70 p-4 text-sm shadow-soft">
      <summary className="cursor-pointer select-none font-black text-amber-900">
        接入说明：当前只是前端演示，真实 Worker 尚未接入
      </summary>
      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[10px] border border-amber-200 bg-white/70 p-4">
          <h2 className="m-0 text-base font-black text-amber-900">当前阶段</h2>
          <div className="mt-3 grid gap-2 font-bold leading-7 text-amber-800 md:grid-cols-2">
            <div>没有真实 Worker 程序。</div>
            <div>没有真实 Worker 镜像。</div>
            <div>不会真的启动 Worker。</div>
            <div>不会真的拉取或推送镜像。</div>
            <div className="md:col-span-2">新增节点、测试连接、模拟心跳都只是前端 mock，不会调用后端、数据库或 registry。</div>
          </div>
        </div>
        <div className="rounded-[10px] border border-borderSoft bg-white/82 p-4">
          <h2 className="m-0 text-base font-black text-ink">后续真实接入</h2>
          <div className="mt-3 grid gap-2 font-bold leading-7 text-muted md:grid-cols-2">
            <div>开发 `imgpull-worker` 程序。</div>
            <div>实现 heartbeat / claim / lease。</div>
            <div>实现 stage / logs / complete / fail。</div>
            <div>集成 skopeo / crane 执行 copy。</div>
            <div>实现短期凭据下发和脱敏日志。</div>
            <div>实现成功结算和失败返还。</div>
          </div>
        </div>
        <div className="rounded-[10px] border border-blue-100 bg-white/82 p-4 xl:col-span-2">
          <h2 className="m-0 text-base font-black text-ink">任务分配建议</h2>
          <p className="mt-2 font-bold leading-7 text-muted">
            推荐由 Worker 主动请求 `/api/worker/tasks/claim` 领取任务。只有 online 节点、且 `currentTasks &lt; maxConcurrency` 时才能接新任务；maintenance、draining、disabled、retired、deleted 节点不接新任务。后端按负载、权重、标签和健康状态选择节点，执行期间 Worker 续租 lease，完成后上报 complete 或 fail。
          </p>
        </div>
      </div>
    </details>
  );
}
