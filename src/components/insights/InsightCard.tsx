import { POP_COLOR_STYLES, popColorForIndex } from "@/lib/colors";

export function InsightCard({
  title,
  body,
  index = 0,
}: {
  title: string;
  body: string;
  index?: number;
}) {
  const styles = POP_COLOR_STYLES[popColorForIndex(index)];

  return (
    <div
      className={`animate-rise-in rounded-3xl border-2 border-line bg-paper-raised p-6 transition-colors duration-150 hover:border-ink`}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-[0.65rem] font-bold ${styles.bgSolid} ${styles.onSolid}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
