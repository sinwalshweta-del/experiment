import Link from "next/link";
import { Mark } from "./Mark";

/** Footer shared by the landing, Insights and take-down pages (approved boards). */
export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-5 bg-brief-ink px-4 py-9 text-brief-paper sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-20">
      <span role="img" aria-label="GATHER" className="text-brief-paper">
        <Mark size={32} />
      </span>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
        <Link href="/privacy" className="inline-flex min-h-11 items-center font-archivo text-[15px] underline underline-offset-[3px]">
          Privacy
        </Link>
        <Link href="/take-down" className="inline-flex min-h-11 items-center font-archivo text-[15px] underline underline-offset-[3px]">
          Take my story down
        </Link>
        <span className="font-martian-mono text-xs font-semibold leading-[18px] tracking-[0.04em] text-[#B4ACBA]">
          © 2026 GATHER
        </span>
      </div>
    </footer>
  );
}
