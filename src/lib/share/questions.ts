/**
 * The share flow's questions, copied from the approved Claude Design boards
 * (13a "Share flow: every screen, mobile", 13b desktop + tablet, 13c states).
 * Every question from the original flow is kept; copy is sentence case.
 */

export type Overall = "Honestly good" | "Kinda rough" | "A bit of both" | "It's complicated";
export type Answers = {
  overall?: Overall;
  who?: string;
  type?: string;
  typeOther?: string;
  met?: string;
  howLong?: string;
  now?: string;
  when?: string;
  ratings?: Record<string, string>;
  green?: string[];
  greenNote?: string;
  red?: string[];
  redNote?: string;
  glad?: string;
  story?: string;
  advice?: string;
  age?: string;
  gender?: string;
  region?: string;
  theirAge?: string;
  theirGender?: string;
};

export const OVERALL: Overall[] = ["Honestly good", "Kinda rough", "A bit of both", "It's complicated"];

export const WHO = [
  "Someone romantic",
  "Family",
  "Someone from work",
  "School or college",
  "A friend",
  "Flatmate, landlord, neighbour",
  "Someone else",
];

// "What were they to you?" exists for the two groups designed on the board.
export const TYPES: Record<string, string[]> = {
  "Someone romantic": [
    "A one-night thing",
    "Casual / FWB",
    "Situationship",
    "A few dates",
    "Dating",
    "Long-term",
    "Living together",
    "Engaged",
    "Married",
    "Open / non-monogamous",
    "Something else",
  ],
  "Someone from work": [
    "My manager",
    "A colleague",
    "Someone I managed",
    "A client",
    "A mentor",
    "Co-founder or business partner",
    "Something else",
  ],
};

export const MET = [
  "Dating app",
  "Slid into the DMs",
  "Through friends",
  "Family / rishta setup",
  "Work",
  "School or college",
  "Party or night out",
  "Gig, fest or event",
  "Gym, class or hobby",
  "Online community or game",
  "While travelling",
  "The neighbourhood",
  "Somewhere else",
];
export const HOW_LONG = ["Under a month", "1–6 months", "6 months to 2 years", "2–5 years", "5+ years"];
export const NOW = ["Still around", "Over, but we're cool", "Over, no contact", "Never really started", "It's complicated"];
export const WHEN = ["This year", "1–2 years ago", "3–5 years ago", "A while back"];

export const STATEMENTS = [
  "They respected me.",
  "They actually listened.",
  "I could be myself around them.",
  "They showed up for me.",
  "Fights were fair.",
];
export const RATING = [
  { label: "Never", n: 1 },
  { label: "Rarely", n: 2 },
  { label: "Sometimes", n: 3 },
  { label: "Mostly", n: 4 },
  { label: "Always", n: 5 },
];
export const NA = "Doesn't apply";

export const GREEN = [
  "Made me laugh",
  "Actually listened",
  "Planned things",
  "Showed up when they said",
  "Respected my boundaries",
  "Honest, even when it was hard",
  "Had my back",
  "Introduced me to their people",
  "Nothing comes to mind",
];
export const RED = [
  "Mixed signals",
  "Ghosted me",
  "Ignored my boundaries",
  "Wasn't honest",
  "Wanted different things",
  "Too much, too soon",
  "Family pressure",
  "Honestly, nothing major",
];
export const GLAD = ["Yeah, honestly", "In some ways", "Nope", "Still deciding"];

export const AGES = ["18–24", "25–34", "35–44", "45+", "Rather not say"];
export const THEIR_AGES = ["18–24", "25–34", "35–44", "45+", "Not sure", "Rather not say"];
export const GENDERS = ["Woman", "Man", "Non-binary", "Another way", "Rather not say"];
export const REGIONS = ["North", "South", "East", "West", "Northeast", "Central", "Outside India", "Rather not say"];

export type Section = 1 | 2 | 3 | 4 | 5;
export const SECTION_NAMES: Record<Section, string> = {
  1: "THE BASICS",
  2: "HOW IT WENT",
  3: "IN YOUR WORDS",
  4: "ABOUT YOU",
  5: "CHECK",
};

/** Question steps, in order. `when` hides a step for some answers. */
export type StepId =
  | "q1"
  | "q2a"
  | "q2b"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7-0"
  | "q7-1"
  | "q7-2"
  | "q7-3"
  | "q7-4"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "check";

type StepDef = { id: StepId; section: Section; q: number; when?: (a: Answers) => boolean };

export const STEPS: StepDef[] = [
  { id: "q1", section: 1, q: 1 },
  { id: "q2a", section: 1, q: 2 },
  { id: "q2b", section: 1, q: 2, when: (a) => Boolean(a.who && TYPES[a.who]) },
  { id: "q3", section: 1, q: 3, when: (a) => a.who !== "Family" },
  { id: "q4", section: 1, q: 4 },
  { id: "q5", section: 1, q: 5 },
  { id: "q6", section: 1, q: 6 },
  { id: "q7-0", section: 2, q: 7 },
  { id: "q7-1", section: 2, q: 7 },
  { id: "q7-2", section: 2, q: 7 },
  { id: "q7-3", section: 2, q: 7 },
  { id: "q7-4", section: 2, q: 7 },
  { id: "q8", section: 2, q: 8 },
  { id: "q9", section: 2, q: 9 },
  { id: "q10", section: 2, q: 10 },
  { id: "q11", section: 3, q: 11 },
  { id: "q12", section: 3, q: 12 },
  { id: "q13", section: 4, q: 13 },
  { id: "q14", section: 4, q: 14 },
  { id: "check", section: 5, q: 15 },
];

export function visibleSteps(a: Answers) {
  return STEPS.filter((s) => !s.when || s.when(a));
}

/** "THE BASICS · 3/7": position inside the section, as on the boards. */
export function sectionLabel(a: Answers, id: StepId) {
  const steps = visibleSteps(a);
  const me = steps.find((s) => s.id === id);
  if (!me) return "";
  // count against the full section, as on the boards ("THE BASICS · 4/7"),
  // so a skipped branch question shows as a jump rather than renumbering
  const inSection = STEPS.filter((s) => s.section === me.section);
  return `${SECTION_NAMES[me.section]} · ${inSection.indexOf(me) + 1}/${inSection.length}`;
}

/** How many of the 14 numbered questions have an answer (for "6 of 14 answered"). */
export function answeredCount(a: Answers) {
  const has: Record<number, boolean> = {
    1: !!a.overall,
    2: !!a.who,
    3: !!a.met,
    4: !!a.howLong,
    5: !!a.now,
    6: !!a.when,
    7: !!a.ratings && Object.keys(a.ratings).length > 0,
    8: !!a.green?.length || !!a.greenNote,
    9: !!a.red?.length || !!a.redNote,
    10: !!a.glad,
    11: !!a.story?.trim(),
    12: !!a.advice?.trim(),
    13: !!(a.age || a.gender || a.region),
    14: !!(a.theirAge || a.theirGender),
  };
  const total = a.who === "Family" ? 13 : 14;
  const answered = Object.entries(has).filter(([q, v]) => v && !(q === "3" && a.who === "Family")).length;
  return { answered, total };
}

/** Short title used for drafts and stories, e.g. "Romantic · situationship". */
export function storyTitle(a: Answers) {
  const who = a.who === "Someone romantic" ? "Romantic" : a.who === "Someone from work" ? "Work" : a.who ?? "A story";
  const type = a.type === "Something else" ? a.typeOther : a.type;
  return type ? `${who} · ${type.charAt(0).toLowerCase()}${type.slice(1)}` : who;
}

/** The accent follows Q1; the charcoal base never changes. */
export function accentFor(overall?: Overall) {
  if (overall === "Honestly good") return "#FFB627";
  if (overall === "A bit of both" || overall === "It's complicated") return "#7FD8C4";
  return "#FF3E9A";
}

// A light, local "looks like a name" check for the story and notes. It only
// nudges; the review team removes identifying details either way.
const NAMES = new Set(
  `rohan rahul raj aman amit ankit arjun karan kunal vikram vivek varun akash aditya abhishek nikhil siddharth sid rohit
   priya pooja neha sneha anjali ananya riya shreya kavya divya nisha isha tanya simran meera aisha sara sana zoya
   ayesha fatima imran arif faizan sameer salman irfan harsh yash dev ishaan kabir vihaan aryan advait reyansh
   john james david michael chris alex sam jake ryan daniel matt tom ben josh jack emma olivia sophia mia emily
   sarah jessica ashley lauren hannah anna maya zara noah liam ethan lucas mason leo`
    .split(/\s+/)
    .filter(Boolean),
);
export function spotNames(text: string) {
  const hits = new Set<string>();
  for (const w of text.match(/[A-Za-z]+/g) ?? []) if (NAMES.has(w.toLowerCase())) hits.add(w);
  return [...hits];
}
