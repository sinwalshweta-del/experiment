"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Answers, StepId } from "./questions";
import { answeredCount } from "./questions";

/**
 * Share-flow drafts, one per verified email.
 *
 * Honest limitation: there is no backend yet, so drafts and the "verified"
 * email live in this browser's localStorage. Coming back on the same device
 * restores everything; another device can't see the draft until a real
 * account/email service exists. Drafts are dropped after 30 days.
 */
const DRAFTS = "gather:drafts";
const SESSION = "gather:session";
const KEEP_MS = 30 * 864e5;

export type Draft = { answers: Answers; step: StepId; updatedAt: number };
type Store = Record<string, Draft>;
type Session = { email: string; verifiedAt: number };

const EMPTY: Draft = { answers: {}, step: "q1", updatedAt: 0 };

function readStore(): Store {
  try {
    const all = JSON.parse(window.localStorage.getItem(DRAFTS) ?? "{}") as Store;
    const now = Date.now();
    return Object.fromEntries(Object.entries(all).filter(([, d]) => now - d.updatedAt < KEEP_MS));
  } catch {
    return {};
  }
}
function writeStore(s: Store) {
  try {
    window.localStorage.setItem(DRAFTS, JSON.stringify(s));
  } catch {
    // storage unavailable (private mode): the draft just isn't kept
  }
}

type Ctx = {
  hydrated: boolean;
  email: string | null;
  draft: Draft;
  /** Sign in with a verified email and load its draft, if any. */
  signIn: (email: string) => Draft | null;
  setAnswers: (patch: Partial<Answers>) => void;
  setStep: (step: StepId) => void;
  /** Forget the current draft (after sending, or "start a new story"). */
  reset: () => void;
};
const DraftContext = createContext<Ctx | null>(null);

export function ShareDraftProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    // read once on mount: storage isn't available during server rendering
    try {
      const s = JSON.parse(window.localStorage.getItem(SESSION) ?? "null") as Session | null;
      if (s && Date.now() - s.verifiedAt < KEEP_MS) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(s.email);
        const d = readStore()[s.email];
        if (d) setDraft(d);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // save the current draft under its email whenever it changes
  useEffect(() => {
    if (!hydrated || !email || !draft.updatedAt) return;
    writeStore({ ...readStore(), [email]: draft });
  }, [draft, email, hydrated]);

  const signIn = useCallback((e: string) => {
    const key = e.trim().toLowerCase();
    try {
      window.localStorage.setItem(SESSION, JSON.stringify({ email: key, verifiedAt: Date.now() } satisfies Session));
    } catch {
      // ignore
    }
    setEmail(key);
    const found = readStore()[key] ?? null;
    setDraft(found ?? EMPTY);
    return found;
  }, []);

  const setAnswers = useCallback((patch: Partial<Answers>) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, ...patch }, updatedAt: Date.now() }));
  }, []);
  const setStep = useCallback((step: StepId) => setDraft((d) => (d.step === step ? d : { ...d, step })), []);
  const reset = useCallback(() => {
    setDraft(EMPTY);
    if (email) {
      const s = readStore();
      delete s[email];
      writeStore(s);
    }
  }, [email]);

  const value = useMemo(() => ({ hydrated, email, draft, signIn, setAnswers, setStep, reset }), [hydrated, email, draft, signIn, setAnswers, setStep, reset]);
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
