"use client";

import { useEffect } from "react";

/**
 * Gentle rise-in for landing sections. On mount it finds the direct
 * children of every section below the hero, hides only the ones that are
 * still below the fold (so nothing visible ever flickers), and reveals
 * each as it scrolls into view. Without JS, or with reduced motion,
 * everything simply stays visible.
 */
export function RevealOnScroll({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("section[data-reveal]"));
    const targets: HTMLElement[] = [];
    sections.forEach((section) => {
      const kids = Array.from(section.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute("aria-hidden"),
      );
      kids.forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
        el.style.setProperty("--reveal-delay", `${Math.min(i, 4) * 90}ms`);
        el.classList.add("landing-reveal");
        targets.push(el);
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [rootId]);

  return null;
}
