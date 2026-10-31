"use client";

import { usePathname } from "next/navigation";

/**
 * The landing page at "/" carries its own header and footer (approved
 * Claude Design board), so the app-wide Nav and Footer step aside there.
 * Every other route keeps them unchanged.
 */
export function HideOnHome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // these routes carry the new GATHER header and footer (approved boards)
  if (pathname === "/" || pathname === "/insights" || pathname.startsWith("/take-down") || pathname.startsWith("/share") || pathname === "/sign-in" || pathname === "/review" || pathname === "/privacy") return null;
  return <>{children}</>;
}
