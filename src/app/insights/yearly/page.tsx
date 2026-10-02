"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { BarMeter } from "@/components/ui/BarMeter";
import { AVAILABLE_YEARS, YEAR_SNAPSHOTS } from "@/lib/mockData/insights";
import { POP_COLOR_STYLES, popColorForIndex } from "@/lib/colors";

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => {
        const styles = POP_COLOR_STYLES[popColorForIndex(i)];
        return (
          <span
            key={item}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium text-ink ${styles.border} ${styles.bgSoft}`}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

export default function YearlyInsightsPage() {
  const [year, setYear] = useState(AVAILABLE_YEARS[0]);
  const snapshot = YEAR_SNAPSHOTS[year];

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>Yearly insights</SectionLabel>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-medium leading-[1.02] tracking-tight">
        GATHER {year}
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        A snapshot of human experiences this year.
      </p>

      <div className="mt-10 flex gap-2">
        {AVAILABLE_YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`rounded-full border px-5 py-2.5 font-mono text-sm font-medium transition-all duration-150 ${
              year === y
                ? "border-signature bg-signature text-paper"
                : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {!snapshot.available ? (
        <div className="animate-rise-in mt-10 rounded-3xl border border-dashed border-line-strong bg-paper-raised p-12 text-center">
          <p className="font-display text-2xl font-medium">
            {year} is still being written.
          </p>
          <p className="mt-2 text-ink-soft">
            Come back once the year wraps — this space is ready for it.
          </p>
        </div>
      ) : (
        <div key={year} className="animate-rise-in mt-10 space-y-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SampleBadge>Sample / demo data</SampleBadge>
          </div>

          <section className="rounded-3xl bg-ink p-8 text-paper sm:p-10">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-paper/60">
              Total experiences
            </span>
            <div className="mt-3 font-display text-6xl font-semibold tracking-tight text-highlight sm:text-7xl">
              {snapshot.totalExperiences.toLocaleString()}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium">
              Most common relationship types
            </h2>
            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {snapshot.mostCommonRelationshipTypes.map((item, i) => (
                <BarMeter key={item.label} label={item.label} pct={item.pct} index={i} />
              ))}
            </div>
          </section>

          <section className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-medium">
                Most discussed traits
              </h2>
              <div className="mt-4">
                <TagList items={snapshot.mostDiscussedTraits} />
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-medium">
                Most valued traits
              </h2>
              <div className="mt-4">
                <TagList items={snapshot.mostValuedTraits} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium">
              Most common challenges
            </h2>
            <div className="mt-4">
              <TagList items={snapshot.mostCommonChallenges} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium">
              Interesting patterns
            </h2>
            <ul className="mt-5 space-y-4">
              {snapshot.patterns.map((pattern, i) => (
                <li
                  key={pattern}
                  className="flex gap-3 rounded-2xl border border-line bg-paper-raised p-5 text-sm leading-relaxed text-ink-soft"
                >
                  <span className={POP_COLOR_STYLES[popColorForIndex(i)].text}>
                    &bull;
                  </span>
                  {pattern}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
