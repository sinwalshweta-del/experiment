export function SampleBadge({ children = "Sample data" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-raised px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
      <span className="h-1 w-1 rounded-full bg-gold" />
      {children}
    </span>
  );
}
