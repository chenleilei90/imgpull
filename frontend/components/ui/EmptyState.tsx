import { Button } from "@/components/ui/Button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionText
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="rounded-panel border border-dashed border-blue-200 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[10px] bg-blue-50 text-lg font-black text-primary">IP</div>
      <h3 className="mb-2 text-lg font-black">{title}</h3>
      <p className="mx-auto mb-4 max-w-xl text-sm leading-7 text-muted">{description}</p>
      {actionHref && actionText ? <Button href={actionHref} variant="primary">{actionText}</Button> : null}
    </div>
  );
}
