import { GatherPoint } from "./GatherPoint";

export function Nav({ className = "" }: { className?: string }) {
  return (
    <header
      className={`flex items-center justify-between border-b-2 border-[var(--world-text)] px-5 py-4 text-[var(--world-text)] ${className}`}
    >
      <GatherPoint size={28} />
      <nav className="flex items-center gap-6 font-archivo text-[15px] font-semibold lowercase">
        <a href="#" className="hover:underline">
          share yours
        </a>
        <a href="#" className="hover:underline">
          insights
        </a>
        <a href="#" className="hover:underline">
          how it works
        </a>
      </nav>
    </header>
  );
}
