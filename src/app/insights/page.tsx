"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { BarMeter } from "@/components/ui/BarMeter";
import { InsightCard } from "@/components/insights/InsightCard";
import { LinkButton } from "@/components/ui/Button";
import {
  CURRENT_YEAR,
  INSIGHT_CARDS,
  SAMPLE_TOTAL_EXPERIENCES,
  WHAT_PEOPLE_VALUE,
} from "@/lib/mockData/insights";
import { useLiveTotal } from "@/lib/hooks/useLiveTotal";

export default function InsightsPage() {
  const total = useLiveTotal(SAMPLE_TOTAL_EXPERIENCES);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>Human Insights</SectionLabel>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Human Insights
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        What are people experiencing right now?
      </p>

      <section className="mt-14 rounded-3xl border border-line bg-paper-raised p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            This year
          </span>
          <SampleBadge>Illustrative, not live data</SampleBadge>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
          <span className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
            {CURRENT_YEAR}
          </span>
          <span className="font-mono text-2xl text-coral sm:text-3xl">
            {total.toLocaleString()}
          </span>
          <span className="pb-2 text-sm text-muted">experiences shared</span>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium sm:text-3xl">
            What people value
          </h2>
          <SampleBadge />
        </div>
        <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {WHAT_PEOPLE_VALUE.map((stat, i) => (
            <BarMeter key={stat.trait} label={stat.trait} pct={stat.pct} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium sm:text-3xl">
            What people are talking about
          </h2>
          <SampleBadge>Sample insights</SampleBadge>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {INSIGHT_CARDS.map((card, i) => (
            <InsightCard key={card.title} title={card.title} body={card.body} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-16 flex flex-col gap-3 border-t border-line pt-10 sm:flex-row">
        <LinkButton href="/insights/explore" size="lg">
          Explore by experience type
        </LinkButton>
        <LinkButton href="/insights/yearly" variant="secondary" size="lg">
          See the {CURRENT_YEAR} snapshot
        </LinkButton>
      </section>
    </div>
  );
}
