export const EXPERIENCE_CATEGORIES = [
  "dating",
  "colleague",
  "friend",
  "manager",
  "roommate",
  "other",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

export const CATEGORY_META: Record<
  ExperienceCategory,
  { label: string; emoji: string; short: string }
> = {
  dating: { label: "Someone you dated", emoji: "❤️", short: "Dating" },
  colleague: { label: "A colleague", emoji: "💼", short: "Colleague" },
  friend: { label: "A friend", emoji: "🤝", short: "Friend" },
  manager: { label: "A manager", emoji: "👔", short: "Manager" },
  roommate: { label: "A roommate", emoji: "🏠", short: "Roommate" },
  other: { label: "Someone else", emoji: "✨", short: "Other" },
};

export const AGE_GROUPS = ["18-24", "25-34", "35-44", "45+"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const GENDER_IDENTITIES = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
] as const;
export type GenderIdentity = (typeof GENDER_IDENTITIES)[number];

export const DURATIONS = [
  "Less than 3 months",
  "3-6 months",
  "6-12 months",
  "1-2 years",
  "2+ years",
] as const;
export type Duration = (typeof DURATIONS)[number];

export interface Demographics {
  ageGroup: AgeGroup | null;
  gender: GenderIdentity | null;
  duration: Duration | null;
}

export type SliderQuestion = {
  id: string;
  type: "slider";
  prompt: string;
  lowLabel: string;
  highLabel: string;
};

export type ChoiceQuestion = {
  id: string;
  type: "choice";
  prompt: string;
  options: string[];
};

export type SurveyQuestion = SliderQuestion | ChoiceQuestion;

export type SurveyAnswers = Record<string, number | string>;

export interface ExperienceSubmission {
  id: string;
  category: ExperienceCategory;
  demographics: Demographics;
  answers: SurveyAnswers;
  story: string;
  createdAt: string;
}
