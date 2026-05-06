import { Card } from "@/components/ui/Card";
import type { ImageTask } from "@/types/task";

export function BillingSummary({ task }: { task: ImageTask }) {
  const items = [
    { label: "预估积分", value: task.estimatedPoints, color: "text-slate-900" },
    { label: "冻结积分", value: task.frozenPoints, color: "text-amber-700" },
    { label: "消费积分", value: task.settledPoints, color: "text-primary" },
    { label: "返还积分", value: task.refundedPoints, color: "text-green-700" }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card className="min-w-0 shadow-none" key={item.label}>
          <div className="text-xs font-black uppercase tracking-wide text-muted">{item.label}</div>
          <div className={`mt-2 truncate text-2xl font-black ${item.color}`}>{item.value}</div>
        </Card>
      ))}
    </div>
  );
}
