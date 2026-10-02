export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-signature" />
      {children}
    </div>
  );
}
