"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Demographics,
  ExperienceCategory,
  SurveyAnswers,
} from "@/lib/types";

const STORAGE_KEY = "gather:wizard";

interface WizardState {
  category: ExperienceCategory | null;
  demographics: Demographics;
  answers: SurveyAnswers;
  story: string;
  /** when the draft was last changed (ms), for "saved 2 days ago" */
  updatedAt?: number;
}

const initialState: WizardState = {
  category: null,
  demographics: { ageGroup: null, gender: null, duration: null },
  answers: {},
  story: "",
};

interface SurveyContextValue {
  state: WizardState;
  hydrated: boolean;
  setCategory: (category: ExperienceCategory) => void;
  setDemographics: (demographics: Partial<Demographics>) => void;
  setAnswer: (id: string, value: number | string) => void;
  setStory: (story: string) => void;
  reset: () => void;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from sessionStorage on mount. Intentionally not
    // reactive to any dependency — this is a read-once-on-mount sync from
    // a browser API that isn't available during SSR, so the value can't
    // be computed as part of the initial render without a hydration
    // mismatch.
    try {
      // Drafts are kept on this device (localStorage) so people can pick up
      // where they left off; older drafts lived in sessionStorage.
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (state === initialState) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable (private mode): the draft just isn't kept
    }
  }, [state, hydrated]);

  const setCategory = useCallback((category: ExperienceCategory) => {
    setState((s) => ({ ...s, category, updatedAt: Date.now() }));
  }, []);

  const setDemographics = useCallback((demographics: Partial<Demographics>) => {
    setState((s) => ({
      ...s,
      demographics: { ...s.demographics, ...demographics },
      updatedAt: Date.now(),
    }));
  }, []);

  const setAnswer = useCallback((id: string, value: number | string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value }, updatedAt: Date.now() }));
  }, []);

  const setStory = useCallback((story: string) => {
    setState((s) => ({ ...s, story, updatedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ state, hydrated, setCategory, setDemographics, setAnswer, setStory, reset }),
    [state, hydrated, setCategory, setDemographics, setAnswer, setStory, reset]
  );

  return (
    <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurvey must be used within SurveyProvider");
  return ctx;
}

export function isDemographicsComplete(d: Demographics) {
  return Boolean(d.ageGroup && d.gender && d.duration);
}

export type { WizardState };

/** Where a saved draft should reopen, and how far along it is. */
export function draftProgress(state: WizardState, questionCount: number) {
  const demo = [state.demographics.ageGroup, state.demographics.gender, state.demographics.duration].filter(Boolean).length;
  const answered = demo + Object.keys(state.answers).length + (state.story.trim() ? 1 : 0);
  const total = 3 + questionCount + 1;
  const hasDraft = Boolean(state.category) && answered > 0;
  let href = "/share";
  if (state.category) href = "/share/about";
  if (state.category && demo === 3) href = "/share/survey";
  if (state.category && demo === 3 && Object.keys(state.answers).length >= questionCount) href = "/share/story";
  return { hasDraft, answered, total, href };
}
