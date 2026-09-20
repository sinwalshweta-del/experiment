"use client";

import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/share/WizardShell";
import { CategoryCard } from "@/components/share/CategoryCard";
import { useSurvey } from "@/lib/store/surveyStore";
import { CATEGORY_META, ExperienceCategory } from "@/lib/types";

export default function ChooseExperiencePage() {
  const router = useRouter();
  const { setCategory } = useSurvey();

  function handleSelect(category: ExperienceCategory) {
    setCategory(category);
    router.push("/share/about");
  }

  return (
    <WizardShell
      step={1}
      title="Okay, who are we talking about?"
      subtitle="You know them. We don't. That's the point. Pick the kind of relationship this experience was."
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
        {(Object.keys(CATEGORY_META) as ExperienceCategory[]).map((key) => (
          <CategoryCard
            key={key}
            emoji={CATEGORY_META[key].emoji}
            label={CATEGORY_META[key].label}
            color={CATEGORY_META[key].color}
            onClick={() => handleSelect(key)}
          />
        ))}
      </div>
    </WizardShell>
  );
}
