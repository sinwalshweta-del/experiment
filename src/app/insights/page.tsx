import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IconArrowRight } from "@/components/site/Icons";

/**
 * Insights empty state (approved Claude Design board "Insights · empty
 * state v2"). Typography and whitespace do the work: no diagram, no stats,
 * one clear action. The landing page shell (corner shape, header, footer)
 * is unchanged; "Insights" carries the pink active underline.
 */
export const metadata: Metadata = {
  title: "Insights · GATHER People Insights",
  description: "We're still collecting stories about dating and relationships. Spill yours.",
};

export default function InsightsPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-brief-paper font-archivo text-brief-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[42px] -top-[42px] h-[170px] w-[170px] rounded-bl-full border-2 border-brief-ink bg-brief-rani md:-right-20 md:-top-20 md:h-[320px] md:w-[320px] lg:-right-[110px] lg:-top-[110px] lg:h-[440px] lg:w-[440px]"
      />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col justify-center gap-[34px] px-4 pb-9 pt-7 sm:px-8 md:px-12 md:pb-14 md:pt-10 lg:px-20">
        <span className="flex items-center gap-2.5 font-martian-mono text-xs font-semibold leading-[18px] tracking-[0.05em] text-[#5F5866] before:h-3.5 before:w-3.5 before:rounded-tl-full before:border-2 before:border-brief-ink before:bg-brief-rani">
          THE PICTURE IS STILL TAKING SHAPE
        </span>
        <h1 className="m-0 text-[52px] font-black leading-[0.9] tracking-[-0.02em] [font-stretch:125%] sm:text-[72px] md:text-[92px] lg:text-[clamp(92px,9.2vw,132px)]">
          We&apos;re still
          <br />
          collecting{" "}
          <span className="bg-[linear-gradient(transparent_58%,var(--color-brief-rani)_58%,var(--color-brief-rani)_92%,transparent_92%)] px-[0.04em]">
            stories.
          </span>
        </h1>
        <div className="flex max-w-[600px] flex-col gap-[26px]">
          <p className="m-0 text-[17px] leading-[1.55] text-[#2A2430] md:text-[19px] lg:text-[20px]">
            We&apos;re gathering real experiences about dating and relationships. As more people share, we&apos;ll have more
            to learn from and more patterns to uncover. We&apos;re just getting started.
          </p>
          <Link href="/share" className="landing-btn min-h-[58px] w-full px-[30px] sm:w-auto sm:self-start">
            Spill yours{" "}
            <IconArrowRight />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
