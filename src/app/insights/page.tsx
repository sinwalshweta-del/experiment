"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { LinkButton } from "@/components/ui/Button";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { RankedList } from "@/components/insights/RankedList";
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

export default function InsightsPage() {
  const total = useLiveTotal(SAMPLE_TOTAL_EXPERIENCES);

  return (
    <div>
      <section className="px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Human Insights</SectionLabel>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[0.98] tracking-tight">
            What people are experiencing right now.
          </h1>
        </div>
      </section>

      {/* This year, told in marks */}
      <section className="border-t border-line px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              {CURRENT_YEAR}
            </span>
            <SampleBadge>Illustrative, not live data</SampleBadge>
          </div>
          <TallyMarks count={60} size="md" className="mt-8 text-ink" />
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-muted">
            {total.toLocaleString()} experiences shared
          </p>
        </div>
      </section>

      {/* The claim */}
      <section className="border-t border-line px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
            {headlineStat.trait} keeps coming up.
          </p>
          <div className="relative mt-4">
            <div className="font-display text-[clamp(6rem,16vw,11rem)] font-bold leading-[0.85] text-pen">
              {headlineStat.pct}
              <span className="text-[0.35em] align-top">%</span>
            </div>
            <TallyMarks
              count={headlineStat.pct}
              size="md"
              className="mt-2 text-ink sm:-mt-10"
            />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            of experiences mentioned {headlineStat.trait.toLowerCase()} as
            an important factor. Sample data — not live.
          </p>
        </div>
      </section>

      {/* Most valued / most discussed — editorial rankings */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-14 sm:grid-cols-2 sm:gap-10">
          <RankedList title="Most valued" items={mostValued} />
          <RankedList title="Most discussed" items={mostDiscussed} />
        </div>
      </section>

      {/* What surprised us — a quiet editorial aside */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>What surprised us</SectionLabel>
          <p className="font-editorial mt-6 text-3xl leading-snug sm:text-4xl">
            {surprise.title}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            {surprise.body}
          </p>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
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
