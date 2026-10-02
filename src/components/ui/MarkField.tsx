"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PopColor, POP_COLOR_STYLES } from "@/lib/colors";

// Deterministic PRNG so the field renders identically on server and client
// (no hydration mismatch) while still looking hand-scattered, not gridded.
function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed regions each category drifts around once a field is weighted, so
// color reads as clustering patterns rather than salt-and-pepper noise.
const CLUSTER_CENTERS: Record<PopColor, { x: number; y: number }> = {
  pink: { x: 22, y: 32 },
  purple: { x: 74, y: 26 },
  lime: { x: 34, y: 74 },
  tangerine: { x: 80, y: 70 },
  ink: { x: 50, y: 50 },
};

interface Mark {
  x: number;
  y: number;
  rotation: number;
  length: number;
  delay: number;
  colorClass: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * GATHER's core visual device: individual anonymous marks accumulating
 * into a field. With no `weights`, marks scatter evenly across the whole
 * area (many unrelated experiences). With `weights`, marks drift toward
 * per-category cluster centers (the patterns those experiences form).
 */
export function MarkField({
  seed,
  count,
  weights,
  className = "",
}: {
  seed: number;
  count: number;
  weights?: Partial<Record<PopColor, number>>;
  className?: string;
}) {
  const marks = useMemo<Mark[]>(() => {
    const rand = mulberry32(seed);
    const clustered = !!weights && Object.keys(weights).length > 0;
    const colorPool: PopColor[] = clustered
      ? Object.entries(weights!).flatMap(([color, n]) =>
          Array.from({ length: Math.max(1, Math.round(n ?? 0)) }, () => color as PopColor)
        )
      : ["ink"];

    return Array.from({ length: count }, () => {
      const color = colorPool[Math.floor(rand() * colorPool.length)];
      let x: number;
      let y: number;
      if (clustered) {
        const center = CLUSTER_CENTERS[color];
        x = clamp(center.x + (rand() - 0.5) * 56, 3, 97);
        y = clamp(center.y + (rand() - 0.5) * 56, 4, 96);
      } else {
        x = rand() * 92 + 4;
        y = rand() * 88 + 6;
      }
      return {
        x,
        y,
        rotation: rand() * 50 - 25,
        length: 12 + rand() * 18,
        delay: Math.floor(rand() * 600),
        colorClass: color === "ink" ? "text-ink" : POP_COLOR_STYLES[color].text,
      };
    });
  }, [seed, count, weights]);

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className={`relative h-full w-full ${className}`}>
      {marks.map((mark, i) => (
        <span
          key={i}
          className={`absolute bg-current ${mark.colorClass} transition-all duration-500 ease-out`}
          style={{
            left: `${mark.x}%`,
            top: `${mark.y}%`,
            width: 2,
            height: mark.length,
            transform: `translate(-50%, -50%) rotate(${mark.rotation}deg) scaleY(${visible ? 1 : 0})`,
            opacity: visible ? 1 : 0,
            transitionDelay: `${mark.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
