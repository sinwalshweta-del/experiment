"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/share/WizardShell";
import { ProgressBar } from "@/components/share/ProgressBar";
import { ChipGroup } from "@/components/share/ChipGroup";
import { SliderQuestion } from "@/components/share/SliderQuestion";
import { Button } from "@/components/ui/Button";
import { isDemographicsComplete, useSurvey } from "@/lib/store/surveyStore";
import { SURVEY_QUESTIONS } from "@/lib/surveyQuestions";

export default function SurveyPage() {
  const router = useRouter();
  const { state, hydrated, setAnswer } = useSurvey();
  // null until the person navigates within this screen; until then, the
  // step tracks how many questions are already answered, so a resumed
  // session (after hydration fills in state.answers) lands on the right
  // question without an effect.
  const [manualIndex, setManualIndex] = useState<number | null>(null);

  const questions = useMemo(
    () => (state.category ? SURVEY_QUESTIONS[state.category] : []),
    [state.category]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!state.category || !isDemographicsComplete(state.demographics)) {
      router.replace(state.category ? "/share/about" : "/share");
    }
  }, [hydrated, state.category, state.demographics, router]);

  if (!hydrated || !state.category || questions.length === 0) return null;

  const answeredCount = questions.filter(
    (q) => state.answers[q.id] !== undefined
  ).length;
  const index =
    manualIndex ?? Math.min(answeredCount, questions.length - 1);
  const question = questions[index];
  const currentValue = state.answers[question.id];
  const canAdvance =
    question.type === "slider" ? true : typeof currentValue === "string";
  const isLast = index === questions.length - 1;

  function handleNext() {
    if (question.type === "slider" && currentValue === undefined) {
      setAnswer(question.id, 50);
    }
    if (isLast) {
      router.push("/share/story");
    } else {
      setManualIndex(index + 1);
    }
  }

  function handleBack() {
    if (index === 0) {
      router.push("/share/about");
    } else {
      setManualIndex(index - 1);
    }
  }

  return (
    <WizardShell step={3} title="Let's get into it.">
      <ProgressBar
        step={index + 1}
        total={questions.length}
        label="The survey"
      />

      <div key={question.id} className="animate-rise-in min-h-[220px]">
        <h2 className="font-display text-[clamp(1.6rem,5vw,2.5rem)] font-medium leading-[1.1]">
          {question.prompt}
        </h2>

        {question.type === "slider" ? (
          <SliderQuestion
            value={typeof currentValue === "number" ? currentValue : 50}
            onChange={(v) => setAnswer(question.id, v)}
            lowLabel={question.lowLabel}
            highLabel={question.highLabel}
          />
        ) : (
          <div className="mt-8">
            <ChipGroup
              columns={1}
              options={question.options}
              value={typeof currentValue === "string" ? currentValue : null}
              onChange={(v) => setAnswer(question.id, v)}
            />
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          &larr; Back
        </Button>
        <Button disabled={!canAdvance} onClick={handleNext}>
          {isLast ? "Continue" : "Next"}
        </Button>
      </div>
    </WizardShell>
  );
}
