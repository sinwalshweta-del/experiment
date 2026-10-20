"use client";

/**
 * Selectable option tile. Selected: accent fill, shadow drops from 4px to
 * 2px, nudges 2px toward the shadow, and the marker square's facing
 * corner becomes a quarter-circle (same shape language as the Gather
 * Point mark and the progress tiles).
 */
export function Chip({
  label,
  selected = false,
  onClick,
  className = "",
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 rounded border-2 border-[var(--world-text)] px-4 py-3.5 font-archivo text-[15px] font-semibold lowercase outline-none transition-[transform,box-shadow] duration-100 ease-out focus-visible:ring-[3px] focus-visible:ring-[var(--world-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--world-bg)] ${
        selected
          ? "translate-x-[2px] translate-y-[2px] bg-[var(--world-accent)] text-[var(--world-accent-text)] shadow-[2px_2px_0_var(--world-shadow)]"
          : "brief-shadow-control bg-[var(--world-surface)] text-[var(--world-text)]"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`h-2.5 w-2.5 shrink-0 border-2 border-current transition-[border-radius] duration-100 ${
          selected ? "rounded-br-full" : ""
        }`}
      />
      {label}
    </button>
  );
}
