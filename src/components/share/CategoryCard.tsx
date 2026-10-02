import { PopColor, POP_COLOR_STYLES } from "@/lib/colors";

export function CategoryCard({
  emoji,
  label,
  color,
  onClick,
}: {
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
      className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-5 text-left transition-all duration-200 hover:translate-x-1 sm:px-6 sm:py-6 ${styles.border} ${styles.bgSoft} ${styles.shadowHover}`}
    >
      <span className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-raised text-2xl">
          {emoji}
        </span>
        <span className="font-display text-xl font-medium leading-tight sm:text-2xl">
          {label}
        </span>
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
