/**
 * Share flow v2: the agreed questionnaire (Claude Design boards 18a/18b).
 * Every question exists to support an insight, the story, privacy or the
 * submission itself. Copy is sentence case.
 */

export type Answers = {
  type?: string;
  typeOther?: string;
  withGender?: string;
  met?: string;
  howLong?: string;
  hope?: string;
  thought?: string;
  story?: string;
  good?: string[];
  goodOther?: string;
  hard?: string[];
  hardOther?: string;
  status?: string;
  slowed?: string;
  reasons?: string[];
  reasonOther?: string;
  reflection?: string;
  age?: string;
  gender?: string;
  region?: string;
};

export const OTHER = "Something else";

export const TYPES = [
  "A talking stage",
  "A few dates",
  "A situationship",
  "Dating, not official yet",
  "An official relationship",
  "Engaged",
  "Married",
  OTHER,
];
export const COMMITTED = ["An official relationship", "Engaged", "Married"];

export const WITH = ["A man", "A woman", "A non-binary person", "Another gender identity", "Not sure", "Prefer not to say"];

export const MET = [
  "Dating app",
  "Through friends",
  "Instagram or other DMs",
  "Work",
  "School or college",
  "Family or a rishta setup",
  "At a party, event or night out",
  "Somewhere else",
  "Prefer not to say",
];

export const HOW_LONG = ["Under a month", "1–3 months", "3–6 months", "6–12 months", "1–3 years", "More than 3 years"];

export const HOPE = ["Something serious", "I wanted to see where it went", "Something casual", "I didn't know yet"];
export const THOUGHT = ["Something serious", "To see where it went", "Something casual", "I couldn't tell"];

export const GOOD = [
  "Actually listened",
  "Made me laugh",
  "Showed up when they said they would",
  "Respected my boundaries",
  "Was honest with me",
  "Made me feel I could be myself",
  "Made me part of their life",
  OTHER,
];
export const NOTHING_GOOD = "Nothing really";

export const HARD = [
  "Mixed signals",
  "Wasn't honest",
  "Didn't make time for me",
  "Ignored my boundaries",
  "Moved too fast",
  "Jealous or controlling",
  "Pressure from family or others",
  OTHER,
];
export const NOTHING_HARD = "Nothing major";

export const STATUS_EARLY = [
  "It turned into a relationship",
  "Still going, still undefined",
  "It ended after a conversation",
  "It faded out without a real conversation",
  "It stopped suddenly, with no explanation",
  "It's complicated",
  "Not sure",
];
export const STATUS_COMMITTED = ["Still together", "On a break", "It ended", "It's complicated"];
export const FADED = ["It faded out without a real conversation", "It stopped suddenly, with no explanation"];
export const ENDED = [...FADED, "It ended after a conversation", "It ended"];

export const SLOWED = ["In the first month", "In the second month", "Months 3–6", "After 6 months", "It stopped all at once", "I don't remember"];

export const REASONS = [
  "We wanted different things",
  "Communication broke down",
  "Trust was broken",
  "We grew apart",
  "Timing or distance",
  "Family or outside pressure",
  "Their interest faded (as I saw it)",
  "My interest faded",
  OTHER,
];
export const NOT_SURE = "I'm not sure";

export const AGES = ["18–24", "25–34", "35–44", "45+", "Prefer not to say"];
export const GENDERS = ["Woman", "Man", "Non-binary", "Another gender identity", "Prefer not to say"];
export const REGIONS = ["India", "Outside India", "Prefer not to say"];

export const STORY_MIN = 80;
export const STORY_MAX = 3000;

export const isCommitted = (a: Answers) => Boolean(a.type && COMMITTED.includes(a.type));
export const statusOptions = (a: Answers) => (isCommitted(a) ? STATUS_COMMITTED : STATUS_EARLY);
export const hasFaded = (a: Answers) => Boolean(a.status && FADED.includes(a.status));
export const hasEnded = (a: Answers) => Boolean(a.status && ENDED.includes(a.status));

export const SECTIONS = ["THE CONNECTION", "AT THE START", "YOUR STORY", "WHAT STOOD OUT", "HOW IT WENT", "LOOKING BACK"];

export type StepId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10" | "q11" | "q12" | "q13" | "about";
type StepDef = { id: StepId; section: number; when?: (a: Answers) => boolean };

export const STEPS: StepDef[] = [
  { id: "q1", section: 1 },
  { id: "q2", section: 1 },
  { id: "q3", section: 1 },
  { id: "q4", section: 1 },
  { id: "q5", section: 2 },
  { id: "q6", section: 2 },
  { id: "q7", section: 3 },
  { id: "q8", section: 4 },
  { id: "q9", section: 4 },
  { id: "q10", section: 5 },
  { id: "q11", section: 5, when: hasFaded },
  { id: "q12", section: 5, when: hasEnded },
  { id: "q13", section: 6 },
  { id: "about", section: 6 },
];

export const visibleSteps = (a: Answers) => STEPS.filter((s) => !s.when || s.when(a));

/** "HOW IT WENT · 2/3", counted within the steps this person will actually see. */
export function sectionLabel(a: Answers, id: StepId) {
  const steps = visibleSteps(a);
  const me = steps.find((s) => s.id === id);
  if (!me) return "";
  const inSec = steps.filter((s) => s.section === me.section);
  return `${SECTIONS[me.section - 1]} · ${inSec.indexOf(me) + 1}/${inSec.length}`;
}

/** Answered vs. total for the questions this person will see (for "8 of 13 answered"). */
export function answeredCount(a: Answers) {
  const filled: Record<StepId, boolean> = {
    q1: Boolean(a.type),
    q2: Boolean(a.withGender),
    q3: Boolean(a.met),
    q4: Boolean(a.howLong),
    q5: Boolean(a.hope),
    q6: Boolean(a.thought),
    q7: (a.story?.trim().length ?? 0) >= STORY_MIN,
    q8: Boolean(a.good?.length),
    q9: Boolean(a.hard?.length),
    q10: Boolean(a.status),
    q11: Boolean(a.slowed),
    q12: Boolean(a.reasons?.length),
    q13: Boolean(a.reflection?.trim()),
    about: Boolean(a.age || a.gender || a.region),
  };
  const steps = visibleSteps(a);
  return { answered: steps.filter((s) => filled[s.id]).length, total: steps.length };
}

/** Short private title for drafts and the take-down list, e.g. "A situationship · 1–3 months". */
export function storyTitle(a: Answers) {
  const type = a.type === OTHER ? a.typeOther?.trim() || "Something else" : a.type ?? "A story";
  return a.howLong ? `${type} · ${a.howLong.toLowerCase()}` : type;
}

// A light, local "looks like a name" check. It only nudges; the review team
// removes identifying details either way.
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
