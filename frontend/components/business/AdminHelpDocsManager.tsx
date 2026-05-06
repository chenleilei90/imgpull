"use client";

import { useMemo, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/business/MarkdownEditor";
import { MarkdownPreview } from "@/components/business/MarkdownPreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { helpArticles, helpCategories } from "@/lib/mock-data";
import type { HelpArticle, HelpArticleStatus, HelpCategory, HelpCategoryStatus } from "@/types/admin";

type ArticleForm = Pick<HelpArticle, "title" | "slug" | "category" | "summary" | "status" | "contentMarkdown"> & {
  tags: string;
};

type CategoryDraft = Pick<HelpCategory, "name" | "slug" | "description">;

type OutlineItem = {
  id: string;
  level: number;
  order: number;
  text: string;
};

const statusLabel: Record<HelpArticleStatus, string> = {
  draft: "草稿",
  published: "已发布",
  offline: "已下线"
};

const statusTone: Record<HelpArticleStatus, "blue" | "green" | "slate"> = {
  draft: "blue",
  published: "green",
  offline: "slate"
};

const categoryStatusLabel: Record<HelpCategoryStatus, string> = {
  enabled: "启用",
  disabled: "停用"
};

const emptyForm: ArticleForm = {
  title: "",
  slug: "",
  category: "快速开始",
  summary: "",
  status: "draft",
  tags: "新增",
  contentMarkdown: "# 新帮助文章\n\n请在这里填写面向用户的操作说明。\n\n## 操作步骤\n\n- 第一步\n- 第二步\n- 第三步"
};

const emptyCategoryDraft: CategoryDraft = {
  name: "",
  slug: "",
  description: ""
};

function toForm(article: HelpArticle): ArticleForm {
  return {
    title: article.title,
    slug: article.slug,
    category: article.category,
    summary: article.summary,
    status: article.status,
    tags: article.tags.join(", "),
    contentMarkdown: article.contentMarkdown
  };
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `category-${Date.now().toString().slice(-6)}`;
}

function parseMarkdownOutline(markdown: string): OutlineItem[] {
  let order = 0;
  return markdown
    .split(/\r?\n/)
    .map((line, index) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
      if (!match) return null;

      const text = match[2]
        .replace(/[`*_~[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) return null;

      return {
        id: `heading-${index}`,
        level: match[1].length,
        order: order++,
        text
      };
    })
    .filter((item): item is OutlineItem => Boolean(item));
}

export function AdminHelpDocsManager() {
  const [articles, setArticles] = useState<HelpArticle[]>(helpArticles);
  const [categories, setCategories] = useState<HelpCategory[]>(helpCategories);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | HelpArticleStatus>("all");
  const [editing, setEditing] = useState<HelpArticle | "new" | null>(null);
  const [previewing, setPreviewing] = useState<HelpArticle | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategoryDraft);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [notice, setNotice] = useState("所有帮助文章都以 Markdown 字符串保存。已发布文章也可以随时编辑、保存、重新发布或下线；当前只更新前端演示状态，不写入真实后端。");

  const enabledCategories = useMemo(() => categories.filter((item) => item.status === "enabled"), [categories]);

  const categoryCounts = useMemo(() => {
    return articles.reduce<Record<string, number>>((acc, article) => {
      acc[article.category] = (acc[article.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [articles]);

  const filtered = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return articles.filter((article) => {
      if (category !== "all" && article.category !== category) return false;
      if (status !== "all" && article.status !== status) return false;
      if (!lower) return true;
      return [article.title, article.slug, article.summary, article.category].join(" ").toLowerCase().includes(lower);
    });
  }, [articles, category, keyword, status]);

  function openNew() {
    setEditing("new");
    setForm({
      ...emptyForm,
      category: enabledCategories[0]?.name ?? emptyForm.category
    });
    setEditorFullscreen(false);
  }

  function openEdit(article: HelpArticle) {
    setEditing(article);
    setForm(toForm(article));
    setEditorFullscreen(false);
  }

  function closeEditor() {
    setEditing(null);
    setEditorFullscreen(false);
  }

  function updateForm<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveArticle() {
    if (!form.title.trim() || !form.slug.trim()) {
      setNotice("标题和 slug 必须填写。");
      return;
    }

    if (editing === "new") {
      const article: HelpArticle = {
        id: `help-${Date.now().toString().slice(-6)}`,
        title: form.title,
        slug: form.slug,
        category: form.category,
        summary: form.summary,
        status: form.status,
        contentMarkdown: form.contentMarkdown,
        updatedAt: "刚刚",
        readingMinutes: Math.max(2, Math.ceil(form.contentMarkdown.length / 460)),
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean)
      };
      setArticles((prev) => [article, ...prev]);
      setNotice("新文章已保存到当前页面状态。真实环境需要通过后端 API 持久化。");
    } else if (editing) {
      setArticles((prev) => prev.map((item) => item.id === editing.id ? {
        ...item,
        title: form.title,
        slug: form.slug,
        category: form.category,
        summary: form.summary,
        status: form.status,
        contentMarkdown: form.contentMarkdown,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        updatedAt: "刚刚",
        readingMinutes: Math.max(2, Math.ceil(form.contentMarkdown.length / 460))
      } : item));
      setNotice("文章修改已保存到当前页面状态。已发布文章也可以继续修改后重新保存。");
    }

    setEditing(null);
  }

  function changeStatus(article: HelpArticle, nextStatus: HelpArticleStatus) {
    setArticles((prev) => prev.map((item) => item.id === article.id ? { ...item, status: nextStatus, updatedAt: "刚刚" } : item));
    setNotice(`${article.title} 已切换为「${statusLabel[nextStatus]}」。`);
  }

  function updateCategory(categoryId: string, patch: Partial<HelpCategory>) {
    const current = categories.find((item) => item.id === categoryId);
    if (!current) return;

    setCategories((prev) => prev.map((item) => item.id === categoryId ? { ...item, ...patch, updatedAt: "刚刚" } : item));

    const nextName = patch.name;
    if (nextName && nextName !== current.name) {
      setArticles((prev) => prev.map((article) => article.category === current.name ? { ...article, category: nextName, updatedAt: "刚刚" } : article));
      setForm((prev) => prev.category === current.name ? { ...prev, category: nextName } : prev);
      setCategory((value) => value === current.name ? nextName : value);
    }
  }

  function addCategory() {
    if (!categoryDraft.name.trim()) {
      setNotice("分类名称必须填写。");
      return;
    }

    const next: HelpCategory = {
      id: `hc-${Date.now().toString().slice(-6)}`,
      name: categoryDraft.name.trim(),
      slug: categoryDraft.slug.trim() || toSlug(categoryDraft.name),
      description: categoryDraft.description.trim() || "用于归类帮助中心文章。",
      status: "enabled",
      updatedAt: "刚刚"
    };

    setCategories((prev) => [next, ...prev]);
    setCategoryDraft(emptyCategoryDraft);
    setNotice(`分类「${next.name}」已加入当前页面状态。`);
  }

  function removeCategory(categoryId: string) {
    const current = categories.find((item) => item.id === categoryId);
    if (!current) return;
    if ((categoryCounts[current.name] ?? 0) > 0) {
      setNotice(`分类「${current.name}」仍有关联文章，不能删除。可以先停用，或把文章迁移到其他分类。`);
      return;
    }

    setCategories((prev) => prev.filter((item) => item.id !== categoryId));
    setCategory((value) => value === current.name ? "all" : value);
    setNotice(`分类「${current.name}」已从当前页面状态移除。`);
  }

  return (
    <div className="space-y-5">
      <div className="section-title">
        <h1>帮助文档管理</h1>
        <p>维护用户侧帮助中心文章。P0 使用实时渲染 Markdown 编辑器，文章以 Markdown 字符串保存；支持基础分类管理，不做复杂 CMS、历史版本、审批流或附件上传。</p>
      </div>

      <div className="rounded-panel border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-700">{notice}</div>

      <Card>
        <CardHeader
          title="文章列表"
          description="搜索、筛选、编辑、发布和下线均为前端演示操作。已发布文章仍可随时进入编辑器修改。"
          action={(
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setCategoryManagerOpen(true)}>管理分类</Button>
              <Button variant="primary" onClick={openNew}>新建文章</Button>
            </div>
          )}
        />

        <div className="data-toolbar mb-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.8fr_auto]">
            <input className="input" placeholder="搜索标题、slug、摘要或分类" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "全部分类" },
                ...categories.map((item) => ({
                  value: item.name,
                  label: `${item.name}${item.status === "disabled" ? "（停用）" : ""}`,
                  description: item.description
                }))
              ]}
            />
            <Select
              value={status}
              onChange={(value) => setStatus(value as "all" | HelpArticleStatus)}
              options={[
                { value: "all", label: "全部状态" },
                { value: "draft", label: "草稿" },
                { value: "published", label: "已发布" },
                { value: "offline", label: "已下线" }
              ]}
            />
            <Button variant="secondary" onClick={() => { setKeyword(""); setCategory("all"); setStatus("all"); }}>清除</Button>
          </div>
        </div>

        <Table
          data={filtered}
          rowKey={(row) => row.id}
          minWidth="min-w-[960px]"
          columns={[
            {
              key: "title",
              header: "标题",
              className: "w-[280px]",
              render: (row) => (
                <div>
                  <div className="max-w-[260px] truncate font-black text-ink" title={row.title}>{row.title}</div>
                  <div className="mt-1 max-w-[260px] truncate text-xs text-muted" title={row.summary}>{row.summary}</div>
                </div>
              )
            },
            { key: "slug", header: "slug", className: "w-[190px]", render: (row) => <code className="font-bold text-primary">{row.slug}</code> },
            { key: "category", header: "分类", className: "w-[150px]", render: (row) => <span className="font-bold text-slate-700">{row.category}</span> },
            { key: "status", header: "状态", className: "w-[100px]", render: (row) => <Badge tone={statusTone[row.status]}>{statusLabel[row.status]}</Badge> },
            { key: "updatedAt", header: "更新时间", className: "w-[110px]", render: (row) => row.updatedAt },
            { key: "reading", header: "阅读时间", className: "w-[90px]", render: (row) => `${row.readingMinutes} 分钟` },
            {
              key: "actions",
              header: "操作",
              className: "w-[230px]",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>编辑</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPreviewing(row)}>预览</Button>
                  {row.status === "published" ? (
                    <Button size="sm" variant="warning" onClick={() => changeStatus(row, "offline")}>下线</Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => changeStatus(row, "published")}>发布</Button>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {categoryManagerOpen ? (
        <Modal
          title="帮助分类管理"
          placement="drawer"
          onClose={() => setCategoryManagerOpen(false)}
          footer={<Button variant="secondary" onClick={() => setCategoryManagerOpen(false)}>完成</Button>}
        >
          <CategoryManager
            articles={articles}
            categories={categories}
            draft={categoryDraft}
            onDraftChange={setCategoryDraft}
            onAdd={addCategory}
            onRemove={removeCategory}
            onUpdate={updateCategory}
          />
        </Modal>
      ) : null}

      {editing ? (
        <Modal
          title={editing === "new" ? "新建帮助文章" : "编辑帮助文章"}
          placement="drawer"
          fullscreen={editorFullscreen}
          onFullscreenToggle={() => setEditorFullscreen((value) => !value)}
          onClose={closeEditor}
          footer={(
            <>
              <Button variant="ghost" onClick={closeEditor}>取消</Button>
              <Button variant="primary" onClick={saveArticle}>保存文章</Button>
            </>
          )}
        >
          <ArticleEditor form={form} categories={enabledCategories.map((item) => item.name)} onChange={updateForm} />
        </Modal>
      ) : null}

      {previewing ? (
        <Modal title={`预览：${previewing.title}`} placement="drawer" onClose={() => setPreviewing(null)} footer={<Button variant="secondary" onClick={() => setPreviewing(null)}>关闭</Button>}>
          <MarkdownPreview content={previewing.contentMarkdown} />
        </Modal>
      ) : null}
    </div>
  );
}

function CategoryManager({
  articles,
  categories,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  onUpdate
}: {
  articles: HelpArticle[];
  categories: HelpCategory[];
  draft: CategoryDraft;
  onDraftChange: (draft: CategoryDraft) => void;
  onAdd: () => void;
  onRemove: (categoryId: string) => void;
  onUpdate: (categoryId: string, patch: Partial<HelpCategory>) => void;
}) {
  const countByCategory = useMemo(() => {
    return articles.reduce<Record<string, number>>((acc, article) => {
      acc[article.category] = (acc[article.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [articles]);

  return (
    <div className="space-y-5">
      <div className="rounded-panel border border-blue-100 bg-blue-50/70 p-4 text-sm font-bold leading-7 text-slate-700">
        分类用于组织帮助中心文章。当前管理动作只更新前端演示状态；真实上线后需要由后端持久化，并在用户侧帮助中心同步展示。
      </div>

      <div className="rounded-panel border border-borderSoft bg-slate-50 p-4">
        <div className="mb-3 text-sm font-black text-ink">新增分类</div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto]">
          <input
            className="input"
            placeholder="分类名称，例如 运维环境"
            value={draft.name}
            onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
          />
          <input
            className="input"
            placeholder="slug，可留空自动生成"
            value={draft.slug}
            onChange={(event) => onDraftChange({ ...draft, slug: event.target.value })}
          />
          <input
            className="input"
            placeholder="分类说明"
            value={draft.description}
            onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
          />
          <Button variant="primary" onClick={onAdd}>新增</Button>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((item) => {
          const articleCount = countByCategory[item.name] ?? 0;
          return (
            <div className="rounded-panel border border-borderSoft bg-white p-4 shadow-soft" key={item.id}>
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.5fr_90px_160px] lg:items-center">
                <input
                  className="input"
                  value={item.name}
                  onChange={(event) => onUpdate(item.id, { name: event.target.value })}
                />
                <input
                  className="input"
                  value={item.slug}
                  onChange={(event) => onUpdate(item.id, { slug: event.target.value })}
                />
                <input
                  className="input"
                  value={item.description}
                  onChange={(event) => onUpdate(item.id, { description: event.target.value })}
                />
                <Badge tone={item.status === "enabled" ? "green" : "slate"}>{categoryStatusLabel[item.status]}</Badge>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={item.status === "enabled" ? "warning" : "success"}
                    onClick={() => onUpdate(item.id, { status: item.status === "enabled" ? "disabled" : "enabled" })}
                  >
                    {item.status === "enabled" ? "停用" : "启用"}
                  </Button>
                  <Button size="sm" variant="danger" disabled={articleCount > 0} onClick={() => onRemove(item.id)}>删除</Button>
                </div>
              </div>
              <div className="mt-2 text-xs font-bold text-muted">
                {articleCount} 篇文章 · 更新时间 {item.updatedAt}
                {articleCount > 0 ? " · 有文章关联时不能删除，可先停用或迁移文章分类。" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArticleEditor({
  form,
  categories,
  onChange
}: {
  form: ArticleForm;
  categories: string[];
  onChange: <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => void;
}) {
  const categoryOptions = useMemo(() => {
    return form.category && !categories.includes(form.category) ? [...categories, form.category] : categories;
  }, [categories, form.category]);

  const outline = useMemo(() => parseMarkdownOutline(form.contentMarkdown), [form.contentMarkdown]);
  const editorRef = useRef<HTMLDivElement>(null);

  function jumpToHeading(order: number) {
    const headings = editorRef.current?.querySelectorAll("h1, h2, h3");
    const target = headings?.[order];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="space-y-5">
      <div className="form-grid">
        <label className="field">
          <span className="label">标题</span>
          <input className="input" value={form.title} onChange={(event) => onChange("title", event.target.value)} />
        </label>
        <label className="field">
          <span className="label">slug</span>
          <input className="input" value={form.slug} onChange={(event) => onChange("slug", event.target.value)} />
        </label>
        <label className="field">
          <span className="label">分类</span>
          <Select
            value={form.category}
            onChange={(value) => onChange("category", value)}
            options={categoryOptions.map((item) => ({ value: item, label: item }))}
          />
        </label>
        <label className="field">
          <span className="label">状态</span>
          <Select
            value={form.status}
            onChange={(value) => onChange("status", value as HelpArticleStatus)}
            options={[
              { value: "draft", label: "草稿" },
              { value: "published", label: "已发布" },
              { value: "offline", label: "已下线" }
            ]}
          />
        </label>
        <label className="field md:col-span-2">
          <span className="label">摘要</span>
          <textarea className="min-h-20 rounded-control border border-borderSoft bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:shadow-focus" value={form.summary} onChange={(event) => onChange("summary", event.target.value)} />
        </label>
        <label className="field md:col-span-2">
          <span className="label">标签</span>
          <input className="input" placeholder="推荐, 常见, 新增" value={form.tags} onChange={(event) => onChange("tags", event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-ink">实时渲染 Markdown 编辑器</div>
              <p className="mt-1 text-xs font-bold text-muted">编辑区本身已经实时渲染，右侧只显示文章大纲。点击右上角“全屏编辑”可获得更大的编辑区域。</p>
            </div>
            <span className="rounded-[8px] bg-blue-50 px-3 py-1.5 text-xs font-black text-primary">保存为 Markdown</span>
          </div>
          <div ref={editorRef}>
            <MarkdownEditor markdown={form.contentMarkdown} onChange={(value) => onChange("contentMarkdown", value)} />
          </div>
        </section>

        <aside className="rounded-panel border border-borderSoft bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-ink">文章大纲</div>
              <p className="mt-1 text-xs font-bold text-muted">根据 Markdown 标题实时生成，不再重复展示预览。</p>
            </div>
            <Badge tone="blue">{outline.length} 项</Badge>
          </div>

          <div className="max-h-[560px] overflow-y-auto rounded-[10px] border border-borderSoft bg-white p-3">
            {outline.length > 0 ? (
              <nav className="space-y-1">
                {outline.map((item) => (
                  <button
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-primary ${item.level === 2 ? "ml-3" : item.level === 3 ? "ml-6" : ""}`}
                    key={item.id}
                    type="button"
                    onClick={() => jumpToHeading(item.order)}
                  >
                    <span className="mr-2 text-[11px] font-black text-primary">H{item.level}</span>
                    {item.text}
                  </button>
                ))}
              </nav>
            ) : (
              <div className="rounded-[10px] bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
                暂无大纲。使用 <code className="rounded bg-blue-50 px-1 text-primary">#</code>、<code className="rounded bg-blue-50 px-1 text-primary">##</code> 或 <code className="rounded bg-blue-50 px-1 text-primary">###</code> 添加标题后会自动生成。
              </div>
            )}
          </div>

          <div className="mt-3 grid gap-2 text-xs font-bold text-muted">
            <div className="rounded-[10px] bg-white px-3 py-2">分类：<span className="text-ink">{form.category}</span></div>
            <div className="rounded-[10px] bg-white px-3 py-2">状态：<span className="text-ink">{statusLabel[form.status]}</span></div>
            <div className="rounded-[10px] bg-white px-3 py-2">预计阅读：<span className="text-ink">{Math.max(2, Math.ceil(form.contentMarkdown.length / 460))} 分钟</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
