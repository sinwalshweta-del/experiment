export function CategoryCard({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-4 rounded-3xl border border-line-strong bg-paper-raised p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:shadow-[0_12px_0_0_var(--color-line)] active:translate-y-0 active:shadow-none"
    >
      <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
        {emoji}
      </span>
      <span className="font-display text-xl font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
