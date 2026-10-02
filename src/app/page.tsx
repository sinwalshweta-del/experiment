import { LinkButton } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Marquee } from "@/components/ui/Marquee";
import { WHAT_PEOPLE_VALUE } from "@/lib/mockData/insights";
import { CATEGORY_META } from "@/lib/types";
import { POP_COLOR_STYLES } from "@/lib/colors";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%

const TICKER = [
  "NO NAMES",
  "NO PROFILES",
  "NO DOXXING",
  "ONE STORY IS A STORY",
  "THOUSANDS BECOME A PATTERN",
  "ANONYMOUS BY DESIGN",
];

export default function Home() {
  return (
    <div>
      <Marquee items={TICKER} />

      {/* Chapter 1 — hero: the headline IS the visual */}
      <section className="px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="animate-rise-in flex items-baseline gap-3">
            <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              GATHER
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Human Insights
            </span>
          </div>

          <h1 className="animate-rise-in mt-6 font-display text-[clamp(2.75rem,9vw,7rem)] font-medium leading-[0.96] tracking-tight sm:mt-8">
            You&rsquo;ve experienced
            <br />
            people. Now let&rsquo;s
            <br />
            learn from it.
          </h1>

          <div className="animate-rise-in mt-10 flex flex-col gap-8 sm:mt-12 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-lg leading-relaxed text-ink-soft">
              Share an anonymous experience. See what thousands of
              experiences reveal about people.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/share" size="lg">
                Share an experience
              </LinkButton>
              <LinkButton href="/insights" variant="secondary" size="lg">
                Explore insights
              </LinkButton>
            </div>
          </div>

          <p className="animate-rise-in mt-10 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            No names. No profiles. No doxxing.
          </p>
        </div>
      </section>

      {/* Chapter 2 — the claim, full-bleed dark */}
      <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-paper/60">
              <span className="h-1.5 w-1.5 rounded-full bg-signature" />
              What we&rsquo;re hearing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper/20 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper/70">
              <span className="h-1 w-1 rounded-full bg-highlight" />
              Sample / demo data
            </span>
          </div>

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

      {/* Chapter 3 — who this is about */}
      <section className="bg-paper-raised px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Who are we talking about</SectionLabel>
          <p className="mt-4 max-w-xl font-display text-2xl font-medium leading-snug sm:text-3xl">
            Romantic partners. Exes. Friends. Managers. Roommates. Anyone
            whose presence left a mark.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const styles = POP_COLOR_STYLES[meta.color];
              return (
                <div
                  key={key}
                  className={`group rounded-2xl border px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${styles.border} ${styles.bgSoft} ${styles.shadowHover}`}
                >
                  <div className="text-2xl transition-transform duration-200 group-hover:scale-110">
                    {meta.emoji}
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink-soft">
                    {meta.short}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
