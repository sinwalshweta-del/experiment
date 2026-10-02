"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { RankedList } from "@/components/insights/RankedList";
import { CATEGORY_INSIGHTS } from "@/lib/mockData/insights";
import { POP_COLOR_STYLES } from "@/lib/colors";

const KEYS = Object.keys(CATEGORY_INSIGHTS);

export default function ExplorePage() {
  const [active, setActive] = useState(KEYS[0]);
  const data = CATEGORY_INSIGHTS[active];

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>Explore</SectionLabel>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[0.98] tracking-tight">
        Explore by experience
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        Different relationships surface different patterns. Pick one to see
        what people are noticing.
      </p>

      <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {KEYS.map((key) => {
          const isActive = active === key;
          const tabStyles = POP_COLOR_STYLES[CATEGORY_INSIGHTS[key].color];
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`pb-0.5 text-lg font-medium transition-colors ${
                isActive
                  ? `border-b-2 ${tabStyles.border} text-ink`
                  : "text-muted hover:text-ink"
              }`}
            >
              {CATEGORY_INSIGHTS[key].label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <SampleBadge>Sample data</SampleBadge>
      </div>

      <div
        key={active}
        className="animate-rise-in mt-10 grid gap-10 border-t border-line pt-10 sm:grid-cols-2"
      >
        <RankedList title="Most valued" items={data.mostValued} />
        <RankedList title="Most common challenges" items={data.mostCommonChallenges} />
      </div>
    </div>
  );
}
