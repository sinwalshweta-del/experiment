"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mark } from "@/components/site/Mark";
import { draftSummary, useShareDraft } from "@/lib/share/draft";
import {
  AGES,
  GENDERS,
  GOOD,
  HARD,
  HOPE,
  HOW_LONG,
  hasFaded,
  isOngoing,
  MET,
  MET_OTHER,
  NOT_SURE,
  NOTHING_GOOD,
  NOTHING_HARD,
  OTHER,
  REASONS,
  REGIONS,
  SECTIONS,
  sectionLabel,
  SLOWED,
  spotNames,
  statusOptions,
  STEPS,
  STORY_MAX,
  STORY_MIN,
  storyTitle,
  THOUGHT,
  TYPES,
  visibleSteps,
  WITH,
  type Answers,
  type StepId,
} from "@/lib/share/questions";
import { addStory, daysAgo } from "@/lib/share/stories";
import { FeedbackCard } from "./FeedbackCard";
import { IconArrowLeft, IconArrowRight } from "@/components/site/Icons";

/**
 * Share flow v2, built from the agreed questionnaire (Claude Design boards
 * 18a mobile and 18b desktop): email first and verified, then the
 * connection, what you hoped for, your story (required), what stood out,
 * how it went (with conditional follow-ups), looking back, about you,
 * review, an explicit publication choice, and confirmation.
 *
 * Sign-in codes, drafts and stories run on Supabase. See lib/share/draft.tsx
 * and lib/share/stories.ts.
 */

type Screen = "email" | "code" | "returning" | "intro" | "under18" | StepId | "review" | "consent" | "saved" | "error" | "sent";
type Dir = "next" | "back";

const ARROW = (
  <IconArrowRight />
);
const WRITING: Screen[] = ["q7", "q13"];
const isStep = (s: Screen): s is StepId => STEPS.some((x) => x.id === s);

/* ───────────────────────── small pieces ───────────────────────── */

function Kind({ children }: { children: React.ReactNode }) {
  return <div className="sf-kind">{children}</div>;
}

function Choice({
  label,
  options,
  value,
  onPick,
  wrap = false,
  disabled,
}: {
  label: string;
  options: string[];
  value: string | string[] | undefined;
  onPick: (v: string) => void;
  wrap?: boolean;
  disabled?: (v: string) => boolean;
}) {
  const on = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o);
  return (
    <div role="group" aria-label={label} className={wrap ? "sf-wr" : "flex flex-col gap-2.5"}>
      {options.map((o) => (
        <button key={o} type="button" className="sf-ch" aria-pressed={on(o)} disabled={!on(o) && disabled?.(o)} onClick={() => onPick(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function OtherField({ id, label, value, onChange, max, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; max: number; hint?: string }) {
  return (
    <div className="sf-other">
      <label htmlFor={id} className="text-[15px] font-bold leading-5">
        {label}
      </label>
      <input id={id} className="sf-in" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} autoFocus placeholder="In your own words" />
      <span className="sf-cn">
        {value.length} / {max}
      </span>
      {hint && <p className="sf-sm">{hint}</p>}
    </div>
  );
}

function NameWarning({ text }: { text: string }) {
  const names = spotNames(text);
  if (!names.length) return null;
  const one = names.length === 1;
  return (
    <div className="sf-warn" role="status">
      {names.map((n) => `“${n}”`).join(", ")} {one ? "looks like a name" : "look like names"}. Want to take {one ? "it" : "them"} out? Our team will remove {one ? "it" : "them"} anyway.
    </div>
  );
}

function Highlight({ text }: { text: string }) {
  const names = new Set(spotNames(text).map((n) => n.toLowerCase()));
  if (!names.size) return <>{text}</>;
  return (
    <>
      {text.split(/(\b[A-Za-z]+\b)/).map((part, i) =>
        names.has(part.toLowerCase()) ? (
          <mark key={i} className="rounded-sm bg-brief-lilac px-0.5 text-brief-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ───────────────────────── the flow ───────────────────────── */

export function ShareFlow() {
  const router = useRouter();
  const { hydrated, email: signedIn, userId, draft, requestCode, verifyCode, setAnswers, setStep, reset } = useShareDraft();
  const a = draft.answers;
  const [screen, setScreen] = useState<Screen>("email");
  const [dir, setDir] = useState<Dir>("next");
  const [trail, setTrail] = useState<Screen[]>([]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [tries, setTries] = useState(3);
  const [resendIn, setResendIn] = useState(0);
  const [adult, setAdult] = useState(false);
  const [publish, setPublish] = useState<boolean | null>(null);
  const [ack, setAck] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const steps = useMemo(() => visibleSteps(a), [a]);

  // first screen: someone already signed in skips straight in
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    if (!signedIn) return;
    const { hasDraft } = draftSummary(draft);
    const resume = new URLSearchParams(window.location.search).get("resume") === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(signedIn);
    setScreen(hasDraft ? (resume ? draft.step : "returning") : "intro");
  }, [hydrated, signedIn, draft]);

  // keep the draft pointing at the current question so it reopens there
  useEffect(() => {
    if (isStep(screen)) setStep(screen);
  }, [screen, setStep]);

  // focus each new screen's heading for keyboard and screen-reader users
  useEffect(() => {
    if (started.current) headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [screen]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const go = (to: Screen, d: Dir = "next") => {
    setDir(d);
    if (d === "next") setTrail((t) => [...t, screen]);
    setScreen(to);
  };
  const back = () => {
    const prev = trail[trail.length - 1];
    if (!prev || prev === "code" || prev === "email") {
      router.push("/");
      return;
    }
    setTrail((t) => t.slice(0, -1));
    setDir("back");
    setScreen(prev);
  };
  const nextOf = (id: StepId): Screen => {
    const i = steps.findIndex((s) => s.id === id);
    const nxt = steps[i + 1]?.id;
    // while editing from the review, jump back, unless a change opened a follow-up that still needs an answer
    if (editing) return nxt === "q11" && !a.slowed ? "q11" : nxt === "q12" && !a.reasons?.length ? "q12" : "review";
    return nxt ?? "review";
  };
  const advance = () => go(nextOf(screen as StepId));
  const skip = (patch: Partial<Answers>) => {
    setAnswers(patch);
    advance();
  };
  const edit = (to: StepId) => {
    setEditing(true);
    go(to, "back");
  };

  const pick1 = (key: keyof Answers) => (v: string) => setAnswers({ [key]: a[key] === v ? undefined : v } as Partial<Answers>);
  const pickMany = (key: "good" | "hard" | "reasons", none: string, limit: number) => (v: string) => {
    const cur = a[key] ?? [];
    if (v === none) return setAnswers({ [key]: cur.includes(none) ? [] : [none] });
    const base = cur.filter((x) => x !== none);
    setAnswers({ [key]: base.includes(v) ? base.filter((x) => x !== v) : [...base, v].slice(0, limit) });
  };

  const sendCode = async (resend = false) => {
    if (busy) return;
    setBusy(true);
    setSendError(null);
    const r = await requestCode(email);
    setBusy(false);
    if (!r.ok) {
      if (resend) setCodeError(r.error);
      else setSendError(r.error);
      return;
    }
    setCode("");
    setCodeError(null);
    setTries(3);
    setResendIn(42);
    if (!resend) go("code");
  };
  const verify = async () => {
    if (busy) return;
    setBusy(true);
    const r = await verifyCode(email, code);
    setBusy(false);
    if (!r.ok) {
      const left = tries - 1;
      setTries(left);
      setCodeError(left > 0 ? `${r.error} ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many tries. Ask for a new code, or wait a few minutes.");
      return;
    }
    setTrail([]);
    go(draftSummary(r.draft).hasDraft ? "returning" : "intro");
  };

  const send = async () => {
    if (busy || !userId) return;
    setBusy(true);
    try {
      await addStory(a, userId, publish === true);
      reset();
      setTrail([]);
      setEditing(false);
      go("sent");
    } catch {
      go("error");
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) return <div className="sf min-h-dvh" />;

  /* ───────── per-screen content ───────── */

  const H = (text: React.ReactNode, size = "") => (
    <h1 ref={headingRef} tabIndex={-1} className={`sf-q ${size || "md:text-[38px] lg:text-[46px] lg:leading-[1.02]"}`}>
      {text}
    </h1>
  );
  const eb = (t: string) => <span className="sf-eb">{t}</span>;
  const hp = (t: React.ReactNode) => <p className="sf-hp md:text-[18px] md:leading-7">{t}</p>;

  type View = {
    lead: React.ReactNode;
    body?: React.ReactNode;
    next?: { label: React.ReactNode; onClick: () => void; disabled?: boolean } | null;
    skip?: () => void;
    extra?: React.ReactNode;
    noBack?: boolean;
    exit?: "save" | "close" | null;
    centre?: boolean;
  };
  let v: View;
  const otherMissing = (list: string[] | undefined, text: string | undefined) => Boolean(list?.includes(OTHER) && !text?.trim());

  switch (screen) {
    case "email": {
      const ok = /^\S+@\S+\.\S{2,}$/.test(email.trim());
      v = {
        noBack: true,
        exit: "close",
        lead: (
          <>
            {H("First things first.", "text-[36px] md:text-[48px] lg:text-[64px] lg:leading-none")}
            {hp("Enter your email so you can save your story and pick up where you left off. We’ll also use it to send updates about your submission. Your email will never appear alongside your published story.")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-2">
            <label htmlFor="sf-email" className="text-[15px] font-bold leading-5">
              Email address
            </label>
            <input
              id="sf-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`sf-in md:min-h-[60px] md:text-[18px] ${email && !ok ? "er" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ok && sendCode()}
            />
            {email && !ok ? (
              <p className="sf-err">That email doesn’t look right. Check for typos.</p>
            ) : sendError ? (
              <p className="sf-err" role="alert">{sendError}</p>
            ) : (
              <p className="sf-sm">
                Next, we’ll send you a 6-digit code.{" "}
                <Link href="/privacy" className="underline underline-offset-[3px]">
                  How we handle your data
                </Link>
              </p>
            )}
          </div>
        ),
        next: { label: busy ? "Sending…" : <>Continue {ARROW}</>, onClick: () => sendCode(), disabled: !ok || busy },
      };
      break;
    }

    case "code": {
      const masked = email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");
      v = {
        exit: null,
        lead: (
          <>
            {H("Check your inbox.")}
            {hp(`We sent a 6-digit code to ${masked}. It works for 10 minutes.`)}
          </>
        ),
        body: (
          <div className="flex flex-col gap-3.5">
            <label htmlFor="sf-code" className="sr-only">
              6-digit code
            </label>
            <input
              id="sf-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`sf-in max-w-[320px] text-center text-[24px] font-extrabold tracking-[0.6em] ${codeError ? "er" : ""}`}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setCodeError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && tries > 0 && verify()}
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? "sf-code-err" : undefined}
            />
            {codeError && (
              <p id="sf-code-err" className="sf-err" role="alert">
                {codeError}
              </p>
            )}
            <p className="sf-sm">
              {resendIn > 0 ? (
                `Didn’t get it? Resend in 0:${String(resendIn).padStart(2, "0")}`
              ) : (
                <button type="button" className="underline underline-offset-[3px]" onClick={() => sendCode(true)}>
                  Send a new code
                </button>
              )}
            </p>
            <button type="button" className="sf-lk self-start pl-0" onClick={() => go("email", "back")}>
              Use a different email
            </button>
          </div>
        ),
        next: { label: busy ? "Checking…" : "Verify", onClick: verify, disabled: code.length !== 6 || tries <= 0 || busy },
      };
      break;
    }

    case "returning": {
      const { answered, total } = draftSummary(draft);
      v = {
        noBack: true,
        exit: "close",
        centre: true,
        lead: (
          <>
            {H("Pick up where you left off?")}
            <div className="sf-card">
              {eb("YOUR DRAFT")}
              <b className="text-[17px]">{storyTitle(a)}</b>
              <span className="sf-sm">
                {answered} of {total} answered · saved {daysAgo(draft.updatedAt)}
              </span>
            </div>
            <p className="sf-sm">Everything you wrote is still here.</p>
          </>
        ),
        next: { label: "Keep going", onClick: () => go(draft.step) },
        extra: (
          <button
            type="button"
            className="sf-lk"
            onClick={() => {
              if (window.confirm("Start a new story? Your unfinished draft will be deleted.")) {
                reset();
                go("intro");
              }
            }}
          >
            Start a new story
          </button>
        ),
      };
      break;
    }

    case "intro":
      v = {
        noBack: true,
        lead: (
          <>
            {H("One experience. Your words.", "text-[34px] md:text-[42px] lg:text-[52px] lg:leading-none")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            {[
              ["ABOUT 5-7 MINUTES", "A few quick taps, then your story in your own words."],
              ["NO NAMES, EVER", "Leave out names, handles and anything that could point to someone."],
              ["A REAL PERSON READS IT", "Nothing is shared until our team has reviewed it."],
            ].map(([t, d]) => (
              <div key={t} className="sf-card">
                {eb(t)}
                <span>{d}</span>
              </div>
            ))}
            <label className="sf-chk">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
              <span>I’m 18 or older</span>
            </label>
            <button type="button" className="sf-lk self-start p-0 text-[14px] font-normal text-[var(--mu)]" onClick={() => go("under18")}>
              I’m under 18
            </button>
          </div>
        ),
        next: { label: <>Let’s go {ARROW}</>, onClick: () => go("q1"), disabled: !adult },
      };
      break;

    case "under18":
      v = {
        exit: null,
        centre: true,
        lead: (
          <>
            {H("This one’s for 18+.")}
            {hp("GATHER is for people 18 and over. Come back when you’re 18. We’ll still be here.")}
          </>
        ),
        next: { label: "Back to home", onClick: () => router.push("/") },
      };
      break;

    case "q1":
      v = {
        noBack: true,
        lead: (
          <>
            {H("What kind of connection was it?")}
            <Kind>No label is the wrong one here. Whatever it was, it counts.</Kind>
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <Choice
              label="What kind of connection was it?"
              options={TYPES}
              value={a.type}
              onPick={(o) => {
                const fresh = { type: o } as Partial<Answers>;
                // a different kind of connection has different "where things stand" options
                if (a.status && !statusOptions({ ...a, type: o }).includes(a.status)) Object.assign(fresh, { status: undefined, slowed: undefined, reasons: undefined, reasonOther: undefined });
                setAnswers(fresh);
              }}
            />
            {a.type === OTHER && (
              <OtherField id="type-other" label="How would you describe it?" value={a.typeOther ?? ""} onChange={(t) => setAnswers({ typeOther: t })} max={40} hint="A few words is enough. No names." />
            )}
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.type || (a.type === OTHER && !a.typeOther?.trim()) },
      };
      break;

    case "q2":
      v = {
        lead: (
          <>
            {H("Who was this connection with?")}
            <Kind>Every kind of connection is welcome here.</Kind>
            {hp("This helps us compare experiences fairly later on. We’ll never show it in a way that could point to anyone.")}
          </>
        ),
        body: <Choice label="Who was this connection with?" options={WITH} value={a.withGender} onPick={pick1("withGender")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.withGender },
      };
      break;

    case "q3":
      v = {
        lead: (
          <>
            {H("How did you meet?")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <Choice label="How did you meet?" options={MET} value={a.met} onPick={pick1("met")} wrap />
            {a.met === MET_OTHER && <OtherField id="met-other" label="Where did you meet?" value={a.metOther ?? ""} onChange={(t) => setAnswers({ metOther: t })} max={40} hint="A place or app is enough. No names." />}
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.met || (a.met === MET_OTHER && !a.metOther?.trim()) },
      };
      break;

    case "q4":
      v = {
        lead: (
          <>
            {H("How long were they part of your life?")}
          </>
        ),
        body: <Choice label="How long were they part of your life?" options={HOW_LONG} value={a.howLong} onPick={pick1("howLong")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.howLong },
      };
      break;

    case "q5":
      v = {
        lead: (
          <>
            {H("At the start, what were you hoping it would become?")}
          </>
        ),
        body: <Choice label="What were you hoping it would become?" options={HOPE} value={a.hope} onPick={pick1("hope")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.hope },
      };
      break;

    case "q6":
      v = {
        lead: (
          <>
            {H("And what did you think they wanted at the time?")}
            <div className="sf-safe">Your best guess back then. We know you can’t know for sure.</div>
            {a.hope && (
              <div className="sf-card mt-2 hidden lg:flex">
                {eb("YOU SAID YOU HOPED FOR")}
                <b className="text-[17px]">{a.hope}</b>
              </div>
            )}
          </>
        ),
        body: <Choice label="What did you think they wanted?" options={THOUGHT} value={a.thought} onPick={pick1("thought")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.thought },
      };
      break;

    case "q7": {
      const len = (a.story ?? "").trim().length;
      v = {
        lead: (
          <>
            {eb("IN YOUR OWN WORDS")}
            {H("Tell us what happened.", "md:text-[38px] lg:text-[42px]")}
            {hp("Start anywhere. Tell us about the good, the bad, the confusing bits, or all of it. Please don’t include names or details that could identify anyone.")}
            <Kind>This is a judgement-free space. Sweet, messy, confusing: all of it belongs here.</Kind>
          </>
        ),
        body: (
          <div className="flex flex-col gap-2">
            <label htmlFor="story" className="sr-only">
              Your story
            </label>
            <textarea
              id="story"
              rows={10}
              maxLength={STORY_MAX}
              className="sf-in min-h-[210px] md:min-h-[300px] md:text-[18px] md:leading-[30px]"
              value={a.story ?? ""}
              onChange={(e) => setAnswers({ story: e.target.value })}
              aria-describedby="story-cn"
            />
            <NameWarning text={a.story ?? ""} />
            <span id="story-cn" className="sf-cn">
              {len < STORY_MIN ? `A COUPLE OF SENTENCES IS ENOUGH · ${len} / ${STORY_MIN}` : `${len.toLocaleString("en-IN")} / ${STORY_MAX.toLocaleString("en-IN")}`}
            </span>
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: len < STORY_MIN },
      };
      break;
    }

    case "q8":
    case "q9": {
      const good = screen === "q8";
      const key = good ? "good" : "hard";
      const none = good ? NOTHING_GOOD : NOTHING_HARD;
      const list = a[key] ?? [];
      const n = list.filter((x) => x !== none).length;
      const otherKey = good ? "goodOther" : "hardOther";
      v = {
        lead: (
          <>
            {eb(`UP TO 3${n ? ` · ${n} PICKED` : ""}`)}
            {H(good ? "What felt good?" : "What made it hard?")}
            {!good && <Kind>The hard parts are part of the story. Nobody here is judging.</Kind>}
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <Choice label={good ? "What felt good" : "What made it hard"} options={good ? GOOD : HARD} value={list} onPick={pickMany(key, none, 3)} wrap disabled={() => n >= 3} />
            {list.includes(OTHER) && (
              <OtherField id={`${key}-other`} label="In a few words" value={(a[otherKey] as string) ?? ""} onChange={(t) => setAnswers({ [otherKey]: t } as Partial<Answers>)} max={60} />
            )}
            {n >= 3 && <p className="sf-sm">That’s 3. Tap one to swap it out.</p>}
            <div className="border-t-2 border-dashed border-[var(--soft)] pt-3">
              <Choice label="Or" options={[none]} value={list} onPick={pickMany(key, none, 3)} wrap />
              <p className="sf-sm mt-1.5">Picking this clears your other choices.</p>
            </div>
          </div>
        ),
        // required: "Nothing really" / "Nothing major" is the honest way out
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !list.length || otherMissing(list, a[otherKey] as string) },
      };
      break;
    }

    case "q10":
      v = {
        lead: (
          <>
            {H("Where do things stand now?")}
            <Kind>However it turned out, there’s no wrong answer.</Kind>
          </>
        ),
        body: (
          <Choice
            label="Where do things stand now?"
            options={statusOptions(a)}
            value={a.status}
            onPick={(o) => setAnswers({ status: a.status === o ? undefined : o, slowed: undefined, reasons: undefined, reasonOther: undefined })}
          />
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.status },
      };
      break;

    case "q11":
      v = {
        lead: (
          <>
            {H("Roughly when did you notice things slowing down?")}
            {hp("A rough guess is fine.")}
          </>
        ),
        body: <Choice label="When did things slow down?" options={SLOWED} value={a.slowed} onPick={pick1("slowed")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.slowed },
      };
      break;

    case "q12": {
      const list = a.reasons ?? [];
      const n = list.filter((x) => x !== NOT_SURE).length;
      v = {
        lead: (
          <>
            {eb(`UP TO 2${n ? ` · ${n} PICKED` : ""}`)}
            {H(hasFaded(a) ? "Why do you think it faded?" : "What do you think contributed to it ending?")}
            <Kind>Your view. We know there are two sides, and nobody here is keeping score.</Kind>
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <Choice label="Reasons" options={REASONS} value={list} onPick={pickMany("reasons", NOT_SURE, 2)} wrap disabled={() => n >= 2} />
            {list.includes(OTHER) && <OtherField id="reason-other" label="In a few words" value={a.reasonOther ?? ""} onChange={(t) => setAnswers({ reasonOther: t })} max={60} />}
            <div className="border-t-2 border-dashed border-[var(--soft)] pt-3">
              <Choice label="Or" options={[NOT_SURE]} value={list} onPick={pickMany("reasons", NOT_SURE, 2)} wrap />
              <p className="sf-sm mt-1.5">Picking this clears your other choices.</p>
            </div>
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !list.length || otherMissing(list, a.reasonOther) },
      };
      break;
    }

    case "q13":
      v = {
        lead: (
          <>
            {eb("OPTIONAL")}
            {isOngoing(a)
              ? H("So far, what’s something you’ve figured out that you didn’t know at the start?", "md:text-[34px] lg:text-[40px]")
              : H("Looking back, what do you understand now that you didn’t at the time?", "md:text-[34px] lg:text-[40px]")}
            {hp(isOngoing(a) ? "Only if something comes to mind. It’s still being written." : "Only if something comes to mind. Not every story needs a lesson.")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-2">
            <label htmlFor="reflection" className="sr-only">
              Your reflection
            </label>
            <textarea id="reflection" rows={5} maxLength={280} className="sf-in min-h-[150px]" value={a.reflection ?? ""} placeholder="Write as much or as little as you like" onChange={(e) => setAnswers({ reflection: e.target.value })} />
            <NameWarning text={a.reflection ?? ""} />
            <span className="sf-cn">{(a.reflection ?? "").length} / 280</span>
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance },
        skip: () => skip({ reflection: undefined }),
      };
      break;

    case "about": {
      const groups: [string, keyof Answers, string[]][] = [
        ["Your age", "age", AGES],
        ["Your gender", "gender", GENDERS],
        ["Where you’re based", "region", REGIONS],
      ];
      v = {
        lead: (
          <>
            {eb("OPTIONAL")}
            {H("A little about you")}
            <p className="sf-sm">So we can describe who’s sharing. Skip anything.</p>
          </>
        ),
        body: (
          <div className="flex flex-col gap-5">
            {groups.map(([label, key, opts]) => (
              <div key={key} className="flex flex-col gap-2">
                <span className="text-[15px] font-bold leading-5">{label}</span>
                <Choice label={label} options={opts} value={a[key] as string | undefined} onPick={pick1(key)} wrap />
              </div>
            ))}
          </div>
        ),
        next: { label: <>Review my story {ARROW}</>, onClick: advance },
        skip: () => skip({ age: undefined, gender: undefined, region: undefined }),
      };
      break;
    }

    case "review": {
      const names = spotNames(`${a.story ?? ""} ${a.reflection ?? ""}`).length;
      const join = (xs: (string | undefined)[]) => xs.filter(Boolean).join(" · ");
      const withOther = (list: string[] | undefined, other: string | undefined) => (list ?? []).map((x) => (x === OTHER ? other || OTHER : x));
      const rows: [string, string, StepId][] = [
        ["The connection", join([a.type === OTHER ? a.typeOther : a.type, a.withGender?.toLowerCase(), a.met === MET_OTHER ? a.metOther : a.met, a.howLong]), "q1"],
        ["At the start", join([a.hope && `Hoped: ${a.hope.toLowerCase()}`, a.thought && `Thought they wanted: ${a.thought.toLowerCase()}`]), "q5"],
        ["What stood out", join([withOther(a.good, a.goodOther).join(", ") || "Not answered", withOther(a.hard, a.hardOther).join(", ") || "Not answered"]), "q8"],
        ["How it went", join([a.status, a.slowed, withOther(a.reasons, a.reasonOther).join(", ")]), "q10"],
        [isOngoing(a) ? "So far" : "Looking back", a.reflection?.trim() ? "Added" : "Skipped", "q13"],
        ["About you", join([a.age, a.gender, a.region]) || "Skipped", "about"],
      ];
      v = {
        lead: (
          <>
            {eb("ALMOST DONE")}
            {H("Here’s your story.", "text-[28px] md:text-[38px] lg:text-[44px]")}
            <div className="sf-card gap-2">
              {eb("YOUR STORY")}
              <p className="m-0 max-h-[260px] overflow-y-auto whitespace-pre-line text-[15px] leading-[23px] [overflow-wrap:anywhere]">
                <Highlight text={a.story ?? ""} />
              </p>
              {names > 0 && <span className="sf-sm text-brief-lilac">{names} possible name{names > 1 ? "s" : ""} highlighted</span>}
              <button type="button" className="sf-lk self-start px-0 py-1" onClick={() => edit("q7")}>
                Edit story
              </button>
            </div>
          </>
        ),
        body: (
          <div>
            {rows.map(([t, val, to]) => (
              <div key={t} className="flex items-start justify-between gap-3 border-t-2 border-[var(--soft)] py-3">
                <span className="min-w-0">
                  <b className="text-[15px]">{t}</b>
                  <span className="sf-sm block [overflow-wrap:anywhere]">{val || "Not answered"}</span>
                </span>
                <button type="button" className="sf-lk px-0 py-1" onClick={() => edit(to)} aria-label={`Edit ${t.toLowerCase()}`}>
                  {val === "Skipped" ? "Add" : "Edit"}
                </button>
              </div>
            ))}
          </div>
        ),
        next: { label: <>Continue {ARROW}</>, onClick: () => { setEditing(false); go("consent"); } },
      };
      break;
    }

    case "consent":
      v = {
        lead: (
          <>
            {eb("LAST STEP")}
            {H("How can we use your story?", "text-[28px] md:text-[38px] lg:text-[44px]")}
            {hp("When you publish, your story helps someone going through the same thing feel a little less alone.")}
            <div className="sf-safe">
              Your email is never shown with your story, and our team removes names and identifying details before anything goes live. You can take it down anytime.
            </div>
          </>
        ),
        body: (
          <div className="flex flex-col gap-3.5">
            <div role="radiogroup" aria-label="How can we use your story?" className="flex flex-col gap-3">
              {[
                [true, "Publish my story anonymously, after review.", "Share your story and selected answers so others can learn from it. Our team reads it first and takes out anything that could identify you or anyone else."],
                [false, "Use my answers in insights only.", "Your story isn’t published. Your answers are counted in the totals."],
              ].map(([val, t, d]) => (
                <button key={String(val)} type="button" role="radio" aria-checked={publish === val} className={`sf-radio ${val ? "" : "py-3"}`} onClick={() => setPublish(val as boolean)}>
                  <span>
                    {val && <span className="sf-eb mb-1.5 block text-[var(--ac)]">HELPS OTHERS MOST</span>}
                    <b>{t as string}</b>
                    {d as string}
                  </span>
                </button>
              ))}
            </div>
            <label className="sf-chk mt-1">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              <span>I understand a real person will read this and may edit or remove details that could identify anyone.</span>
            </label>
          </div>
        ),
        next: { label: busy ? "Sending…" : "Send my story", onClick: send, disabled: publish === null || !ack || busy },
      };
      break;

    case "saved":
      v = {
        exit: null,
        centre: true,
        lead: (
          <>
            {H("Saved.")}
            {hp("Your answers are saved to your account. Sign in on any device and you’ll pick up right where you left off.")}
          </>
        ),
        next: { label: "Back to GATHER", onClick: () => router.push("/") },
        extra: (
          <button type="button" className="sf-lk" onClick={() => go(draft.step, "back")}>
            Keep going instead
          </button>
        ),
      };
      break;

    case "error":
      v = {
        centre: true,
        lead: (
          <>
            {H("Ugh, that didn’t go through.")}
            {hp("Your answers are still saved. Nothing’s lost. Check your connection and try again.")}
          </>
        ),
        next: { label: busy ? "Sending…" : "Try again", onClick: send, disabled: busy },
      };
      break;

    case "sent":
    default:
      v = {
        noBack: true,
        exit: "close",
        centre: true,
        lead: (
          <>
            {H("Your story is with us.", "text-[38px] md:text-[48px] lg:text-[60px] lg:leading-[0.98]")}
            <p className="sf-hp text-[17px] leading-[26px] text-[var(--fg)] lg:text-[18px] lg:leading-7">Thanks for sharing. Our team will read it before anything is used. Nothing is published until then.</p>
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <div className="sf-card sf-tl gap-3.5 p-4 lg:p-6">
              {[
                ["Received", "Just now", true],
                ["Being reviewed", "Usually 2-3 days", false],
                ["Check anytime", "Sign in to see where it is", false],
              ].map(([t, d, on]) => (
                <div key={t as string}>
                  <i className={on ? "on" : ""} aria-hidden />
                  <span>
                    <b>{t as string}</b>
                    {d as string}
                  </span>
                </div>
              ))}
            </div>
            <p className="sf-sm">
              Changed your mind?{" "}
              <Link href="/take-down" className="underline underline-offset-[3px]">
                Take your story down
              </Link>{" "}
              anytime.
            </p>
            <FeedbackCard />
          </div>
        ),
        next: { label: "Back to GATHER", onClick: () => router.push("/") },
      };
  }

  /* ───────── chrome ───────── */
  const stepDef = STEPS.find((s) => s.id === screen);
  const label = stepDef ? sectionLabel(a, stepDef.id) : "";
  const progress = stepDef ? (
    <div className="flex items-center gap-3" aria-label={`Progress: ${label}`}>
      <div className="sf-tiles" aria-hidden>
        {SECTIONS.map((_, i) => (
          <i key={i} className={i < stepDef.section - 1 ? "d" : i === stepDef.section - 1 ? "c" : ""} />
        ))}
      </div>
      <span className="sf-eb">{label}</span>
    </div>
  ) : null;

  const signedInNow = Boolean(signedIn) && !["email", "code"].includes(screen);
  const exitKind = v.exit === undefined ? (signedInNow ? "save" : "close") : v.exit;
  const exitBtn =
    exitKind === null ? null : (
      <button
        type="button"
        onClick={exitKind === "close" || screen === "sent" ? () => router.push("/") : () => go("saved")}
        className="relative z-10 ml-auto min-h-[44px] rounded bg-[var(--bg)] px-3 py-2.5 text-[15px] font-semibold underline underline-offset-[3px]"
      >
        {exitKind === "close" ? "Close" : "Save & exit"}
      </button>
    );
  const showBack = !v.noBack && screen !== "sent";
  const backBtn = showBack ? (
    <button type="button" aria-label="Back" onClick={back} className="flex h-11 w-11 flex-none items-center justify-center rounded border-2 border-[var(--soft)] bg-[var(--sf)]">
      <IconArrowLeft />
    </button>
  ) : null;
  const nextBtn = v.next ? (
    <button type="button" className="sf-bt md:w-auto md:px-[34px]" onClick={v.next.onClick} disabled={v.next.disabled}>
      {v.next.label}
    </button>
  ) : null;
  const skipBtn = v.skip ? (
    <button type="button" className="sf-lk" onClick={v.skip}>
      Skip this one
    </button>
  ) : null;

  const writing = WRITING.includes(screen);
  const twoCol = !writing && v.body && !v.centre;

  return (
    <div className="sf relative flex min-h-dvh flex-col overflow-x-clip" style={{ ["--ac" as string]: "var(--color-brief-rani)" } as React.CSSProperties}>
      <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-[140px] w-[140px] rounded-bl-full bg-[var(--ac)] opacity-95 md:-right-[90px] md:-top-[90px] md:h-[220px] md:w-[220px] md:opacity-90" />

      {/* phones */}
      <header className="relative flex min-h-[44px] items-center gap-3 px-4 pt-[18px] md:hidden">
        {backBtn}
        <Link href="/" aria-label="GATHER home" className="text-[var(--fg)]">
          <Mark size={26} />
        </Link>
        {exitBtn}
      </header>
      {progress && <div className="relative mt-[18px] px-4 md:hidden">{progress}</div>}

      {/* tablet + desktop */}
      <header className="relative hidden items-center gap-5 border-b-2 border-[var(--soft)] px-8 py-5 md:flex lg:px-12 lg:py-[22px]">
        <Link href="/" aria-label="GATHER People Insights home" className="flex items-center gap-2.5 text-[18px] font-black leading-none [font-stretch:125%]">
          <Mark size={26} />
          GATHER <span className="font-semibold [font-stretch:100%]">People Insights</span>
        </Link>
        <div className="mx-auto">{progress}</div>
        {exitBtn}
      </header>

      <div key={screen} className={`relative flex flex-1 flex-col ${dir === "next" ? "sf-anim-next" : "sf-anim-back"} ${v.centre ? "justify-center" : ""}`}>
        <div
          className={
            writing
              ? "mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pb-6 pt-[26px] md:px-0 md:pt-14"
              : `flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-6 pt-[26px] md:px-16 md:pt-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-[72px] lg:px-24 ${twoCol ? "lg:items-start lg:pt-16" : "lg:items-center"}`
          }
        >
          <div className="flex flex-col gap-3.5 md:gap-4">{v.lead}</div>
          {v.body && <div className="flex flex-col gap-4">{v.body}</div>}
        </div>
      </div>

      {(nextBtn || skipBtn || v.extra) && (
        <footer className="sticky bottom-0 z-10 flex flex-col gap-1.5 bg-[var(--bg)] px-4 pb-[22px] pt-3.5 md:flex-row md:items-center md:gap-4 md:border-t-2 md:border-[var(--soft)] md:px-8 md:py-[18px] lg:px-12">
          {showBack && (
            <button type="button" className="sf-bt sec hidden md:flex md:w-auto md:px-6" onClick={back}>
              Back
            </button>
          )}
          <div className="order-2 flex flex-col md:order-none md:ml-auto md:flex-row md:items-center md:gap-4">
            {skipBtn}
            {v.extra}
          </div>
          <div className="order-1 md:order-none">{nextBtn}</div>
        </footer>
      )}
    </div>
  );
}
