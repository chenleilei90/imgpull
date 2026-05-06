export function Tabs({ items }: { items: Array<{ label: string; active?: boolean }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className={`inline-flex h-10 items-center rounded-control border px-4 text-sm font-extrabold transition ${
            item.active ? "border-blue-200 bg-blue-50 text-primary" : "border-borderSoft bg-white text-slate-600"
          }`}
          key={item.label}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}
