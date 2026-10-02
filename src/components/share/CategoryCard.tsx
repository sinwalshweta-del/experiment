import { PopColor, POP_COLOR_STYLES } from "@/lib/colors";

export function CategoryCard({
  index,
  emoji,
  label,
  color,
  onClick,
}: {
  index: number;
  emoji: string;
  label: string;
  color: PopColor;
  onClick: () => void;
}) {
  const styles = POP_COLOR_STYLES[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-5 border-b border-line py-5 text-left transition-colors first:border-t hover:bg-paper-raised sm:py-6"
    >
      <span className="font-mono text-sm text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-2xl">{emoji}</span>
      <span className="flex-1 font-display text-xl font-bold sm:text-2xl">
        {label}
      </span>
      <span
        className={`text-xl transition-transform duration-200 group-hover:translate-x-1 ${styles.text}`}
        aria-hidden
      >
        &rarr;
      </span>
    </button>
  );
}
