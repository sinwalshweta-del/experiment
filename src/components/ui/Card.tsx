export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-line bg-paper-raised ${className}`}
    >
      {children}
    </div>
  );
}
