export function InsightCard({
  title,
  body,
  index = 0,
}: {
  title: string;
  body: string;
  index?: number;
}) {
  return (
    <div className="animate-rise-in rounded-3xl border border-line bg-paper-raised p-6 transition-colors hover:border-ink-soft">
      <span className="font-mono text-xs text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
