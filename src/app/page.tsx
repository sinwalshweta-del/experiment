import { LinkButton } from "@/components/ui/Button";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { MarkField } from "@/components/ui/MarkField";
import { WHAT_PEOPLE_VALUE, SAMPLE_TOTAL_EXPERIENCES } from "@/lib/mockData/insights";
import { relationshipColorWeights } from "@/lib/markFieldWeights";
import { POP_COLOR_STYLES } from "@/lib/colors";
import { CATEGORY_META } from "@/lib/types";

const headlineStat = WHAT_PEOPLE_VALUE[0]; // Communication, 82%
const patternWeights = relationshipColorWeights();

export default function Home() {
  return (
    <div>
      {/* ONE EXPERIENCE — a single mark, mostly white space */}
      <section className="px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-end lg:gap-20">
          <TallyMarks count={1} size="lg" className="text-pen" />
          <div>
            <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05] tracking-tight">
              It starts with one experience, shared anonymously.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
              No names, no profiles. Just what actually happened, added to
              everyone else&rsquo;s.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/share" size="lg">
                Share an experience
              </LinkButton>
              <LinkButton href="/insights" variant="ghost" size="lg">
                See the patterns &rarr;
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* MANY EXPERIENCES — marks accumulate as you scroll to this point */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              Then more people share theirs.
            </p>
            <p className="mt-3 text-sm text-muted">
              {SAMPLE_TOTAL_EXPERIENCES.toLocaleString()} experiences and
              counting.
            </p>
          </div>
          <div className="h-56 sm:h-72">
            <MarkField seed={1} count={90} />
          </div>
        </div>
      </section>

      {/* PATTERNS — the same marks, now reading as clusters by category */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            Patterns start to show.
          </p>
          <p className="mt-3 max-w-md text-sm text-muted">
            Different relationships surface different patterns.
          </p>
          <div className="mt-8 h-72 sm:h-96">
            <MarkField seed={2} count={110} weights={patternWeights} />
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
        </div>
      </section>

      {/* HUMAN INSIGHTS — the field resolves into plain statements */}
      <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            What it adds up to.
          </p>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              <span className="font-bold text-ink">
                {headlineStat.trait}
              </span>{" "}
              is the most frequently mentioned factor, named in{" "}
              <span className="font-bold text-pen">{headlineStat.pct}%</span>{" "}
              of experiences shared so far.
            </p>
            <p>
              Consistency gets mentioned more often than grand gestures.
              Showing up quietly tends to beat showing off.
            </p>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/share" size="lg">
              Share an experience
            </LinkButton>
            <LinkButton href="/insights/yearly" variant="secondary" size="lg">
              See the full snapshot
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
