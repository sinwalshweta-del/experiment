import { LinkButton } from "@/components/ui/Button";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { WHAT_PEOPLE_VALUE, SAMPLE_TOTAL_EXPERIENCES } from "@/lib/mockData/insights";
import { CATEGORY_META } from "@/lib/types";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%

export default function Home() {
  return (
    <div>
      {/* Hero — the tally marks are the product, not decoration */}
      <section className="px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="animate-rise-in flex items-baseline gap-3">
            <span className="font-display text-lg font-bold tracking-tight">
              GATHER
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
              Human Insights
            </span>
          </div>

          <h1 className="animate-rise-in mt-6 font-display text-[clamp(2.5rem,7.5vw,5.5rem)] font-bold leading-[0.98] tracking-tight">
            One person&rsquo;s story.
            <br />
            <span className="text-pen">A thousand people&rsquo;s pattern.</span>
          </h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div className="animate-rise-in">
              <TallyMarks count={48} size="lg" className="text-ink" />
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                {SAMPLE_TOTAL_EXPERIENCES.toLocaleString()} experiences
                counted so far
              </p>
            </div>

            <div className="animate-rise-in flex flex-col gap-6 lg:items-start lg:pt-2">
              <p className="max-w-sm text-lg leading-relaxed text-ink-soft">
                Share an anonymous experience about someone you&rsquo;ve
                known. Every story adds one mark. Enough marks start to
                read like the truth.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/share" size="lg">
                  Share an experience
                </LinkButton>
                <LinkButton href="/insights" variant="secondary" size="lg">
                  Explore insights
                </LinkButton>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
                No names. No profiles. No doxxing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The claim — stat told as marks, not a dark box */}
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

      {/* Who this is about — a line, not a grid of cards */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
            Who are we talking about
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            {Object.values(CATEGORY_META).map((meta, i, arr) => (
              <span key={meta.short} className="inline-flex items-baseline">
                {meta.short}
                {i < arr.length - 1 && (
                  <span className="ml-3 text-line-strong">/</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </section>
    </div>
  );
}
