export function ChipGroup({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div
      className={`grid gap-2.5 ${
        columns === 2 ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`border px-5 py-4 text-left text-base font-medium transition-all duration-150 active:scale-[0.98] ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-line-strong text-ink hover:border-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
