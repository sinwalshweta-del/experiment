export type World = "basics" | "rant" | "grateful";

/**
 * Wraps a section in one of the brief's three worlds. Q1's answer picks
 * the world; everything inside reads --world-* custom properties rather
 * than fixed colors, so the same components work in all three.
 */
export function WorldProvider({
  world,
  className = "",
  children,
}: {
  world: World;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`world-${world} bg-[var(--world-bg)] text-[var(--world-text)] ${className}`}>
      {children}
    </div>
  );
}
