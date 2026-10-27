"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Landing header links (Claude Design board 19). Active state: bold text plus
 * a 6px hot pink underline, nothing else; hover shows a faint ink underline.
 * "How it works" becomes active while its section is on screen. "Sign in"
 * sits quietly before the only button; on phones it stays as a small link.
 */
export function HeaderNav() {
  const [howActive, setHowActive] = useState(false);

  useEffect(() => {
    const how = document.getElementById("how");
    if (!how || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setHowActive(e.isIntersecting), {
      rootMargin: "-40% 0px -40% 0px",
    });
    io.observe(how);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Link href="/insights" data-label="Insights" className="landing-navlink hidden md:inline-flex">
        Insights
      </Link>
      <a href="#how" data-label="How it works" className="landing-navlink hidden md:inline-flex" aria-current={howActive ? "location" : undefined}>
        How it works
      </a>
      <span aria-hidden className="landing-navsep hidden md:block" />
      <Link href="/sign-in" data-label="Sign in" className="landing-navlink landing-navlink-quiet max-sm:px-1.5 max-sm:text-[15px] max-[349px]:hidden">
        Sign in
      </Link>
    </>
  );
}
