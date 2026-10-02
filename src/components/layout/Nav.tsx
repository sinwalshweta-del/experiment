"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";

const LINKS = [
  { href: "/insights/explore", label: "Explore" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-5xl rounded-full border border-line bg-paper-raised/95 shadow-[0_1px_0_0_rgba(22,20,15,0.04)] backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            GATHER
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) => {
              const active =
                link.href === "/insights"
                  ? pathname === "/insights"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-ink ${
                    active ? "text-ink" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <LinkButton href="/share" size="md">
              Share Experience
            </LinkButton>
          </nav>

          <button
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-[1.5px] w-5 bg-ink transition-transform ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-5 bg-ink transition-transform ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <LinkButton href="/share" className="mt-2 justify-center">
              Share Experience
            </LinkButton>
          </nav>
        )}
      </div>
    </header>
  );
}
