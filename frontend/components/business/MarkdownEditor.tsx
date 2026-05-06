"use client";

import dynamic from "next/dynamic";

const MdxEditorClient = dynamic(
  () => import("@/components/business/MdxEditorClient").then((mod) => mod.MdxEditorClient),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-[360px] place-items-center rounded-panel border border-borderSoft bg-slate-50 text-sm font-bold text-muted">
        正在加载 Markdown 编辑器...
      </div>
    )
  }
);

export function MarkdownEditor({
  markdown,
  onChange
}: {
  markdown: string;
  onChange: (markdown: string) => void;
}) {
  return <MdxEditorClient markdown={markdown} onChange={onChange} />;
}
