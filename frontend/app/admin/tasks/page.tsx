"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TaskStatusBadges } from "@/components/business/TaskStatusBadges";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { CopyOnDoubleClick } from "@/components/ui/CopyOnDoubleClick";
import { Table } from "@/components/ui/Table";
import { imageTasks } from "@/lib/mock-data";
import { matchesBusinessNo, matchesTaskNo } from "@/lib/task-number";

function ownerEmail(taskId: string) {
  if (taskId.includes("118") || taskId.includes("119")) return "dev@demo.com";
  return "ops@demo.com";
}

export default function AdminTasksPage() {
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) return imageTasks;

    const normalizedText = keyword.toLowerCase();
    return imageTasks.filter((task) => (
      matchesTaskNo(keyword, task.taskNo, task.taskNoNormalized) ||
      matchesBusinessNo(keyword, task.batchNo ?? task.batchId) ||
      ownerEmail(task.id).toLowerCase().includes(normalizedText) ||
      task.sourceImage.toLowerCase().includes(normalizedText) ||
      task.targetImage.toLowerCase().includes(normalizedText) ||
      task.registryName.toLowerCase().includes(normalizedText)
    ));
  }, [search]);

  return (
    <AdminLayout>
      <div className="section-title">
        <h1>任务管理</h1>
        <p>管理员查看任务状态、错误码、Worker 分配和积分结算状态。任务编号用于客服、用户和管理员快速沟通，不替代内部 ID。</p>
      </div>
      <Card>
        <CardHeader title="任务列表" description="支持按任务编号、批次编号、用户邮箱和镜像地址搜索。源镜像和目标仓库支持双击复制。" />
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            className="h-10 w-full rounded-control border border-borderSoft bg-white px-3 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:shadow-focus lg:w-[440px]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索 IMG-QNX-8042、qnx8042、BAT-HBR-2190、用户邮箱或镜像地址"
            value={search}
          />
          <div className="text-sm font-bold text-muted">当前显示 {filteredTasks.length} 条任务</div>
        </div>
        <Table
          data={filteredTasks}
          rowKey={(row) => row.id}
          minWidth="min-w-[1230px]"
          columns={[
            {
              key: "taskNo",
              header: "任务编号",
              className: "w-[170px]",
              render: (row) => (
                <div className="space-y-1">
                  <Link className="whitespace-nowrap font-mono font-bold text-primary hover:text-primaryHover" href={`/admin/tasks/${row.id}`} title={`内部 ID：${row.id}`}>
                    {row.taskNo}
                  </Link>
                  {row.batchNo ? <div className="font-mono text-xs font-bold text-muted">{row.batchNo}</div> : null}
                </div>
              )
            },
            {
              key: "owner",
              header: "用户",
              className: "w-[140px]",
              render: (row) => <span className="text-sm font-bold text-slate-700">{ownerEmail(row.id)}</span>
            },
            {
              key: "source",
              header: "源镜像",
              className: "w-[230px] max-w-[230px]",
              render: (row) => <CopyOnDoubleClick value={row.sourceImage} className="max-w-[200px] text-sm text-muted" />
            },
            {
              key: "target",
              header: "目标仓库",
              className: "w-[285px] max-w-[285px]",
              render: (row) => <CopyOnDoubleClick value={row.targetImage} className="max-w-[255px] text-sm text-muted" />
            },
            {
              key: "status",
              header: "状态",
              className: "w-[205px]",
              render: (row) => <TaskStatusBadges task={row} />
            },
            {
              key: "worker",
              header: "Worker",
              className: "w-[145px]",
              render: (row) => (
                <span className="block max-w-[112px] truncate whitespace-nowrap font-bold text-slate-700" title={row.workerName}>
                  {row.workerName}
                </span>
              )
            },
            {
              key: "error",
              header: "错误码",
              className: "w-[155px]",
              render: (row) => (row.errorCode ? <Badge tone="red">{row.errorCode}</Badge> : <Badge tone="green">无</Badge>)
            }
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
