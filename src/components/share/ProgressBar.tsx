export function ProgressBar({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label?: string;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {label ?? "Progress"}
        </span>
        <span className="font-mono text-xs text-muted">
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-signature transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
