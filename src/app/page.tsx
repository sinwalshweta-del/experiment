import { LinkButton } from "@/components/ui/Button";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { WHAT_PEOPLE_VALUE, SAMPLE_TOTAL_EXPERIENCES } from "@/lib/mockData/insights";
import { POP_COLOR_STYLES } from "@/lib/colors";
import { CATEGORY_META } from "@/lib/types";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%

export default function Home() {
  return (
    <div className="overflow-x-clip">
      {/* Hero — GATHER as a graphic object, not a logo in a corner */}
      <section className="bg-lime px-5 pb-24 pt-14 sm:px-8 sm:pb-32 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
            Human Insights
          </p>
          <h1 className="animate-rise-in mt-3 font-display text-[clamp(4rem,18vw,11rem)] font-bold leading-[0.82] tracking-tight text-ink">
            GATHER
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
            <p className="animate-rise-in font-display text-[clamp(1.75rem,4.2vw,2.75rem)] font-bold leading-[1.08] tracking-tight text-ink">
              You experienced people.
              <br />
              We&rsquo;re collecting the patterns.
            </p>
            <div className="animate-rise-in flex flex-col gap-3 lg:items-end">
              <LinkButton href="/share" size="lg" variant="secondary">
                Share an experience
              </LinkButton>
              <LinkButton href="/insights" variant="ghost" size="lg">
                Explore insights &rarr;
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* The count — bleeds up out of the lime block, lives in the ink anchor */}
      <section className="bg-ink px-5 pb-16 pt-6 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="-mt-14 flex flex-wrap items-end gap-5 sm:-mt-20">
            <span className="font-display text-[clamp(4rem,17vw,10rem)] font-bold leading-[0.78] tracking-tight text-paper">
              {SAMPLE_TOTAL_EXPERIENCES.toLocaleString()}
            </span>
            <span className="pb-2 font-mono text-xs uppercase tracking-[0.1em] text-paper/55 sm:pb-6">
              experiences counted so far
            </span>
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.1em] text-paper/55">
            No names. No profiles. No doxxing.
          </p>
        </div>
      </section>

      {/* The claim — full-bleed hot pink, proof as an oversized mark */}
      <section className="bg-pink px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-2xl font-bold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            {headlineStat.trait} keeps coming up.
          </p>
          <div className="relative mt-2">
            <div className="font-display text-[clamp(7rem,18vw,13rem)] font-bold leading-[0.82] text-ink">
              {headlineStat.pct}
              <span className="text-[0.35em] align-top">%</span>
            </div>
            <TallyMarks
              count={headlineStat.pct}
              size="md"
              className="mt-2 text-ink sm:-mt-10"
            />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink/70">
            of experiences mentioned {headlineStat.trait.toLowerCase()} as an
            important factor. Sample data — not live.
          </p>
        </div>
      </section>

      {/* Who this is about — color becomes the category system itself */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
            Who are we talking about
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-display text-3xl font-bold leading-tight sm:text-5xl">
            {Object.values(CATEGORY_META).map((meta) => (
              <span
                key={meta.short}
                className={
                  meta.color === "ink" ? "text-ink" : POP_COLOR_STYLES[meta.color].text
                }
              >
                {meta.short}
              </span>
            ))}
          </p>
        </div>
      </section>
    </div>
  );
}
