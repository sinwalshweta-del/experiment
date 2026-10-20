const QUADRANTS = [
  { corner: "rounded-br-full", x: "-10px", y: "-10px", r: "-12deg" },
  { corner: "rounded-bl-full", x: "10px", y: "-10px", r: "12deg" },
  { corner: "rounded-tr-full", x: "-10px", y: "10px", r: "12deg" },
  { corner: "rounded-tl-full", x: "10px", y: "10px", r: "-12deg" },
] as const;

/**
 * The Gather Point mark: four quarter-discs, each facing the center, that
 * snap into the closed mark on mount. Color comes from currentColor, so
 * wrap it in an element with the text color you want.
 */
export function GatherPoint({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 grid-rows-2 gap-[2px] ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="GATHER"
    >
      {QUADRANTS.map((q, i) => (
        <span
          key={i}
          className={`gather-point-quadrant bg-current ${q.corner}`}
          style={{ "--gp-x": q.x, "--gp-y": q.y, "--gp-r": q.r } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
