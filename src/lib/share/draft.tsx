"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authErrorText, supabase } from "@/lib/supabase";
import type { Answers, StepId } from "./questions";
import { answeredCount } from "./questions";

/**
 * Account + share-flow draft, backed by Supabase.
 *
 * Sign-in is an email code (Supabase Auth OTP). Once signed in, the one
 * unfinished questionnaire lives in public.drafts (row-level security: only
 * its owner can read or write it), so it follows the person to any device.
 * A copy is kept in this browser too, so typing never waits on the network.
 */
const LOCAL = "gather:draft-cache";

export type Draft = { answers: Answers; step: StepId; updatedAt: number };
const EMPTY: Draft = { answers: {}, step: "q1", updatedAt: 0 };

// older drafts saved answers like "1–3 months"; the options now use a plain hyphen
const fixDashes = (_k: string, v: unknown) => (typeof v === "string" ? v.replace(/–/g, "-") : v);

function readLocal(userId: string): Draft | null {
  try {
    const all = JSON.parse(window.localStorage.getItem(LOCAL) ?? "{}", fixDashes) as Record<string, Draft>;
    return all[userId] ?? null;
  } catch {
    return null;
  }
}
function writeLocal(userId: string, d: Draft | null) {
  try {
    const all = JSON.parse(window.localStorage.getItem(LOCAL) ?? "{}") as Record<string, Draft>;
    if (d) all[userId] = d;
    else delete all[userId];
    window.localStorage.setItem(LOCAL, JSON.stringify(all));
  } catch {
    // storage unavailable: the server copy is still kept
  }
}

async function loadDraft(userId: string): Promise<Draft> {
  const local = readLocal(userId);
  const { data } = await supabase().from("drafts").select("answers, step, updated_at").eq("user_id", userId).maybeSingle();
  const remote: Draft | null = data
    ? { answers: JSON.parse(JSON.stringify(data.answers ?? {}), fixDashes) as Answers, step: data.step as StepId, updatedAt: new Date(data.updated_at).getTime() }
    : null;
  if (local && (!remote || local.updatedAt > remote.updatedAt)) return local;
  return remote ?? EMPTY;
}

type Result = { ok: true } | { ok: false; error: string };

type Ctx = {
  hydrated: boolean;
  email: string | null;
  userId: string | null;
  draft: Draft;
  /** Send a 6-digit code to this email. */
  requestCode: (email: string) => Promise<Result>;
  /** Check the code; on success the person is signed in and their draft is loaded. */
  verifyCode: (email: string, code: string) => Promise<{ ok: true; draft: Draft; userId: string } | { ok: false; error: string }>;
  setAnswers: (patch: Partial<Answers>) => void;
  setStep: (step: StepId) => void;
  /** Forget the current draft (after sending, or "start a new story"). */
  reset: () => void;
  signOut: () => Promise<void>;
};
const DraftContext = createContext<Ctx | null>(null);

export function ShareDraftProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const sb = supabase();
    sb.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (u && alive) {
        setEmail(u.email ?? null);
        setUserId(u.id);
        const d = await loadDraft(u.id);
        if (alive) setDraft(d);
      }
      if (alive) setHydrated(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setEmail(null);
        setUserId(null);
        setDraft(EMPTY);
      } else if (session?.user) {
        setEmail(session.user.email ?? null);
        setUserId(session.user.id);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // save the draft (local right away, server shortly after typing stops)
  useEffect(() => {
    if (!hydrated || !userId || !draft.updatedAt) return;
    writeLocal(userId, draft);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      supabase()
        .from("drafts")
        .upsert({ user_id: userId, answers: draft.answers, step: draft.step, updated_at: new Date(draft.updatedAt).toISOString() })
        .then(() => undefined);
    }, 800);
  }, [draft, userId, hydrated]);

  const requestCode = useCallback(async (e: string): Promise<Result> => {
    const { error } = await supabase().auth.signInWithOtp({ email: e.trim().toLowerCase(), options: { shouldCreateUser: true } });
    return error ? { ok: false, error: authErrorText(error.message) } : { ok: true };
  }, []);

  const verifyCode = useCallback(async (e: string, code: string) => {
    const { data, error } = await supabase().auth.verifyOtp({ email: e.trim().toLowerCase(), token: code, type: "email" });
    const u = data.user;
    if (error || !u) return { ok: false as const, error: authErrorText(error?.message ?? "invalid") };
    setEmail(u.email ?? null);
    setUserId(u.id);
    const d = await loadDraft(u.id);
    setDraft(d);
    return { ok: true as const, draft: d, userId: u.id };
  }, []);

  const setAnswers = useCallback((patch: Partial<Answers>) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, ...patch }, updatedAt: Date.now() }));
  }, []);
  const setStep = useCallback((step: StepId) => setDraft((d) => (d.step === step ? d : { ...d, step })), []);
  const reset = useCallback(() => {
    setDraft(EMPTY);
    if (userId) {
      writeLocal(userId, null);
      supabase().from("drafts").delete().eq("user_id", userId).then(() => undefined);
    }
  }, [userId]);
  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
    setEmail(null);
    setUserId(null);
    setDraft(EMPTY);
  }, []);

  const value = useMemo(
    () => ({ hydrated, email, userId, draft, requestCode, verifyCode, setAnswers, setStep, reset, signOut }),
    [hydrated, email, userId, draft, requestCode, verifyCode, setAnswers, setStep, reset, signOut],
  );
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
