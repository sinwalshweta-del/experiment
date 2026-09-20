export function RankedList({
  title,
  items,
  accent = "coral",
}: {
  title: string;
  items: string[];
  accent?: "coral" | "moss";
}) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-baseline gap-3">
            <span
              className={`font-display text-2xl font-medium leading-none ${
                accent === "moss" ? "text-moss" : "text-coral"
              }`}
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
