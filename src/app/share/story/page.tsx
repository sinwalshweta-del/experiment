"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/share/WizardShell";
import { Button } from "@/components/ui/Button";
import { isDemographicsComplete, useSurvey } from "@/lib/store/surveyStore";
import { addSubmission } from "@/lib/submissions";
import { ExperienceSubmission } from "@/lib/types";

const PROMPTS = [
  "What did they do well?",
  "What was difficult?",
  "What did you learn?",
];

export default function StoryPage() {
  const router = useRouter();
  const { state, hydrated, setStory } = useSurvey();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.category || !isDemographicsComplete(state.demographics)) {
      router.replace(state.category ? "/share/about" : "/share");
    }
  }, [hydrated, state.category, state.demographics, router]);

  if (!hydrated || !state.category) return null;

  function handleSubmit() {
    if (!state.category) return;
    setSubmitting(true);
    const submission: ExperienceSubmission = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      category: state.category,
      demographics: state.demographics,
      answers: state.answers,
      story: state.story.trim(),
      createdAt: new Date().toISOString(),
    };
    addSubmission(submission);
    // The wizard state itself is cleared on the confirmation screen, not
    // here — clearing it now would flip state.category to null while this
    // page is still mounted, tripping its own "no category, bounce to
    // /share" guard before the navigation below completes.
    router.push("/share/done");
  }

  return (
    <WizardShell
      step={4}
      title="Okay, now spill."
      subtitle="This part is optional, but it's where the real texture comes from."
      backHref="/share/survey"
    >
      <label htmlFor="story" className="sr-only">
        Your story
      </label>
      <textarea
        id="story"
        value={state.story}
        onChange={(e) => setStory(e.target.value)}
        rows={7}
        maxLength={1500}
        placeholder="The good, the weird, the unexpectedly wholesome, the 🚩 — whatever stood out."
        className="w-full rounded-2xl border border-line-strong bg-paper-raised p-5 text-base leading-relaxed text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <span
            key={p}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line-strong bg-gold-soft p-5">
        <p className="text-sm font-medium text-ink">Keep it anonymous.</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Don&rsquo;t include names, locations, workplaces, usernames or
          other identifying details. GATHER is about patterns, not publicly
          identifying people.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/share/survey")}>
          &larr; Back
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          Add my experience
        </Button>
      </div>
    </WizardShell>
  );
}
