import { LinkButton } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { BarMeter } from "@/components/ui/BarMeter";
import { WHAT_PEOPLE_VALUE } from "@/lib/mockData/insights";
import { CATEGORY_META } from "@/lib/types";

const previewStats = [
  WHAT_PEOPLE_VALUE[0], // Communication
  WHAT_PEOPLE_VALUE[1], // Reliability
  WHAT_PEOPLE_VALUE[4], // Emotional availability
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="animate-rise-in flex items-baseline gap-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            GATHER
          </h1>
          <span className="font-display text-xl italic text-muted sm:text-2xl">
            Human Insights
          </span>
        </div>

        <h2 className="animate-rise-in mt-8 max-w-3xl font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl sm:leading-[1.02]">
          You&rsquo;ve experienced people.
          <br />
          Now let&rsquo;s learn from it.
        </h2>

        <p className="animate-rise-in mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Share an anonymous experience about someone you&rsquo;ve known —
          and see what thousands of experiences can reveal about people.
        </p>

        <div className="animate-rise-in mt-9 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/share" size="lg">
            Share an experience
          </LinkButton>
          <LinkButton href="/insights" variant="secondary" size="lg">
            Explore Insights
          </LinkButton>
        </div>

        <p className="animate-rise-in mt-8 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          No names. No profiles. No doxxing.
        </p>
      </section>

      <section className="border-t border-line bg-paper-raised px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionLabel>What we&rsquo;re seeing</SectionLabel>
            <SampleBadge>Sample / demo data</SampleBadge>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="font-display text-2xl font-medium leading-snug sm:text-3xl">
                One experience is a story. Thousands become a pattern —
                here&rsquo;s a glimpse of what people keep telling us.
              </p>
              <div className="mt-10 space-y-6">
                {previewStats.map((stat, i) => (
                  <BarMeter
                    key={stat.trait}
                    label={stat.trait}
                    pct={stat.pct}
                    index={i}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-3 lg:grid-cols-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-line px-4 py-5 text-center"
                >
                  <div className="text-2xl">{meta.emoji}</div>
                  <div className="mt-2 text-sm font-medium text-ink-soft">
                    {meta.short}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
