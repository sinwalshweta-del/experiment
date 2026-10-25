"use client";

import { useEffect } from "react";

/**
 * Scroll parallax for the landing page (approved Claude Design motion board).
 *
 * Mark an element with data-px="<px>": while its section crosses the
 * viewport it travels from +px (section entering at the bottom) to -px
 * (leaving at the top), so it moves at a slightly different speed from the
 * page. Three depths are used: background shapes ±120, visual columns ±46,
 * text ±14 — so reading never wobbles.
 *
 * data-px-top="<factor>" is for the header blobs: they drift by
 * scrollY × factor during the first screen.
 *
 * Uses the CSS `translate` property only, so it composes with rotate
 * utilities and the reveal transform, and never shifts layout. Amplitudes
 * are halved on phones; everything is off with reduced motion.
 */
export function Parallax({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-px],[data-px-top]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const scale = window.innerWidth < 768 ? 0.5 : 1;
      for (const el of els) {
        const top = el.dataset.pxTop;
        if (top !== undefined) {
          const y = Math.min(window.scrollY, vh) * parseFloat(top) * scale;
          el.style.translate = `0 ${y.toFixed(1)}px`;
          continue;
        }
        const scope = el.closest("section") ?? el;
        const r = scope.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue; // off screen: leave it
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const a = parseFloat(el.dataset.px ?? "0") * scale;
        el.style.translate = `0 ${(a * (1 - 2 * p)).toFixed(1)}px`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const clear = () => els.forEach((el) => (el.style.translate = ""));

    const start = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      clear();
    };
    const onPref = () => (reduce.matches ? stop() : start());

    if (!reduce.matches) start();
    reduce.addEventListener("change", onPref);
    return () => {
      reduce.removeEventListener("change", onPref);
      stop();
    };
  }, [rootId]);

  return null;
}
