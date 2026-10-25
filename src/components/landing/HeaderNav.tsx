"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Landing header links. Active state is an underline only (hot pink, 4px,
 * normal text weight and colour); hover shows a faint ink underline.
 * "How it works" becomes active while its section is on screen.
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
      <Link href="/insights" className="landing-navlink hidden md:inline-block">
        Insights
      </Link>
      <a href="#how" className="landing-navlink hidden md:inline-block" aria-current={howActive ? "location" : undefined}>
        How it works
      </a>
    </>
  );
}
