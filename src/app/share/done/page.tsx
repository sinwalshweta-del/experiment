"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/Button";
import { useSurvey } from "@/lib/store/surveyStore";
import { POP_COLOR_STYLES, POP_COLORS } from "@/lib/colors";

const CONFETTI = [
  { top: "8%", left: "12%", rotate: "-rotate-12" },
  { top: "18%", left: "82%", rotate: "rotate-12" },
  { top: "68%", left: "8%", rotate: "rotate-6" },
  { top: "74%", left: "88%", rotate: "-rotate-6" },
  { top: "4%", left: "48%", rotate: "rotate-3" },
  { top: "80%", left: "50%", rotate: "-rotate-3" },
];

export default function DonePage() {
  const { reset } = useSurvey();

  useEffect(() => {
    // Clear the wizard now that the submission has landed, so a fresh
    // visit to /share starts clean. Safe here: this screen has no route
    // guard depending on the wizard state, unlike the screens before it.
    reset();
  }, [reset]);

  return (
    <div className="relative mx-auto flex max-w-xl flex-1 flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className={`animate-rise-in absolute hidden h-4 w-4 rounded-md sm:block ${c.rotate} ${POP_COLOR_STYLES[POP_COLORS[i % POP_COLORS.length]].bgSolid}`}
          style={{ top: c.top, left: c.left, animationDelay: `${i * 80}ms` }}
        />
      ))}
      <span className="animate-rise-in text-5xl">🎉</span>
      <h1 className="animate-rise-in mt-6 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        You&rsquo;re officially part of the bigger picture.
      </h1>
      <p className="animate-rise-in mt-5 max-w-md text-base leading-relaxed text-ink-soft">
        Your experience has been added anonymously. As more people
        contribute, GATHER turns individual stories into collective
        insights.
      </p>
      <div className="animate-rise-in mt-9 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/insights" size="lg">
          See Human Insights &rarr;
        </LinkButton>
        <LinkButton href="/share" variant="secondary" size="lg">
          Share another
        </LinkButton>
      </div>
    </div>
  );
}
