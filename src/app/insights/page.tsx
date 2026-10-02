"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { LinkButton } from "@/components/ui/Button";
import {
  CURRENT_YEAR,
  INSIGHT_CARDS,
  SAMPLE_TOTAL_EXPERIENCES,
  WHAT_PEOPLE_VALUE,
  YEAR_SNAPSHOTS,
} from "@/lib/mockData/insights";
import { useLiveTotal } from "@/lib/hooks/useLiveTotal";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%
const mostValued = WHAT_PEOPLE_VALUE.slice(0, 4).map((s) => s.trait);
const mostDiscussed = YEAR_SNAPSHOTS[CURRENT_YEAR].mostDiscussedTraits.slice(0, 4);
const surprise = INSIGHT_CARDS[1]; // "Consistency > grand gestures."

function RankedEditorialList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ol className="mt-6 space-y-5">
        {items.map((item, i) => (
          <li key={item} className="flex items-baseline gap-4">
            <span className="font-display text-3xl font-medium leading-none text-line sm:text-4xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-xl font-medium sm:text-2xl">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function InsightsPage() {
  const total = useLiveTotal(SAMPLE_TOTAL_EXPERIENCES);

  return (
    <div>
      <section className="px-5 pb-14 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Human Insights</SectionLabel>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-[1] tracking-tight">
            Human Insights
          </h1>
          <p className="mt-3 max-w-xl text-lg text-ink-soft">
            What are people experiencing right now?
          </p>
        </div>
      </section>

      {/* This year — full-bleed, light */}
      <section className="border-y border-line bg-paper-raised px-5 py-14 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <span className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
              {CURRENT_YEAR}
            </span>
            <span className="font-mono text-2xl text-signature sm:text-3xl">
              {total.toLocaleString()}
            </span>
            <span className="pb-2 text-sm text-muted">experiences shared</span>
          </div>
          <SampleBadge>Illustrative, not live data</SampleBadge>
        </div>
      </section>

      {/* What we're hearing — full-bleed, dark claim + proof */}
      <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-paper/60">
            <span className="h-1.5 w-1.5 rounded-full bg-signature" />
            What we&rsquo;re hearing
          </span>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <p className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
              {headlineStat.trait} keeps coming up.
            </p>
            <div>
              <div className="font-display text-[clamp(5rem,13vw,9rem)] font-semibold leading-none text-highlight">
                {headlineStat.pct}
                <span className="text-[0.4em] align-top">%</span>
              </div>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/60">
                of experiences mentioned {headlineStat.trait.toLowerCase()}{" "}
                as an important factor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Most valued / most discussed — editorial rankings */}
      <section className="border-b border-line bg-paper px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-14 sm:grid-cols-2 sm:gap-10">
          <RankedEditorialList title="Most valued" items={mostValued} />
          <RankedEditorialList title="Most discussed" items={mostDiscussed} />
        </div>
      </section>

      {/* What surprised us — pull quote */}
      <section className="bg-signature-soft px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>What surprised us</SectionLabel>
          <p className="mt-6 font-display text-3xl font-medium italic leading-snug sm:text-4xl">
            {surprise.title}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            {surprise.body}
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
          <LinkButton href="/insights/explore" size="lg">
            Explore by experience type
          </LinkButton>
          <LinkButton href="/insights/yearly" variant="secondary" size="lg">
            See the {CURRENT_YEAR} snapshot
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
