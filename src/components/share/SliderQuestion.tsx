"use client";

function reaction(value: number) {
  if (value <= 20) return "😬";
  if (value <= 40) return "😐";
  if (value <= 60) return "🙂";
  if (value <= 80) return "😊";
  return "🤩";
}

export function SliderQuestion({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  const clamped = Math.min(96, Math.max(4, value));

  return (
    <div className="pt-12">
      <div className="relative mb-4 h-12">
        <div
          className="absolute -top-1 flex -translate-x-1/2 flex-col items-center transition-[left] duration-100"
          style={{ left: `${clamped}%` }}
        >
          <span className="text-3xl leading-none">{reaction(value)}</span>
          <span className="mt-1.5 font-mono text-xs text-muted">{value}</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="gather-slider"
        aria-label={`${lowLabel} to ${highLabel}`}
      />
      <div className="mt-4 flex items-center justify-between text-base font-medium text-ink-soft">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
