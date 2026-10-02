"use client";

import { useEffect, useRef, useState } from "react";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { strokeW: number; strokeH: number; gap: number; groupGap: number }> = {
  sm: { strokeW: 2, strokeH: 14, gap: 3, groupGap: 9 },
  md: { strokeW: 3, strokeH: 36, gap: 5, groupGap: 18 },
  lg: { strokeW: 5, strokeH: 76, gap: 9, groupGap: 30 },
};

interface Mark {
  group: number;
  kind: "v" | "d";
  left: number;
  delay: number;
}

/**
 * The counting-tally motif: individual anonymous marks, grouped in
 * fives like a ledger, standing in for GATHER's actual mechanic —
 * one experience becomes one mark, marks accumulate into a reading.
 */
export function TallyMarks({
  count,
  size = "md",
  animate = true,
  className = "",
}: {
  count: number;
  size?: Size;
  animate?: boolean;
  className?: string;
}) {
  const { strokeW, strokeH, gap, groupGap } = SIZES[size];
  const groupCount = Math.max(0, Math.ceil(count / 5));
  const [visible, setVisible] = useState(!animate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  const groups: { width: number; marks: Mark[] }[] = [];
  let delayIndex = 0;
  for (let g = 0; g < groupCount; g++) {
    const remaining = count - g * 5;
    const verticals = Math.min(4, remaining);
    const hasDiagonal = remaining >= 5;
    const width = verticals * strokeW + Math.max(0, verticals - 1) * gap;
    const marks: Mark[] = [];
    for (let i = 0; i < verticals; i++) {
      marks.push({ group: g, kind: "v", left: i * (strokeW + gap), delay: delayIndex++ * 40 });
    }
    if (hasDiagonal) {
      marks.push({ group: g, kind: "d", left: -strokeW, delay: delayIndex++ * 40 });
    }
    groups.push({ width: width || strokeW, marks });
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={`flex flex-wrap items-end ${className}`}
      style={{ gap: groupGap }}
    >
      {groups.map((group, g) => (
        <div key={g} className="relative" style={{ width: group.width, height: strokeH }}>
          {group.marks.map((mark, i) =>
            mark.kind === "v" ? (
              <span
                key={i}
                className="absolute bottom-0 bg-current transition-transform duration-300 ease-out"
                style={{
                  left: mark.left,
                  width: strokeW,
                  height: strokeH,
                  transform: visible ? "scaleY(1)" : "scaleY(0)",
                  transformOrigin: "bottom",
                  transitionDelay: `${mark.delay}ms`,
                }}
              />
            ) : (
              <span
                key={i}
                className="absolute bg-current transition-transform duration-300 ease-out"
                style={{
                  left: mark.left,
                  bottom: strokeH * 0.16,
                  width: group.width + strokeW * 2,
                  height: strokeW,
                  transform: `rotate(-27deg) ${visible ? "scaleX(1)" : "scaleX(0)"}`,
                  transformOrigin: "left center",
                  transitionDelay: `${mark.delay}ms`,
                }}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}
