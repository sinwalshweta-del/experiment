export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`brief-shadow-card rounded border-2 border-[var(--world-text)] bg-[var(--world-surface)] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
