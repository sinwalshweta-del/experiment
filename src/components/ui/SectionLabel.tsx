export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-xs uppercase tracking-[0.1em] text-muted ${className}`}
    >
      {children}
    </div>
  );
}
