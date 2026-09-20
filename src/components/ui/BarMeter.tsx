export function BarMeter({
  label,
  pct,
  index = 0,
  color = "coral",
}: {
  label: string;
  pct: number;
  index?: number;
  color?: "coral" | "moss" | "gold";
}) {
  const fill =
    color === "moss"
      ? "bg-moss"
      : color === "gold"
      ? "bg-gold"
      : "bg-coral";

  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-sm text-muted">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`animate-grow-bar h-full rounded-full ${fill}`}
          style={{
            width: `${pct}%`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      </div>
    </div>
  );
}
