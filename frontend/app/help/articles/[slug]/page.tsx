import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownPreview } from "@/components/business/MarkdownPreview";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { helpArticles } from "@/lib/mock-data";

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = helpArticles.find((item) => item.slug === slug && item.status === "published");

  if (!article) notFound();

  const related = helpArticles
    .filter((item) => item.status === "published" && item.category === article.category && item.slug !== article.slug)
    .slice(0, 3);

  return (
    <PublicLayout>
      <div className="mb-5">
        <Link className="text-sm font-bold text-primary hover:underline" href="/help">返回帮助中心</Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="rounded-panel border border-borderSoft bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{article.category}</Badge>
            {article.tags.map((tag) => <Badge key={tag} tone="slate">{tag}</Badge>)}
          </div>
          <h1 className="mt-5 text-[30px] font-black leading-tight text-ink md:text-[42px]">{article.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{article.summary}</p>
          <div className="mt-4 flex flex-wrap gap-4 border-b border-borderSoft pb-5 text-sm font-bold text-muted">
            <span>更新时间：{article.updatedAt}</span>
            <span>{article.readingMinutes} 分钟阅读</span>
            <span>当前为前端演示文档</span>
          </div>
          <div className="mt-6">
            <MarkdownPreview content={article.contentMarkdown} />
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="文章信息" description="帮助内容由后台 Markdown 文档管理维护，当前页面使用示例数据渲染。" />
            <div className="space-y-3 text-sm font-bold text-slate-600">
              <div className="flex justify-between gap-3"><span>分类</span><span className="text-right text-ink">{article.category}</span></div>
              <div className="flex justify-between gap-3"><span>Slug</span><code className="text-right text-primary">{article.slug}</code></div>
              <div className="flex justify-between gap-3"><span>状态</span><span className="text-right text-green-700">已发布</span></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="相关文章" />
            <div className="space-y-3">
              {related.length > 0 ? related.map((item) => (
                <Link className="block rounded-[10px] border border-borderSoft bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50" href={`/help/articles/${item.slug}`} key={item.id}>
                  <div className="text-sm font-black text-ink">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-muted">{item.summary}</div>
                </Link>
              )) : <p className="text-sm leading-7 text-muted">暂无同分类文章，可以返回帮助中心查看全部文档。</p>}
            </div>
          </Card>
        </aside>
      </section>
    </PublicLayout>
  );
}
