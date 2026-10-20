import { GatherPoint } from "./GatherPoint";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex flex-col gap-4 border-t-2 border-[var(--world-text)] px-5 py-8 text-[var(--world-text)] sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-3">
        <GatherPoint size={22} />
        <span className="font-martian-mono text-xs uppercase tracking-[0.08em] text-[var(--world-muted)]">
          gather
        </span>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 font-archivo text-sm font-semibold lowercase">
        <a href="#" className="hover:underline">
          guidelines
        </a>
        <a href="#" className="hover:underline">
          privacy
        </a>
        <a href="#" className="hover:underline">
          how it works
        </a>
      </nav>
    </footer>
  );
}
