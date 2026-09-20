"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/share/WizardShell";
import { ChipGroup } from "@/components/share/ChipGroup";
import { Button } from "@/components/ui/Button";
import { isDemographicsComplete, useSurvey } from "@/lib/store/surveyStore";
import { AGE_GROUPS, DURATIONS, GENDER_IDENTITIES } from "@/lib/types";

export default function AboutExperiencePage() {
  const router = useRouter();
  const { state, hydrated, setDemographics } = useSurvey();

  useEffect(() => {
    if (hydrated && !state.category) router.replace("/share");
  }, [hydrated, state.category, router]);

  if (!hydrated || !state.category) return null;

  const complete = isDemographicsComplete(state.demographics);

  return (
    <WizardShell
      step={2}
      title="A little about you."
      subtitle="No names. No profiles. No doxxing. This just helps us spot patterns across groups."
      backHref="/share"
    >
      <div className="space-y-10">
        <div>
          <h2 className="mb-4 text-base font-medium">
            What&rsquo;s your age group?
          </h2>
          <ChipGroup
            options={AGE_GROUPS}
            value={state.demographics.ageGroup}
            onChange={(v) => setDemographics({ ageGroup: v as typeof state.demographics.ageGroup })}
          />
        </div>

        <div>
          <h2 className="mb-4 text-base font-medium">How do you identify?</h2>
          <ChipGroup
            options={GENDER_IDENTITIES}
            value={state.demographics.gender}
            onChange={(v) => setDemographics({ gender: v as typeof state.demographics.gender })}
          />
        </div>

        <div>
          <h2 className="mb-4 text-base font-medium">
            How long did you know them?
          </h2>
          <ChipGroup
            columns={1}
            options={DURATIONS}
            value={state.demographics.duration}
            onChange={(v) => setDemographics({ duration: v as typeof state.demographics.duration })}
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          disabled={!complete}
          onClick={() => router.push("/share/survey")}
        >
          Continue
        </Button>
      </div>
    </WizardShell>
  );
}
