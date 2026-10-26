"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Answers, StepId } from "./questions";
import { answeredCount } from "./questions";

/**
 * The share-flow draft. It lives on this device (localStorage) so people can
 * close the tab and pick up where they left off; nothing is sent until they
 * press "Send it" and confirm their email.
 */
const KEY = "gather:draft";

export type Draft = { answers: Answers; step: StepId | "privacy"; updatedAt: number };
const EMPTY: Draft = { answers: {}, step: "privacy", updatedAt: 0 };

type Ctx = {
  draft: Draft;
  hydrated: boolean;
  setAnswers: (patch: Partial<Answers>) => void;
  setStep: (step: Draft["step"]) => void;
  reset: () => void;
};
const DraftContext = createContext<Ctx | null>(null);

export function ShareDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // read once on mount: storage isn't available during server rendering
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDraft({ ...EMPTY, ...(JSON.parse(raw) as Draft) });
    } catch {
      // ignore malformed or unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (draft === EMPTY || !draft.updatedAt) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      // storage unavailable (private mode): the draft just isn't kept
    }
  }, [draft, hydrated]);

  const setAnswers = useCallback((patch: Partial<Answers>) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, ...patch }, updatedAt: Date.now() }));
  }, []);
  const setStep = useCallback((step: Draft["step"]) => {
    setDraft((d) => ({ ...d, step, updatedAt: d.updatedAt || 0 }));
  }, []);
  const reset = useCallback(() => {
    setDraft(EMPTY);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ draft, hydrated, setAnswers, setStep, reset }), [draft, hydrated, setAnswers, setStep, reset]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useShareDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useShareDraft must be used within ShareDraftProvider");
  return ctx;
}

/** A draft worth offering back: at least one answer given. */
export function draftSummary(d: Draft) {
  const { answered, total } = answeredCount(d.answers);
  return { hasDraft: d.updatedAt > 0 && answered > 0, answered, total };
}
