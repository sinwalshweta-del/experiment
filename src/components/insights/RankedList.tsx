import { PopColor, POP_COLOR_STYLES } from "@/lib/colors";

export function RankedList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: PopColor;
}) {
  const styles = POP_COLOR_STYLES[color];

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-base font-semibold ${styles.bgSolid} ${styles.onSolid}`}
            >
              {i + 1}
            </span>
            <span className="text-base text-ink">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
