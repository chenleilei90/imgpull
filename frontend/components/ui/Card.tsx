export function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`min-w-0 rounded-panel border border-borderSoft bg-white p-5 shadow-soft transition duration-150 ease-out hover:border-blue-200 hover:shadow-panel ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  description,
  action,
  eyebrow
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 text-xs font-black uppercase tracking-wide text-primary">{eyebrow}</div> : null}
        <h2 className="m-0 text-lg font-black tracking-normal text-ink">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
