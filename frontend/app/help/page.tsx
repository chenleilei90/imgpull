"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { errorCodes, helpArticles, helpCategories } from "@/lib/mock-data";

const tagTone: Record<string, "blue" | "green" | "cyan" | "amber" | "slate"> = {
  推荐: "blue",
  常见: "green",
  新增: "cyan"
};

export default function HelpPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const categories = useMemo(() => ["全部", ...helpCategories.filter((item) => item.status === "enabled").map((item) => item.name)], []);
  const showErrorCodes = category === "全部" || category === "错误排查" || keyword.trim().toLowerCase().includes("error") || keyword.includes("错误码");

  const visibleArticles = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return helpArticles.filter((article) => {
      if (article.status !== "published") return false;
      if (category !== "全部" && article.category !== category) return false;
      if (!lower) return true;
      return [article.title, article.summary, article.category, article.slug, ...article.tags].join(" ").toLowerCase().includes(lower);
    });
  }, [category, keyword]);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden rounded-panel border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-cyan-50/60 p-6 shadow-soft md:p-8">
        <div className="hero-grid absolute inset-0 opacity-35" />
        <div className="relative z-10 max-w-4xl">
          <div className="eyebrow">帮助中心</div>
          <h1 className="mt-4 text-[32px] font-black leading-tight text-ink md:text-[46px]">镜像同步文档中心</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
            查找镜像地址填写、私有仓库配置、任务失败处理和常见运行环境说明。错误码说明统一放在“错误排查”分类，不再作为独立入口分散展示。
          </p>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              className="input h-12 max-w-2xl flex-1"
              placeholder="搜索 Docker Hub、Harbor、ACR、错误码、积分返还"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <Button onClick={() => { setCategory("错误排查"); setKeyword(""); }} size="lg" variant="secondary">
              查看错误排查
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-3">
            <div className="mb-2 px-2 text-xs font-black uppercase tracking-wide text-muted">文档分类</div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {categories.map((item) => {
                const active = item === category;
                return (
                  <button
                    className={`whitespace-nowrap rounded-control px-3 py-2 text-left text-sm font-bold transition hover:bg-blue-50 hover:text-primary ${active ? "bg-blue-50 text-primary" : "text-slate-600"}`}
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                  >
                    {item}
                    {item === "错误排查" ? <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500" /> : null}
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-panel border border-borderSoft bg-white px-4 py-3 shadow-soft md:flex-row md:items-center">
            <div>
              <div className="text-sm font-black text-ink">{visibleArticles.length} 篇文档</div>
              <p className="mt-1 text-sm text-muted">按分类和关键词筛选，错误码、任务失败和仓库权限问题都从这里排查。</p>
            </div>
            {keyword || category !== "全部" ? (
              <Button variant="ghost" onClick={() => { setKeyword(""); setCategory("全部"); }}>清除筛选</Button>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-panel border border-borderSoft bg-white shadow-soft">
            {visibleArticles.length > 0 ? visibleArticles.map((article) => (
              <Link
                className="grid gap-3 border-b border-borderSoft px-4 py-4 transition hover:bg-blue-50/45 md:grid-cols-[1fr_140px_120px] md:items-center"
                href={`/help/articles/${article.slug}`}
                key={article.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-base font-black text-ink">{article.title}</h2>
                    {article.tags.slice(0, 2).map((tag) => <Badge key={tag} tone={tagTone[tag] ?? "slate"}>{tag}</Badge>)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{article.summary}</p>
                </div>
                <div className="text-sm font-bold text-slate-600">{article.category}</div>
                <div className="text-sm text-muted md:text-right">
                  <div>{article.updatedAt}</div>
                  <div className="mt-1">{article.readingMinutes} 分钟阅读</div>
                </div>
              </Link>
            )) : (
              <div className="p-10 text-center">
                <div className="text-lg font-black text-ink">没有找到匹配文档</div>
                <p className="mt-2 text-sm text-muted">请换一个关键词，或切换到全部分类查看。</p>
              </div>
            )}
          </div>

          {showErrorCodes ? (
            <div className="rounded-panel border border-amber-200 bg-amber-50 p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="m-0 text-lg font-black text-ink">错误码速查</h2>
                  <p className="mt-1 text-sm text-muted">错误码作为帮助文档内容展示，后续由管理员在帮助文档中维护。</p>
                </div>
                <Badge tone="amber">{errorCodes.length} 个错误码</Badge>
              </div>
              <div className="mt-4 grid gap-2">
                {errorCodes.map((item) => (
                  <div className="grid gap-2 rounded-[10px] border border-borderSoft bg-white p-3 text-sm md:grid-cols-[220px_1fr_1.4fr]" key={item.code}>
                    <code className="whitespace-nowrap font-black text-primary">{item.code}</code>
                    <span className="font-bold text-ink">{item.meaning}</span>
                    <span className="text-muted">{item.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}
