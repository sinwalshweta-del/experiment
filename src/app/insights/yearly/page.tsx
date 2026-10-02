"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { BarMeter } from "@/components/ui/BarMeter";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { AVAILABLE_YEARS, YEAR_SNAPSHOTS } from "@/lib/mockData/insights";
import { CATEGORY_META, ExperienceCategory } from "@/lib/types";

const COLOR_BY_SHORT_LABEL = Object.fromEntries(
  (Object.keys(CATEGORY_META) as ExperienceCategory[]).map((key) => [
    CATEGORY_META[key].short,
    CATEGORY_META[key].color,
  ])
);

function TextList({ items }: { items: string[] }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg font-medium leading-snug">
      {items.map((item, i) => (
        <span key={item}>
          {item}
          {i < items.length - 1 && <span className="text-line-strong"> /</span>}
        </span>
      ))}
    </p>
  );
}

export default function YearlyInsightsPage() {
  const [year, setYear] = useState(AVAILABLE_YEARS[0]);
  const snapshot = YEAR_SNAPSHOTS[year];

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>Yearly insights</SectionLabel>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[0.98] tracking-tight">
        GATHER {year}
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        A snapshot of human experiences this year.
      </p>

      <div className="mt-8 flex items-baseline gap-4 font-mono text-sm">
        {AVAILABLE_YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`pb-0.5 transition-colors ${
              year === y
                ? "border-b-2 border-pen text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {!snapshot.available ? (
        <div className="animate-rise-in mt-14 border-t border-line pt-10">
          <p className="font-display text-2xl font-bold">
            {year} is still being written.
          </p>
          <p className="mt-2 text-ink-soft">
            Come back once the year wraps — this space is ready for it.
          </p>
        </div>
      ) : (
        <div key={year} className="animate-rise-in mt-14 space-y-16">
          <SampleBadge>Sample / demo data</SampleBadge>

          <section className="-mx-5 bg-ink px-5 py-14 text-paper sm:-mx-8 sm:px-8 sm:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-paper/60">
              Total experiences
            </span>
            <div className="mt-3 font-display text-[clamp(3.5rem,12vw,7rem)] font-bold leading-[0.85] tracking-tight text-purple">
              {snapshot.totalExperiences.toLocaleString()}
            </div>
            <TallyMarks count={60} size="md" className="mt-6 text-purple" />
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">
              Most common relationship types
            </h2>
            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {snapshot.mostCommonRelationshipTypes.map((item, i) => (
                <BarMeter
                  key={item.label}
                  label={item.label}
                  pct={item.pct}
                  index={i}
                  color={COLOR_BY_SHORT_LABEL[item.label]}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-bold">
                Most discussed traits
              </h2>
              <div className="mt-4">
                <TextList items={snapshot.mostDiscussedTraits} />
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Most valued traits
              </h2>
              <div className="mt-4">
                <TextList items={snapshot.mostValuedTraits} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">
              Most common challenges
            </h2>
            <div className="mt-4">
              <TextList items={snapshot.mostCommonChallenges} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">
              Interesting patterns
            </h2>
            <ul className="mt-5 divide-y divide-line border-t border-line">
              {snapshot.patterns.map((pattern) => (
                <li
                  key={pattern}
                  className="py-4 text-sm leading-relaxed text-ink-soft"
                >
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
