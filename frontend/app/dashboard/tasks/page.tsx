"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { imageTasks } from "@/lib/mock-data";
import { billingStatusMeta, displayTaskResult, taskStatusMeta } from "@/lib/status";
import { matchesBusinessNo, matchesTaskNo } from "@/lib/task-number";
import type { ImageTask } from "@/types/task";

type TaskSourceFilter = "all" | "single" | "batch";

const filterItems: Array<{ key: TaskSourceFilter; label: string }> = [
  { key: "all", label: "全部任务" },
  { key: "single", label: "单个任务" },
  { key: "batch", label: "批量导入" }
];

function PointsSummary({ task }: { task: ImageTask }) {
  const items = [
    { label: "预估", value: task.estimatedPoints, tone: "slate" as const },
    { label: "冻结", value: task.frozenPoints, tone: "amber" as const },
    { label: "消费", value: task.settledPoints, tone: "blue" as const },
    { label: "返还", value: task.refundedPoints, tone: "green" as const }
  ].filter((item) => item.value > 0 || item.label === "预估");

  return (
    <div className="grid max-w-[142px] grid-cols-2 gap-1">
      {items.map((item) => (
        <span
          className={`inline-flex min-w-0 items-center justify-between gap-1 rounded-[8px] border px-2 py-1 text-[11px] font-black leading-none ${
            item.tone === "amber"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : item.tone === "green"
                ? "border-green-200 bg-green-50 text-green-700"
                : item.tone === "blue"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
          key={item.label}
          title={`${item.label}积分 ${item.value}`}
        >
          <span className="truncate">{item.label}</span>
          <span>{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function ResultSummary({ task }: { task: ImageTask }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Badge tone={taskStatusMeta[task.taskStatus].tone}>{displayTaskResult(task.taskStatus, task.billingStatus)}</Badge>
        <Badge tone={billingStatusMeta[task.billingStatus].tone}>{billingStatusMeta[task.billingStatus].label}</Badge>
      </div>
      <div className="text-xs font-bold text-slate-500">{task.currentStage}</div>
    </div>
  );
}

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskSourceFilter>("all");
  const [search, setSearch] = useState("");
  const failed = imageTasks.find((task) => task.taskStatus === "failed");
  const batchTasks = useMemo(() => imageTasks.filter((task) => task.sourceType === "batch"), []);

  const filteredTasks = useMemo(() => {
    const bySource =
      filter === "single"
        ? imageTasks.filter((task) => task.sourceType !== "batch")
        : filter === "batch"
          ? batchTasks
          : imageTasks;

    const keyword = search.trim();
    if (!keyword) return bySource;

    const normalizedText = keyword.toLowerCase();
    return bySource.filter((task) => {
      return (
        matchesTaskNo(keyword, task.taskNo, task.taskNoNormalized) ||
        matchesBusinessNo(keyword, task.batchNo ?? task.batchId) ||
        task.sourceImage.toLowerCase().includes(normalizedText) ||
        task.targetImage.toLowerCase().includes(normalizedText) ||
        task.registryName.toLowerCase().includes(normalizedText)
      );
    });
  }, [batchTasks, filter, search]);

  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>任务列表</h1>
        <p>查看成功、执行中、失败返还、排队任务和批量导入任务。批量导入只负责一次创建多条独立任务，后续仍按单任务执行和结算。</p>
      </div>
      {failed ? (
        <Card className="mb-5 border-red-200 bg-red-50">
          <CardHeader
            title="失败任务案例"
            description={`任务 ${failed.taskNo}：${failed.errorCode}，${failed.failureReason}，积分已返还。`}
            action={<Button href={`/dashboard/tasks/${failed.id}`} variant="danger">查看失败详情</Button>}
          />
        </Card>
      ) : null}
      {batchTasks.length ? (
        <Card className="mb-5 border-blue-100 bg-blue-50">
          <CardHeader
            title="批量导入批次"
            description={`${batchTasks[0]?.batchNo ?? "BAT-HBR-2190"} 已生成 ${batchTasks.length} 条独立任务，队列、执行、结算和失败返还均按单条镜像处理。`}
            action={<Button onClick={() => setFilter("batch")} variant="primary">只看批量导入</Button>}
          />
        </Card>
      ) : null}
      <Card>
        <CardHeader
          title="镜像任务"
          description="任务结果和积分状态已合并展示；技术字段可在任务详情页查看。"
          action={<Button href="/dashboard/tasks/new" variant="primary">新建任务</Button>}
        />
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterItems.map((item) => (
              <button
                className={`h-10 rounded-control border px-4 text-sm font-black transition ${
                  filter === item.key ? "border-blue-200 bg-blue-50 text-primary" : "border-borderSoft bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={item.key}
                onClick={() => setFilter(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            className="h-10 w-full rounded-control border border-borderSoft bg-white px-3 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:shadow-focus lg:w-[360px]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索任务编号、批次编号或镜像地址"
            value={search}
          />
        </div>
        <Table
          data={filteredTasks}
          rowKey={(row) => row.id}
          minWidth="min-w-[1160px]"
          columns={[
            {
              key: "id",
              header: "任务编号",
              className: "w-[168px]",
              render: (row) => (
                <Link className="whitespace-nowrap font-mono font-black text-primary hover:text-primaryHover" href={`/dashboard/tasks/${row.id}`} title={`内部 ID：${row.id}`}>
                  {row.taskNo}
                </Link>
              )
            },
            {
              key: "batch",
              header: "来源",
              className: "w-[150px]",
              render: (row) =>
                row.sourceType === "batch" ? (
                  <div className="space-y-1">
                    <Badge tone="cyan">批量导入</Badge>
                    <div className="max-w-[122px] truncate font-mono text-xs text-muted" title={row.batchNo ?? row.batchId}>{row.batchNo ?? row.batchId}</div>
                    <div className="text-xs text-muted">第 {row.batchIndex} / {row.batchTotal} 条</div>
                  </div>
                ) : (
                  <Badge tone="slate">单个任务</Badge>
                )
            },
            { key: "result", header: "状态 / 结果", className: "w-[178px]", render: (row) => <ResultSummary task={row} /> },
            { key: "image", header: "源镜像", className: "w-[245px] max-w-[245px]", render: (row) => <span className="block max-w-[214px] truncate whitespace-nowrap text-sm text-muted" title={row.sourceImage}>{row.sourceImage}</span> },
            { key: "target", header: "目标镜像", className: "w-[280px] max-w-[280px]", render: (row) => <span className="block max-w-[248px] truncate whitespace-nowrap text-sm text-muted" title={row.targetImage}>{row.targetImage}</span> },
            { key: "points", header: "积分", className: "w-[150px] max-w-[150px]", render: (row) => <PointsSummary task={row} /> },
            { key: "action", header: "操作", className: "w-[110px]", render: (row) => <Button href={`/dashboard/tasks/${row.id}`} size="sm">查看详情</Button> }
          ]}
        />
      </Card>
    </UserDashboardLayout>
  );
}
