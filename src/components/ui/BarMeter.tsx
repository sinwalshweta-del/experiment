export function BarMeter({
  label,
  pct,
  index = 0,
}: {
  label: string;
  pct: number;
  index?: number;
}) {
  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-sm text-muted">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="animate-grow-bar h-full rounded-full bg-ink"
          style={{
            width: `${pct}%`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      </div>
    </div>
  );
}
