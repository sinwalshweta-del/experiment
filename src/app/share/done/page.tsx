"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/Button";
import { TallyMarks } from "@/components/ui/TallyMarks";
import { useSurvey } from "@/lib/store/surveyStore";

export default function DonePage() {
  const { reset } = useSurvey();

  useEffect(() => {
    // Clear the wizard now that the submission has landed, so a fresh
    // visit to /share starts clean. Safe here: this screen has no route
    // guard depending on the wizard state, unlike the screens before it.
    reset();
  }, [reset]);

  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <TallyMarks count={1} size="lg" className="text-pen" />
      <h1 className="animate-rise-in mt-8 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
        Your story just became data.
      </h1>
      <p className="animate-rise-in mt-5 max-w-md text-base leading-relaxed text-ink-soft">
        Your experience has been added anonymously. As more people
        contribute, GATHER turns individual stories into collective
        insights.
      </p>
      <div className="animate-rise-in mt-9 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/insights" size="lg">
          See the bigger picture &rarr;
        </LinkButton>
        <LinkButton href="/share" variant="secondary" size="lg">
          Share another
        </LinkButton>
      </div>
    </div>
  );
}
