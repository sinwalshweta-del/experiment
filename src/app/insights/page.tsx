"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { LinkButton } from "@/components/ui/Button";
import { MarkField } from "@/components/ui/MarkField";
import { RankedList } from "@/components/insights/RankedList";
import {
  CURRENT_YEAR,
  INSIGHT_CARDS,
  SAMPLE_TOTAL_EXPERIENCES,
  WHAT_PEOPLE_VALUE,
  YEAR_SNAPSHOTS,
} from "@/lib/mockData/insights";
import { relationshipColorWeights } from "@/lib/markFieldWeights";
import { POP_COLOR_STYLES } from "@/lib/colors";
import { CATEGORY_META } from "@/lib/types";
import { useLiveTotal } from "@/lib/hooks/useLiveTotal";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%
const mostValued = WHAT_PEOPLE_VALUE.slice(0, 4).map((s) => s.trait);
const mostDiscussed = YEAR_SNAPSHOTS[CURRENT_YEAR].mostDiscussedTraits.slice(0, 4);
const surprise = INSIGHT_CARDS[1]; // "Consistency > grand gestures."
const patternWeights = relationshipColorWeights();

export default function InsightsPage() {
  const total = useLiveTotal(SAMPLE_TOTAL_EXPERIENCES);

  return (
    <div>
      <section className="px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Human Insights</SectionLabel>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[0.98] tracking-tight">
            What people are experiencing right now.
          </h1>
        </div>
      </section>

      {/* This year, as accumulation rather than a giant number */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-16">
          <div>
            <span className="font-display text-3xl font-bold tracking-tight">
              {CURRENT_YEAR}
            </span>
            <p className="mt-2 text-lg font-bold text-ink">
              {total.toLocaleString()} experiences shared
            </p>
            <div className="mt-4">
              <SampleBadge>Illustrative, not live data</SampleBadge>
            </div>
          </div>
          <div className="h-56 sm:h-72">
            <MarkField seed={11} count={90} />
          </div>
        </div>
      </section>

      {/* Patterns, clustered by category rather than stated as a percentage on a color block */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            {headlineStat.trait} keeps coming up, across every kind of
            relationship.
          </p>
          <div className="mt-8 h-72 sm:h-96">
            <MarkField seed={12} count={110} weights={patternWeights} />
          </div>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm font-medium">
            {Object.values(CATEGORY_META).map((meta) => (
              <span
                key={meta.short}
                className={
                  meta.color === "ink" ? "text-muted" : POP_COLOR_STYLES[meta.color].text
                }
              >
                {meta.short}
              </span>
            ))}
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Named in {headlineStat.pct}% of experiences shared so far. Sample
            data, not live.
          </p>
        </div>
      </section>

      {/* Most valued / most discussed */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-14 sm:grid-cols-2 sm:gap-10">
          <RankedList title="Most valued" items={mostValued} color="purple" />
          <RankedList title="Most discussed" items={mostDiscussed} color="tangerine" />
        </div>
      </section>

      {/* A quiet editorial aside, no eyebrow needed */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-editorial text-3xl leading-snug sm:text-4xl">
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
