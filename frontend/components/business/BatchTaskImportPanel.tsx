"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { registryAccounts } from "@/lib/mock-data";
import type { BadgeTone } from "@/lib/status";
import type { RegistryAccount } from "@/types/registry";

type BatchPreviewStatus = "ready" | "invalid_format" | "duplicate" | "over_limit" | "target_invalid";

interface BatchPreviewRow {
  lineNo: number;
  taskNo: string;
  sourceImage: string;
  targetImage: string;
  status: BatchPreviewStatus;
  estimatedPoints: number;
  hint: string;
}

const demoBatchNo = "BAT-HBR-2190";

const demoTaskNoPool = ["IMG-QNX-8042", "IMG-ACR-4827", "IMG-HBR-2190", "IMG-SWR-3906", "IMG-BAT-1005"];

const validSampleInput = [
  "docker.io/library/nginx:latest",
  "ghcr.io/acme/api:v1.8 => registry.example.com/platform/api:v1.8",
  "quay.io/coreos/etcd:v3.5",
  "registry.k8s.io/pause:3.9",
  "docker.io/library/redis:7"
].join("\n");

const invalidSampleInput = [
  "docker.io/library/nginx:latest",
  "docker.io/library/nginx:latest",
  "invalid-image-without-tag",
  "ghcr.io/acme/web:v2 => badtarget",
  "quay.io/coreos/etcd:v3.5"
].join("\n");

const statusMeta: Record<BatchPreviewStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: "可提交", tone: "green" },
  invalid_format: { label: "格式错误", tone: "red" },
  duplicate: { label: "重复镜像", tone: "amber" },
  over_limit: { label: "超过上限", tone: "red" },
  target_invalid: { label: "目标路径无效", tone: "red" }
};

function isValidImageRef(value: string) {
  return /^[a-zA-Z0-9.-]+(?::\d+)?\/[^\s=>]+:[^\s=>]+$/.test(value);
}

function buildTargetImage(sourceImage: string, registry: RegistryAccount) {
  const imageName = sourceImage.split("/").pop() ?? sourceImage;
  return `${registry.endpoint}/${registry.namespace}/${imageName}`;
}

function estimatePoints(sourceImage: string) {
  return 5 + (sourceImage.length % 8);
}

function parseBatchInput(input: string, registry: RegistryAccount): BatchPreviewRow[] {
  const seenSources = new Set<string>();
  const rows = input
    .split(/\r?\n/)
    .map((line, index) => ({ raw: line.trim(), lineNo: index + 1 }))
    .filter((line) => line.raw.length > 0);

  return rows.map((line, index) => {
    const [sourceRaw, targetRaw, ...extraParts] = line.raw.split("=>").map((part) => part.trim());
    const sourceImage = sourceRaw ?? "";
    const explicitTarget = targetRaw ?? "";
    const targetImage = explicitTarget || buildTargetImage(sourceImage, registry);
    let status: BatchPreviewStatus = "ready";
    let hint = explicitTarget ? "使用自定义目标路径。" : "将按所选目标仓库自动生成目标路径。";

    if (index >= 50) {
      status = "over_limit";
      hint = "每次最多提交 50 行，超过上限的行不会提交。";
    } else if (extraParts.length > 0 || !isValidImageRef(sourceImage)) {
      status = "invalid_format";
      hint = "请使用 registry/repository/image:tag 格式，每行一个镜像。";
    } else if (seenSources.has(sourceImage.toLowerCase())) {
      status = "duplicate";
      hint = "同一批次中已出现相同源镜像，请删除重复行。";
    } else if (!isValidImageRef(targetImage)) {
      status = "target_invalid";
      hint = "目标路径需要包含 registry、namespace、镜像名和 tag。";
    }

    if (status === "ready") {
      seenSources.add(sourceImage.toLowerCase());
    }

    return {
      lineNo: line.lineNo,
      taskNo: demoTaskNoPool[index] ?? `IMG-BAT-${String(1000 + index + 1).slice(-4)}`,
      sourceImage,
      targetImage,
      status,
      estimatedPoints: status === "ready" ? estimatePoints(sourceImage) : 0,
      hint
    };
  });
}

export function BatchTaskImportPanel() {
  const [registryId, setRegistryId] = useState(registryAccounts[0].id);
  const [input, setInput] = useState("");
  const [previewRows, setPreviewRows] = useState<BatchPreviewRow[]>([]);
  const [parsedInput, setParsedInput] = useState("");
  const [parsedRegistryId, setParsedRegistryId] = useState("");
  const [submittedBatch, setSubmittedBatch] = useState<null | {
    batchNo: string;
    createdCount: number;
    estimatedFrozenPoints: number;
    tasks: Array<{ taskNo: string; sourceImage: string; targetImage: string }>;
  }>(null);

  const selectedRegistry = registryAccounts.find((registry) => registry.id === registryId) ?? registryAccounts[0];
  const previewIsCurrent = previewRows.length > 0 && parsedInput === input && parsedRegistryId === registryId;
  const currentPreviewRows = previewIsCurrent ? previewRows : [];
  const validRows = currentPreviewRows.filter((row) => row.status === "ready");
  const invalidRows = currentPreviewRows.filter((row) => row.status !== "ready");
  const estimatedFrozenPoints = validRows.reduce((sum, row) => sum + row.estimatedPoints, 0);
  const hasBlockingRows = !previewIsCurrent || invalidRows.length > 0 || validRows.length === 0;

  const summary = useMemo(
    () => [
      { label: "预计总任务数", value: currentPreviewRows.length || "-" },
      { label: "有效任务数", value: validRows.length || "-" },
      { label: "无效行数", value: invalidRows.length || "-" },
      { label: "预计冻结积分", value: currentPreviewRows.length ? estimatedFrozenPoints : "-" }
    ],
    [currentPreviewRows.length, estimatedFrozenPoints, invalidRows.length, validRows.length]
  );

  function handleParse() {
    setPreviewRows(parseBatchInput(input, selectedRegistry));
    setParsedInput(input);
    setParsedRegistryId(registryId);
    setSubmittedBatch(null);
  }

  function handleSubmit() {
    if (hasBlockingRows) return;
    setSubmittedBatch({
      batchNo: demoBatchNo,
      createdCount: validRows.length,
      estimatedFrozenPoints,
      tasks: validRows.map((row) => ({
        taskNo: row.taskNo,
        sourceImage: row.sourceImage,
        targetImage: row.targetImage
      }))
    });
  }

  function resetPreviewState() {
    setPreviewRows([]);
    setParsedInput("");
    setParsedRegistryId("");
    setSubmittedBatch(null);
  }

  function handleSample(inputValue: string) {
    setInput(inputValue);
    resetPreviewState();
  }

  function handleRegistryChange(nextRegistryId: string) {
    setRegistryId(nextRegistryId);
    resetPreviewState();
  }

  function handleClear() {
    setInput("");
    resetPreviewState();
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="批量导入任务"
          description="一次粘贴多行镜像地址，系统按行解析并创建多条独立任务。每条任务独立冻结积分、执行、结算和失败返还。"
          action={
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleSample(validSampleInput)} variant="secondary">填入有效示例</Button>
              <Button onClick={() => handleSample(invalidSampleInput)} variant="warning">填入错误示例</Button>
            </div>
          }
        />
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <label className="field">
              <span className="label">目标私有仓库</span>
              <Select
                value={registryId}
                onChange={handleRegistryChange}
                options={registryAccounts.map((registry) => ({
                  value: registry.id,
                  label: `${registry.name} / ${registry.namespace}`,
                  description: registry.endpoint
                }))}
              />
            </label>
            <label className="field">
              <span className="label">镜像地址</span>
              <textarea
                className="min-h-[260px] w-full resize-y rounded-control border border-borderSoft bg-white px-3 py-3 font-mono text-sm leading-7 text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:shadow-focus"
                onChange={(event) => {
                  setInput(event.target.value);
                  resetPreviewState();
                }}
                placeholder={[
                  "每行一个镜像地址，最多 50 行。",
                  "docker.io/library/nginx:latest",
                  "ghcr.io/acme/api:v1.8 => registry.example.com/platform/api:v1.8",
                  "quay.io/coreos/etcd:v3.5"
                ].join("\n")}
                value={input}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleParse} variant="primary">解析预览</Button>
              <Button onClick={handleClear} variant="secondary">清空</Button>
              <Button disabled={hasBlockingRows} onClick={handleSubmit} variant="success">提交批量任务</Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-panel border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-black text-primary">批量任务规则</div>
              <div className="mt-2 space-y-2 text-sm leading-7 text-slate-700">
                <p>未写 `=&gt;` 时，目标路径会按所选仓库自动生成。</p>
                <p>某一条任务失败时，只返还该条任务的冻结积分，不影响同批次其他任务。</p>
                <p>批次仅用于前端展示和管理，Worker 后续仍按单任务领取。</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {summary.map((item) => (
                <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-4" key={item.label}>
                  <div className="text-xs font-black text-muted">{item.label}</div>
                  <div className="mt-1 text-2xl font-black text-ink">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {currentPreviewRows.length ? (
        <Card>
          <CardHeader
            title="解析预览"
            description="请先修正格式错误、重复镜像和超过上限的行，再提交批量任务。"
          />
          <Table
            data={currentPreviewRows}
            rowKey={(row) => String(row.lineNo)}
            minWidth="min-w-[980px]"
            columns={[
              { key: "line", header: "行号", className: "w-[70px]", render: (row) => <span className="font-black">{row.lineNo}</span> },
              { key: "taskNo", header: "任务编号", className: "w-[150px]", render: (row) => <span className="font-mono text-sm font-black text-primary">{row.taskNo}</span> },
              { key: "source", header: "源镜像", className: "w-[240px]", render: (row) => <span className="block truncate font-mono text-xs text-slate-700" title={row.sourceImage}>{row.sourceImage}</span> },
              { key: "target", header: "目标镜像", className: "w-[270px]", render: (row) => <span className="block truncate font-mono text-xs text-slate-700" title={row.targetImage}>{row.targetImage}</span> },
              { key: "status", header: "解析状态", className: "w-[120px]", render: (row) => <Badge tone={statusMeta[row.status].tone}>{statusMeta[row.status].label}</Badge> },
              { key: "points", header: "预计积分", className: "w-[100px]", render: (row) => <span className="font-black">{row.estimatedPoints || "-"}</span> },
              { key: "hint", header: "提示", render: (row) => <span className="text-sm text-muted">{row.hint}</span> }
            ]}
          />
        </Card>
      ) : null}

      {submittedBatch ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader
            title="批量任务已进入队列"
            description="以下结果为前端演示环境中的提交反馈，真实环境会由后端创建多条独立 ImageTask。"
            action={<Button href="/dashboard/tasks" variant="primary">查看任务列表</Button>}
          />
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[10px] bg-white p-4">
              <div className="text-xs font-black text-muted">批次号</div>
              <div className="mt-1 break-all font-mono text-sm font-black text-ink">{submittedBatch.batchNo}</div>
            </div>
            <div className="rounded-[10px] bg-white p-4">
              <div className="text-xs font-black text-muted">提交任务数</div>
              <div className="mt-1 text-2xl font-black text-ink">{submittedBatch.createdCount}</div>
            </div>
            <div className="rounded-[10px] bg-white p-4">
              <div className="text-xs font-black text-muted">队列状态</div>
              <div className="mt-1 text-lg font-black text-green-700">已进入队列</div>
            </div>
            <div className="rounded-[10px] bg-white p-4">
              <div className="text-xs font-black text-muted">预计冻结积分</div>
              <div className="mt-1 text-2xl font-black text-ink">{submittedBatch.estimatedFrozenPoints}</div>
            </div>
          </div>
          <div className="mt-4 rounded-[10px] border border-green-200 bg-white p-4">
            <div className="mb-3 text-sm font-black text-green-800">
              批次 {submittedBatch.batchNo} 已创建 {submittedBatch.createdCount} 条任务
            </div>
            <div className="space-y-2">
              {submittedBatch.tasks.map((task) => (
                <div className="grid gap-2 rounded-[9px] bg-slate-50 px-3 py-2 text-sm md:grid-cols-[140px_1fr]" key={`${task.taskNo}-${task.sourceImage}`}>
                  <span className="font-mono font-black text-primary">{task.taskNo}</span>
                  <span className="truncate font-mono text-xs text-muted" title={`${task.sourceImage} => ${task.targetImage}`}>
                    {task.sourceImage} =&gt; {task.targetImage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
