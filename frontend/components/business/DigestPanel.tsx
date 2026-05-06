import { CodeBlock } from "@/components/ui/CodeBlock";
import type { ImageTask } from "@/types/task";

export function DigestPanel({ task }: { task: ImageTask }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-[10px] border border-borderSoft bg-slate-50 p-4">
        {[
          ["source digest", task.sourceDigest],
          ["source manifest digest", task.sourceManifestDigest],
          ["target digest", task.targetDigest],
          ["target manifest digest", task.targetManifestDigest]
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 break-all font-mono text-sm text-slate-800">{value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <CodeBlock code={task.tagPullCommand} label="tag pull 命令" />
        <CodeBlock code={task.digestPullCommand} label="digest pull 命令" />
      </div>
    </div>
  );
}
