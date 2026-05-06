export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-panel border border-borderSoft bg-white p-4 shadow-soft transition duration-150 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-panel">
      <div className="text-xs font-black uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-[28px] font-black leading-none text-ink">{value}</div>
      <div className="mt-2 text-xs font-semibold leading-5 text-muted">{hint}</div>
    </div>
  );
}
