import { PopColor, POP_COLOR_STYLES, popColorForIndex } from "@/lib/colors";

export function BarMeter({
  label,
  pct,
  index = 0,
  color,
}: {
  label: string;
  pct: number;
  index?: number;
  color?: PopColor;
}) {
  const fill = POP_COLOR_STYLES[color ?? popColorForIndex(index)].bgSolid;

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
