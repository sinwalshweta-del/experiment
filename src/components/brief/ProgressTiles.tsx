/**
 * The 5 section tiles (the basics · how it went · in your words · about
 * you · check). Completed sections become quarter-circle tiles; the
 * current one fills with the world's accent.
 */
export function ProgressTiles({
  total = 5,
  current,
  className = "",
}: {
  total?: number;
  current: number;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-2 ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => {
        const index = i + 1;
        const completed = index < current;
        const isCurrent = index === current;
        return (
          <span
            key={index}
            aria-hidden
            className={`h-3.5 w-3.5 border-2 border-[var(--world-text)] transition-[border-radius,background-color] ${
              completed ? "rounded-br-full bg-[var(--world-text)]" : ""
            } ${isCurrent ? "bg-[var(--world-accent)]" : ""}`}
          />
        );
      })}
    </div>
  );
}
