export function SampleBadge({ children = "Sample data" }: { children?: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">
      {children}
    </span>
  );
}
