import { SectionLabel } from "@/components/ui/SectionLabel";
import { LinkButton } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionLabel>About</SectionLabel>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        What GATHER actually is.
      </h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
        <p>
          GATHER is an anonymous place to share experiences you&rsquo;ve had
          with other people — partners, exes, friends, colleagues, managers,
          roommates, mentors, all of it.
        </p>
        <p>
          We&rsquo;re not here to rate people or expose anyone. One story is
          just a story. But thousands of stories start to form a pattern —
          and those patterns are what we call Human Insights.
        </p>
        <p>
          Your experience stays anonymous. The insight doesn&rsquo;t. No
          names, no profiles, no doxxing — just what people are actually
          experiencing, in aggregate.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/share">Share an experience</LinkButton>
        <LinkButton href="/insights" variant="secondary">
          Explore Insights
        </LinkButton>
      </div>
    </div>
  );
}
