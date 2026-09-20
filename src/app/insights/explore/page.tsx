"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { RankedList } from "@/components/insights/RankedList";
import { CATEGORY_INSIGHTS } from "@/lib/mockData/insights";

const KEYS = Object.keys(CATEGORY_INSIGHTS);

export default function ExplorePage() {
  const [active, setActive] = useState(KEYS[0]);
  const data = CATEGORY_INSIGHTS[active];

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>Explore</SectionLabel>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Explore by experience
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        Different relationships surface different patterns. Pick one to see
        what people are noticing.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-150 ${
              active === key
                ? "border-ink bg-ink text-paper"
                : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {CATEGORY_INSIGHTS[key].label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <SampleBadge>Sample data</SampleBadge>
      </div>

      <div
        key={active}
        className="animate-rise-in mt-8 grid gap-10 rounded-3xl border border-line bg-paper-raised p-8 sm:grid-cols-2 sm:p-12"
      >
        <RankedList title="Most valued" items={data.mostValued} accent="moss" />
        <RankedList
          title="Most common challenges"
          items={data.mostCommonChallenges}
          accent="coral"
        />
      </div>
    </div>
  );
}
