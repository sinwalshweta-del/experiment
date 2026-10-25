"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";

/**
 * Header for the pages outside the landing (Insights, take-down), from the
 * approved Insights board: same lockup and nav as the landing page; the
 * current page gets a hot pink underline and nothing else. On phones the
 * links live behind a menu button that opens a full-screen charcoal sheet.
 */
const LINKS = [
  { href: "/insights", label: "Insights" },
  { href: "/#how", label: "How it works" },
];

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
      <path d="M3 10h13M11 4l6 6-6 6" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => href === pathname;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 lg:px-20 lg:pt-7">
      <Link href="/" aria-label="GATHER People Insights home" className="flex items-center gap-3 py-1 pr-2.5 text-brief-ink">
        <Mark size={32} className="sm:hidden" />
        <Mark size={40} className="hidden sm:grid" />
        <span className="flex flex-col gap-0.5 font-archivo leading-none sm:flex-row sm:items-baseline sm:gap-[0.3em]">
          <span className="text-[19px] font-black tracking-[-0.01em] [font-stretch:125%] sm:text-[20px]">GATHER</span>
          <span className="text-[13px] font-semibold sm:text-[20px]">People Insights</span>
        </span>
      </Link>

      {/* tablet and up */}
      <nav aria-label="Main" className="hidden items-center gap-3 border-2 border-brief-ink bg-brief-paper py-1 pl-4 pr-1.5 md:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="landing-navlink" aria-current={isActive(l.href) ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
        <Link href="/share" className="landing-btn min-h-[46px] whitespace-nowrap px-5 text-base">
          Share yours
        </Link>
      </nav>

      {/* phones */}
      <div className="flex items-center gap-2.5 md:hidden">
        <Link href="/share" className="landing-btn min-h-[44px] whitespace-nowrap px-3.5 text-[15px]">
          Share yours
        </Link>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          className="flex h-[46px] w-[46px] flex-col items-center justify-center gap-[5px] rounded border-2 border-brief-ink bg-brief-paper"
        >
          <span className="block h-[2.5px] w-5 bg-brief-ink" />
          <span className="block h-[2.5px] w-5 bg-brief-ink" />
          <span className="block h-[2.5px] w-5 bg-brief-ink" />
        </button>
      </div>

      {open && (
        <div id="site-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col bg-brief-ink px-4 pb-7 pt-[18px] text-brief-paper md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5" aria-label="GATHER People Insights home">
              <Mark size={32} />
              <span className="flex flex-col gap-0.5 font-archivo leading-none">
                <span className="text-[18px] font-black [font-stretch:125%]">GATHER</span>
                <span className="text-xs font-semibold">People Insights</span>
              </span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-[46px] w-[46px] items-center justify-center rounded border-2 border-brief-paper"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </div>
          <nav aria-label="Main" className="flex flex-col gap-3 pt-12">
            {[{ href: "/", label: "Home" }, ...LINKS].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="px-4 py-3.5 font-archivo text-[34px] font-black leading-none [font-stretch:125%] decoration-brief-rani decoration-4 underline-offset-[10px] aria-[current=page]:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-[18px]">
            <Link href="/share" onClick={() => setOpen(false)} className="landing-btn min-h-[58px] w-full bg-brief-paper shadow-[5px_5px_0_var(--color-brief-rani)]">
              Share yours <Arrow />
            </Link>
            <Link href="/take-down" onClick={() => setOpen(false)} className="text-center font-archivo text-[15px] underline underline-offset-[3px]">
              Take my story down
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
