/**
 * Static Gather Point: four quarter-discs touching, exactly as on the
 * boards. `build` animates the quarters in from apart once on load.
 */
const QUARTERS = ["rounded-br-full", "rounded-bl-full", "rounded-tr-full", "rounded-tl-full"];
// where each quarter starts when the mark builds itself on load
const BUILD_FROM = [
  ["-35%", "-35%"],
  ["35%", "-35%"],
  ["-35%", "35%"],
  ["35%", "35%"],
];

export function Mark({ size, className = "", build = false }: { size: number; className?: string; build?: boolean }) {
  return (
    <span aria-hidden className={`grid shrink-0 grid-cols-2 grid-rows-2 ${className}`} style={{ width: size, height: size }}>
      {QUARTERS.map((q, i) => (
        <span
          key={q}
          className={`bg-current ${q} ${build ? "landing-mark-build" : ""}`}
          style={build ? ({ "--mx": BUILD_FROM[i][0], "--my": BUILD_FROM[i][1] } as React.CSSProperties) : undefined}
        />
      ))}
    </span>
  );
}
