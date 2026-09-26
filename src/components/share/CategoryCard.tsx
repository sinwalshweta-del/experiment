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
      className={`group flex flex-col items-start gap-4 rounded-3xl border p-6 text-left transition-all duration-200 hover:-translate-y-1 ${styles.border} ${styles.bgSoft} ${styles.shadowHover}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-raised text-2xl transition-transform duration-200 group-hover:scale-110">
        {emoji}
      </span>
      <span className="font-display text-xl font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
