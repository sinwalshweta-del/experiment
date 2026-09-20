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
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setCategory = useCallback((category: ExperienceCategory) => {
    setState((s) => ({ ...s, category }));
  }, []);

  const setDemographics = useCallback((demographics: Partial<Demographics>) => {
    setState((s) => ({
      ...s,
      demographics: { ...s.demographics, ...demographics },
    }));
  }, []);

  const setAnswer = useCallback((id: string, value: number | string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  }, []);

  const setStory = useCallback((story: string) => {
    setState((s) => ({ ...s, story }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    try {
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
