import { PopColor } from "@/lib/colors";

export interface TraitStat {
  trait: string;
  pct: number;
}

export interface InsightCard {
  title: string;
  body: string;
}

export interface CategoryInsight {
  label: string;
  color: PopColor;
  mostValued: string[];
  mostCommonChallenges: string[];
}

export interface YearSnapshot {
  year: number;
  available: boolean;
  totalExperiences: number;
  mostCommonRelationshipTypes: { label: string; pct: number }[];
  mostDiscussedTraits: string[];
  mostValuedTraits: string[];
  mostCommonChallenges: string[];
  patterns: string[];
}

export const CURRENT_YEAR = 2026;
export const AVAILABLE_YEARS = [2026, 2027, 2028];

export const SAMPLE_TOTAL_EXPERIENCES = 12482;

export const WHAT_PEOPLE_VALUE: TraitStat[] = [
  { trait: "Communication", pct: 82 },
  { trait: "Reliability", pct: 71 },
  { trait: "Respect", pct: 68 },
  { trait: "Consistency", pct: 66 },
  { trait: "Emotional availability", pct: 64 },
];

export const INSIGHT_CARDS: InsightCard[] = [
  {
    title: "Communication is still everything.",
    body: "Across relationship experiences, communication continues to be one of the most frequently mentioned themes — good or bad.",
  },
  {
    title: "Consistency > grand gestures.",
    body: "People mention consistency more often than big romantic gestures. Showing up quietly beats showing off.",
  },
  {
    title: "Boundaries get noticed either way.",
    body: "Whether they were respected or ignored, boundary-setting shows up in nearly 1 in 3 stories submitted so far.",
  },
  {
    title: "“Reliable” beats “exciting.”",
    body: "In workplace and roommate experiences, reliability is mentioned almost twice as often as any other trait.",
  },
];

export const CATEGORY_INSIGHTS: Record<string, CategoryInsight> = {
  relationships: {
    label: "Relationships",
    color: "pink",
    mostValued: ["Communication", "Emotional availability", "Reliability"],
    mostCommonChallenges: [
      "Inconsistency",
      "Communication gaps",
      "Unclear expectations",
    ],
  },
  work: {
    label: "Work",
    color: "purple",
    mostValued: ["Reliability", "Communication", "Collaboration"],
    mostCommonChallenges: [
      "Unclear feedback",
      "Handling disagreement poorly",
      "Inconsistent follow-through",
    ],
  },
  friendship: {
    label: "Friendship",
    color: "lime",
    mostValued: ["Showing up", "Honesty", "Reliability"],
    mostCommonChallenges: [
      "Flaky plans",
      "One-sided effort",
      "Avoiding hard conversations",
    ],
  },
  livingTogether: {
    label: "Living together",
    color: "tangerine",
    mostValued: ["Respect for space", "Reliability", "Communication"],
    mostCommonChallenges: [
      "Chores left undone",
      "Passive-aggressive notes",
      "Avoided conversations about money",
    ],
  },
};

export const YEAR_SNAPSHOTS: Record<number, YearSnapshot> = {
  2026: {
    year: 2026,
    available: true,
    totalExperiences: SAMPLE_TOTAL_EXPERIENCES,
    mostCommonRelationshipTypes: [
      { label: "Dating", pct: 38 },
      { label: "Colleague", pct: 24 },
      { label: "Friend", pct: 19 },
      { label: "Manager", pct: 11 },
      { label: "Roommate", pct: 8 },
    ],
    mostDiscussedTraits: [
      "Communication",
      "Consistency",
      "Boundaries",
      "Reliability",
      "Emotional availability",
    ],
    mostValuedTraits: [
      "Communication",
      "Reliability",
      "Respect",
      "Consistency",
      "Emotional availability",
    ],
    mostCommonChallenges: [
      "Inconsistency",
      "Communication gaps",
      "Unclear expectations",
      "Avoided conflict",
    ],
    patterns: [
      "Mentions of “consistency” rose 22% as a valued trait compared to grand romantic gestures.",
      "Workplace stories increasingly cite clarity of feedback over raw skill.",
      "Roommate experiences show respect for shared space as the #1 predictor of a good story.",
    ],
  },
  2027: {
    year: 2027,
    available: false,
    totalExperiences: 0,
    mostCommonRelationshipTypes: [],
    mostDiscussedTraits: [],
    mostValuedTraits: [],
    mostCommonChallenges: [],
    patterns: [],
  },
  2028: {
    year: 2028,
    available: false,
    totalExperiences: 0,
    mostCommonRelationshipTypes: [],
    mostDiscussedTraits: [],
    mostValuedTraits: [],
    mostCommonChallenges: [],
    patterns: [],
  },
};
