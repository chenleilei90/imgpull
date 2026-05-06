"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/components/business/MarkdownEditor";
import { MarkdownPreview } from "@/components/business/MarkdownPreview";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { announcements } from "@/lib/mock-data";

type AnnouncementStatus = "草稿" | "已发布" | "已下线";

interface AnnouncementDraft {
  id: string;
  title: string;
  status: AnnouncementStatus;
  time: string;
  summary: string;
  contentMarkdown: string;
}

const initialAnnouncements: AnnouncementDraft[] = announcements.map((item) => ({
  ...item,
  status: item.status as AnnouncementStatus,
  contentMarkdown: `# ${item.title}\n\n${item.summary}\n\n## 影响范围\n\n- 已提交任务不受影响。\n- 用户可以继续查看任务状态和积分流水。\n\n## 说明\n\n当前公告内容使用 Markdown 编辑器维护，保存和发布仅更新前端演示状态。`
}));

const emptyAnnouncement: AnnouncementDraft = {
  id: "ann-new",
  title: "",
  status: "草稿",
  time: "刚刚",
  summary: "",
  contentMarkdown: "# 新公告\n\n请填写面向用户的公告内容。\n\n## 说明\n\n- 第一条说明\n- 第二条说明"
};

const statusTone: Record<AnnouncementStatus, "green" | "amber" | "slate"> = {
  已发布: "green",
  草稿: "amber",
  已下线: "slate"
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementDraft[]>(initialAnnouncements);
  const [editing, setEditing] = useState<AnnouncementDraft | "new" | null>(null);
  const [previewing, setPreviewing] = useState<AnnouncementDraft | null>(null);
  const [form, setForm] = useState<AnnouncementDraft>(emptyAnnouncement);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("公告支持 Markdown 编辑、预览、发布和下线。当前只更新前端演示数据，不接真实后端。");

  function openNew() {
    setEditing("new");
    setForm({ ...emptyAnnouncement, id: `ann-${Date.now().toString().slice(-6)}` });
    setFullscreen(false);
  }

  function openEdit(item: AnnouncementDraft) {
    setEditing(item);
    setForm(item);
    setFullscreen(false);
  }

  function saveAnnouncement() {
    if (!form.title.trim()) {
      setNotice("公告标题不能为空。");
      return;
    }

    if (editing === "new") {
      setItems((prev) => [{ ...form, time: "刚刚" }, ...prev]);
      setNotice("新公告已保存到当前页面演示状态。");
    } else if (editing) {
      setItems((prev) => prev.map((item) => item.id === editing.id ? { ...form, time: "刚刚" } : item));
      setNotice("公告修改已保存到当前页面演示状态。");
    }

    setEditing(null);
  }

  function changeStatus(item: AnnouncementDraft, status: AnnouncementStatus) {
    setItems((prev) => prev.map((row) => row.id === item.id ? { ...row, status, time: "刚刚" } : row));
    setNotice(`公告“${item.title}”已切换为${status}。`);
  }

  return (
    <AdminLayout>
      <div className="section-title">
        <h1>公告管理</h1>
        <p>P0 提供基础公告管理，公告正文使用 Markdown 编辑器维护。当前只做前端演示，不接真实后端。</p>
      </div>
      <div className="mb-5 rounded-panel border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-700">{notice}</div>
      <Card>
        <CardHeader title="公告列表" action={<Button variant="primary" onClick={openNew}>新建公告</Button>} />
        <Table
          data={items}
          rowKey={(row) => row.id}
          minWidth="min-w-[980px]"
          columns={[
            {
              key: "title",
              header: "标题",
              className: "w-[260px]",
              render: (row) => (
                <div>
                  <div className="max-w-[240px] truncate font-black text-ink" title={row.title}>{row.title}</div>
                  <div className="mt-1 max-w-[240px] truncate text-xs text-muted" title={row.summary}>{row.summary}</div>
                </div>
              )
            },
            { key: "status", header: "状态", className: "w-[110px]", render: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge> },
            { key: "time", header: "时间", className: "w-[130px]", render: (row) => row.time },
            { key: "summary", header: "摘要", render: (row) => <span className="text-sm text-muted">{row.summary}</span> },
            {
              key: "actions",
              header: "操作",
              className: "w-[240px]",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>编辑</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPreviewing(row)}>预览</Button>
                  {row.status === "已发布" ? (
                    <Button size="sm" variant="warning" onClick={() => changeStatus(row, "已下线")}>下线</Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => changeStatus(row, "已发布")}>发布</Button>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {editing ? (
        <Modal
          title={editing === "new" ? "新建公告" : "编辑公告"}
          placement="drawer"
          fullscreen={fullscreen}
          onFullscreenToggle={() => setFullscreen((value) => !value)}
          onClose={() => setEditing(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>取消</Button>
              <Button variant="primary" onClick={saveAnnouncement}>保存公告</Button>
            </>
          )}
        >
          <div className="space-y-5">
            <div className="form-grid">
              <label className="field">
                <span className="label">标题</span>
                <input className="input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label className="field">
                <span className="label">状态</span>
                <Select
                  value={form.status}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value as AnnouncementStatus }))}
                  options={[
                    { value: "草稿", label: "草稿" },
                    { value: "已发布", label: "已发布" },
                    { value: "已下线", label: "已下线" }
                  ]}
                />
              </label>
              <label className="field md:col-span-2">
                <span className="label">摘要</span>
                <textarea className="min-h-20 rounded-control border border-borderSoft bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:shadow-focus" value={form.summary} onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))} />
              </label>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-ink">公告 Markdown 正文</div>
                  <p className="mt-1 text-xs font-bold text-muted">支持标题、列表、代码块、表格和链接。保存仅更新当前前端演示状态。</p>
                </div>
                <Badge tone="blue">Markdown</Badge>
              </div>
              <MarkdownEditor markdown={form.contentMarkdown} onChange={(value) => setForm((prev) => ({ ...prev, contentMarkdown: value }))} />
            </div>
          </div>
        </Modal>
      ) : null}

      {previewing ? (
        <Modal
          title={`预览：${previewing.title}`}
          placement="drawer"
          onClose={() => setPreviewing(null)}
          footer={<Button variant="secondary" onClick={() => setPreviewing(null)}>关闭</Button>}
        >
          <MarkdownPreview content={previewing.contentMarkdown} />
        </Modal>
      ) : null}
    </AdminLayout>
  );
}
