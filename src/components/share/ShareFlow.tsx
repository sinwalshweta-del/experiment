"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mark } from "@/components/site/Mark";
import { useShareDraft, draftSummary, type Draft } from "@/lib/share/draft";
import {
  accentFor,
  AGES,
  GENDERS,
  GLAD,
  GREEN,
  HOW_LONG,
  MET,
  NA,
  NOW,
  OVERALL,
  RATING,
  RED,
  REGIONS,
  sectionLabel,
  spotNames,
  STATEMENTS,
  STEPS,
  storyTitle,
  THEIR_AGES,
  TYPES,
  visibleSteps,
  WHEN,
  WHO,
  type Answers,
  type StepId,
} from "@/lib/share/questions";
import { addStory, daysAgo, findDuplicate, type SentStory } from "@/lib/share/stories";

/**
 * The share flow, built from the approved Claude Design boards:
 * 13a (every screen, mobile), 13b (desktop 1440 + tablet 820) and
 * 13c (states, shell and motion). Charcoal base; the accent follows Q1.
 *
 * Mobile: back · mark · save & exit, progress under it, actions at the
 * bottom. Tablet + desktop: mark + full name · progress · save & exit, and a
 * pinned footer bar with back · skip · next. Desktop splits choice screens
 * into question (left) and answers (right); writing screens use one 760px
 * column.
 */

type Screen = "privacy" | "under18" | "returning" | StepId | "email" | "code" | "duplicate" | "error" | "sent";
type Dir = "next" | "back";

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
    <path d="M3 10h13M11 4l6 6-6 6" />
  </svg>
);

const WRITING: Screen[] = ["q11", "q12"];

/* ───────────────────────── small pieces ───────────────────────── */

function Chips({
  options,
  value,
  onPick,
  wrap = false,
  disabled,
  label,
}: {
  options: string[];
  value: string | string[] | undefined;
  onPick: (v: string) => void;
  wrap?: boolean;
  disabled?: (v: string) => boolean;
  label: string;
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

function Field({
  id,
  label,
  value,
  onChange,
  max,
  placeholder,
  area = false,
  tall = false,
  hint,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  area?: boolean;
  tall?: boolean;
  hint?: React.ReactNode;
}) {
  const over = value.length > max;
  const common = {
    id,
    value,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: `sf-in ${over ? "er" : ""}`,
    "aria-describedby": `${id}-cn`,
  };
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-[15px] font-bold leading-5">
          {label}
        </label>
      )}
      {area ? (
        <textarea {...common} rows={tall ? 10 : 5} className={`${common.className} ${tall ? "min-h-[210px] md:min-h-[300px] md:text-[18px] md:leading-[30px]" : "min-h-[150px]"}`} />
      ) : (
        <input {...common} type="text" />
      )}
      {hint}
      <span id={`${id}-cn`} className="sf-cn" style={over ? { color: "#FF8A8A" } : undefined}>
        {value.length.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
        {over && ` · trim ${value.length - max} character${value.length - max === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}

function NameWarning({ text }: { text: string }) {
  const names = spotNames(text);
  if (!names.length) return null;
  const list = names.map((n) => `“${n}”`).join(", ");
  return (
    <div className="sf-warn" role="status">
      {list} {names.length === 1 ? "looks like a name" : "look like names"}. Want to take {names.length === 1 ? "it" : "them"} out? Our review team will remove{" "}
      {names.length === 1 ? "it" : "them"} anyway.
    </div>
  );
}

function Preview({ children }: { children: React.ReactNode }) {
  return <p className="sf-sm border-l-[3px] border-[var(--soft)] pl-3">{children}</p>;
}

/* ───────────────────────── the flow ───────────────────────── */

export function ShareFlow() {
  const router = useRouter();
  const { draft, hydrated, setAnswers, setStep, reset } = useShareDraft();
  const a = draft.answers;
  const [screen, setScreen] = useState<Screen>("privacy");
  const [dir, setDir] = useState<Dir>("next");
  const [trail, setTrail] = useState<Screen[]>([]);
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [tries, setTries] = useState(3);
  const [resendIn, setResendIn] = useState(0);
  const [dupe, setDupe] = useState<SentStory | null>(null);
  const [sending, setSending] = useState(false);
  const [picked, setPicked] = useState<string | null>(null); // rating that just landed
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  const accent = accentFor(a.overall);
  const steps = useMemo(() => visibleSteps(a), [a]);

  // first screen: resume straight in (from the landing bar), offer the draft, or start fresh
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    const { hasDraft } = draftSummary(draft);
    const resume = new URLSearchParams(window.location.search).get("resume") === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasDraft && draft.step !== "privacy") setScreen(resume ? draft.step : "returning");
  }, [hydrated, draft]);

  // keep the draft pointing at the current question so it reopens there
  useEffect(() => {
    if (STEPS.some((s) => s.id === screen)) setStep(screen as StepId);
  }, [screen, setStep]);

  // move focus to each new screen's question, for keyboard and screen-reader users
  useEffect(() => {
    if (started.current) headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [screen]);

  // code resend countdown
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

  const nextStep = (from: StepId): Screen => {
    const i = steps.findIndex((s) => s.id === from);
    return steps[i + 1]?.id ?? "check";
  };
  const prevStep = (from: Screen): Screen | null => {
    const i = steps.findIndex((s) => s.id === from);
    if (i > 0) return steps[i - 1].id;
    if (from === "email") return "check";
    if (from === "code") return "email";
    return null;
  };
  const back = () => {
    const prev = trail[trail.length - 1] ?? prevStep(screen);
    if (!prev || prev === "returning") {
      router.push("/");
      return;
    }
    setTrail((t) => t.slice(0, -1));
    setDir("back");
    setScreen(prev);
  };
  const advance = () => go(nextStep(screen as StepId));
  const skip = (patch: Partial<Answers>) => {
    setAnswers(patch);
    advance();
  };
  const saveAndExit = () => router.push("/");

  const pick1 = (key: keyof Answers) => (v: string) => setAnswers({ [key]: a[key] === v ? undefined : v } as Partial<Answers>);
  const pickMany = (key: "green" | "red") => (v: string) => {
    const cur = a[key] ?? [];
    setAnswers({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v].slice(0, 3) });
  };

  const rate = (i: number, v: string) => {
    setAnswers({ ratings: { ...(a.ratings ?? {}), [STATEMENTS[i]]: v } });
    setPicked(v);
    // the tapped option fills and holds briefly so you see it land, then moves on
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      setPicked(null);
      go(nextStep(`q7-${i}` as StepId));
    }, reduce ? 0 : 180);
  };

  const send = (force = false) => {
    if (!force) {
      const d = findDuplicate(a);
      if (d) {
        setDupe(d);
        go("duplicate");
        return;
      }
    }
    setSending(true);
    try {
      addStory(a, email);
      reset();
      setTrail([]);
      go("sent");
    } catch {
      go("error");
    } finally {
      setSending(false);
    }
  };

  const verify = () => {
    // Preview: there is no email service yet, so any 6 digits pass except
    // 000000, which shows the "didn't match" state from the board.
    if (code === "000000") {
      const left = tries - 1;
      setTries(left);
      setCodeError(
        left > 0
          ? `That code didn't match. Check the latest email and try again. ${left} ${left === 1 ? "try" : "tries"} left.`
          : "Too many tries. Give it 10 mins or use a different email.",
      );
      return;
    }
    setCodeError(null);
    send();
  };

  if (!hydrated) return <div className="sf min-h-dvh" />;

  /* ───────── per-screen content: eyebrow + question (left) and answers (right) ───────── */

  const H = (text: React.ReactNode, size = "") => (
    <h1 ref={headingRef} tabIndex={-1} className={`sf-q ${size || "md:text-[38px] lg:text-[46px] lg:leading-[1.02]"}`}>
      {text}
    </h1>
  );
  const eb = (t: string) => <span className="sf-eb">{t}</span>;
  const REQ = eb("PICK ONE · REQUIRED");
  const OPT = eb("PICK ONE · OPTIONAL");

  type View = {
    lead: React.ReactNode; // eyebrow, question, helper
    body?: React.ReactNode; // answers
    next?: { label: React.ReactNode; onClick: () => void; disabled?: boolean } | null;
    skip?: () => void;
    noBack?: boolean;
    exit?: "save" | "close" | null;
    progress?: boolean;
    centre?: boolean; // vertically centred, used for short message screens
  };

  const writing = WRITING.includes(screen);
  let v: View;

  switch (screen) {
    case "privacy":
      v = {
        noBack: true,
        exit: "close",
        progress: false,
        lead: (
          <>
            {H("Your story, your call.", "text-[34px] md:text-[42px] lg:text-[52px] lg:leading-none")}
            <Preview>Preview: stories aren&apos;t sent anywhere yet. Anything you share stays in this browser.</Preview>
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            {[
              ["STAYS PRIVATE", "Your email. We only use it to tell you when your story's counted."],
              ["MIGHT BE SHOWN", "Numbers mixed in with loads of other stories. Maybe your advice, with nothing that points to you."],
              ["TOTALLY OPTIONAL", "Everything except 3 quick questions. Skip what you like."],
            ].map(([t, d]) => (
              <div key={t} className="sf-card">
                {eb(t)}
                <span>{d}</span>
              </div>
            ))}
            <p className="sf-sm">A real person reads every story and may remove anything that could identify someone.</p>
            <label className="sf-chk">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
              <span>I&apos;m 18 or older</span>
            </label>
            <button type="button" className="sf-lk self-start p-0 text-[14px] font-normal text-[var(--mu)]" onClick={() => go("under18")}>
              I&apos;m under 18
            </button>
          </div>
        ),
        next: { label: <>Let&apos;s go {ARROW}</>, onClick: () => go("q1"), disabled: !adult },
      };
      break;

    case "under18":
      v = {
        exit: null,
        progress: false,
        centre: true,
        lead: (
          <>
            {H("This one's for 18+.")}
            <p className="sf-hp">GATHER is for people 18 and over. Come back when you&apos;re 18. We&apos;ll still be here.</p>
          </>
        ),
        next: { label: "Back to home", onClick: () => router.push("/") },
      };
      break;

    case "returning": {
      const { answered, total } = draftSummary(draft);
      v = {
        noBack: true,
        exit: "close",
        progress: false,
        centre: true,
        lead: (
          <>
            {H("Pick up where you left off?")}
            <div className="sf-card">
              {eb("YOUR DRAFT")}
              <b className="text-[17px]">{storyTitle(a)}</b>
              <span className="sf-sm">
                {answered} of {total} answered · saved {daysAgo(new Date(draft.updatedAt).toISOString())}
              </span>
            </div>
            <p className="sf-sm">Drafts only live in this browser. Nothing&apos;s been sent yet.</p>
          </>
        ),
        next: { label: "Keep going", onClick: () => go(draft.step as Screen) },
        skip: undefined,
      };
      break;
    }

    case "q1":
      v = {
        lead: (
          <>
            {REQ}
            {H("So… how was it, overall?")}
            <p className="sf-hp md:text-[18px] md:leading-7">No wrong answer. This just sets the mood.</p>
          </>
        ),
        body: <Chips label="How was it, overall?" options={OVERALL} value={a.overall} onPick={(o) => setAnswers({ overall: o as Answers["overall"] })} />,
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.overall },
        noBack: true,
      };
      break;

    case "q2a":
      v = {
        lead: (
          <>
            {eb(a.overall === "Kinda rough" ? "RANT MODE · PICK ONE" : a.overall === "Honestly good" ? "CREDIT WHERE IT'S DUE · PICK ONE" : "PICK ONE · REQUIRED")}
            {H("Who are we talking about?")}
          </>
        ),
        body: (
          <Chips
            label="Who are we talking about?"
            options={WHO}
            value={a.who}
            onPick={(o) => setAnswers({ who: o, ...(o !== a.who ? { type: undefined, typeOther: undefined } : {}) })}
          />
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: !a.who },
      };
      break;

    case "q2b": {
      const opts = TYPES[a.who ?? ""] ?? [];
      v = {
        lead: (
          <>
            {REQ}
            {H("What were they to you?")}
            {a.who === "Someone romantic" && <p className="sf-hp md:text-[18px] md:leading-7">No judgement here. Every kind counts.</p>}
          </>
        ),
        body: (
          <div className="flex flex-col gap-5">
            <Chips label="What were they to you?" options={opts} value={a.type} onPick={pick1("type")} wrap={opts.length > 8} />
            {a.type === "Something else" && (
              <Field
                id="type-other"
                label="Ok, how would you put it?"
                value={a.typeOther ?? ""}
                onChange={(t) => setAnswers({ typeOther: t })}
                max={40}
                hint={<p className="sf-sm">Describe the situation, not the person. No names.</p>}
              />
            )}
          </div>
        ),
        next: {
          label: <>Next {ARROW}</>,
          onClick: advance,
          disabled: !a.type || (a.type === "Something else" && (!a.typeOther?.trim() || a.typeOther.length > 40)),
        },
      };
      break;
    }

    case "q3":
    case "q4":
    case "q5":
    case "q6": {
      const conf = {
        q3: { key: "met", q: "Where'd you two meet?", opts: MET, wrap: true, help: "" },
        q4: { key: "howLong", q: "How long were they in the picture?", opts: HOW_LONG, wrap: false, help: "" },
        q5: { key: "now", q: "And where are things now?", opts: NOW, wrap: false, help: "" },
        q6: { key: "when", q: "When did this start?", opts: WHEN, wrap: false, help: "So we can show what's happening now, not ten years ago." },
      }[screen] as { key: keyof Answers; q: string; opts: string[]; wrap: boolean; help: string };
      v = {
        lead: (
          <>
            {OPT}
            {H(conf.q)}
            {conf.help && <p className="sf-hp md:text-[18px] md:leading-7">{conf.help}</p>}
          </>
        ),
        body: <Chips label={conf.q} options={conf.opts} value={a[conf.key] as string | undefined} onPick={pick1(conf.key)} wrap={conf.wrap} />,
        next: { label: <>Next {ARROW}</>, onClick: advance },
        skip: () => skip({ [conf.key]: undefined } as Partial<Answers>),
      };
      break;
    }

    case "q7-0":
    case "q7-1":
    case "q7-2":
    case "q7-3":
    case "q7-4": {
      const i = Number(screen.slice(3));
      const cur = picked ?? a.ratings?.[STATEMENTS[i]];
      v = {
        lead: (
          <>
            {eb("TAP ONE · MOVES ON BY ITSELF")}
            {H(STATEMENTS[i])}
            <p className="sf-sm">{i + 1} of 5 statements</p>
          </>
        ),
        body: (
          <div role="radiogroup" aria-label={STATEMENTS[i]} className="sf-rt flex flex-col gap-2.5">
            {RATING.map((r) => (
              <button key={r.label} type="button" role="radio" aria-checked={cur === r.label} className="sf-ch md:min-h-[58px] md:text-[17px]" onClick={() => rate(i, r.label)}>
                {r.label}
                <span className="sf-pp" aria-hidden>
                  {Array.from({ length: 5 }, (_, k) => (
                    <i key={k} className={k < r.n ? "f" : ""} />
                  ))}
                </span>
              </button>
            ))}
            <button type="button" role="radio" aria-checked={cur === NA} className="sf-ch na" onClick={() => rate(i, NA)}>
              {NA}
            </button>
          </div>
        ),
        next: null,
        skip: () => {
          const r = { ...(a.ratings ?? {}) };
          delete r[STATEMENTS[i]];
          skip({ ratings: r });
        },
      };
      break;
    }

    case "q8":
    case "q9": {
      const g = screen === "q8";
      const key = g ? "green" : "red";
      const list = a[key] ?? [];
      const n = list.length;
      v = {
        lead: (
          <>
            {eb(n === 3 ? "UP TO 3 · 3 OF 3 PICKED" : n ? `UP TO 3 · ${n} PICKED` : "UP TO 3")}
            {H(g ? "Ok but what did they get right?" : "And the not-so-great part?")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <Chips label={g ? "What they got right" : "The not-so-great part"} options={g ? GREEN : RED} value={list} onPick={pickMany(key)} wrap disabled={() => n >= 3} />
            {n === 3 && <p className="sf-sm">That&apos;s 3. Tap one to swap it out.</p>}
            <Field
              id={`${key}-note`}
              label="Anything else? (optional)"
              placeholder="One line, no names"
              value={(g ? a.greenNote : a.redNote) ?? ""}
              onChange={(t) => setAnswers(g ? { greenNote: t } : { redNote: t })}
              max={140}
              hint={<NameWarning text={(g ? a.greenNote : a.redNote) ?? ""} />}
            />
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: ((g ? a.greenNote : a.redNote) ?? "").length > 140 },
        skip: g ? undefined : () => skip({ red: undefined, redNote: undefined }),
      };
      break;
    }

    case "q10":
      v = {
        lead: (
          <>
            {OPT}
            {H("Looking back, glad they were in your life?")}
            <p className="sf-hp md:text-[18px] md:leading-7">Hard things can still be worth it. Or not. Both are valid.</p>
          </>
        ),
        body: <Chips label="Glad they were in your life?" options={GLAD} value={a.glad} onPick={pick1("glad")} />,
        next: { label: <>Next {ARROW}</>, onClick: advance },
        skip: () => skip({ glad: undefined }),
      };
      break;

    case "q11": {
      const good = a.overall === "Honestly good";
      v = {
        lead: (
          <>
            {eb("OPTIONAL · NEVER PUBLISHED")}
            {H(good ? "Okay, tell us about them." : "Okay, spill. What happened?", "md:text-[38px] lg:text-[42px]")}
            <p className="sf-hp md:text-[18px] md:leading-7">
              {good ? "The moments that stuck. No names, no places. Just the good stuff." : "No names, no places, nothing that points to them. Just how it went."}
            </p>
          </>
        ),
        body: (
          <Field
            id="story"
            area
            tall
            value={a.story ?? ""}
            onChange={(t) => setAnswers({ story: t })}
            max={1000}
            placeholder={good ? "Start anywhere. Two lines is plenty." : "Start anywhere."}
            hint={<NameWarning text={a.story ?? ""} />}
          />
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: (a.story ?? "").length > 1000 },
        skip: () => skip({ story: undefined }),
      };
      break;
    }

    case "q12":
      v = {
        lead: (
          <>
            {eb("OPTIONAL · MIGHT GET SHARED")}
            {H("What would you tell someone going through the same thing?", "md:text-[38px] lg:text-[42px]")}
          </>
        ),
        body: (
          <div className="flex flex-col gap-3.5">
            <div className="sf-safe">This might get shared, with nothing that points to you. Keep it about the situation, not a whole group of people.</div>
            <Field id="advice" area value={a.advice ?? ""} onChange={(t) => setAnswers({ advice: t })} max={280} hint={<NameWarning text={a.advice ?? ""} />} />
          </div>
        ),
        next: { label: <>Next {ARROW}</>, onClick: advance, disabled: (a.advice ?? "").length > 280 },
        skip: () => skip({ advice: undefined }),
      };
      break;

    case "q13":
    case "q14": {
      const you = screen === "q13";
      const groups: [string, keyof Answers, string[]][] = you
        ? [
            ["Age", "age", AGES],
            ["Gender", "gender", GENDERS],
            ["Where you're based", "region", REGIONS],
          ]
        : [
            ["Their age", "theirAge", THEIR_AGES],
            ["Their gender", "theirGender", GENDERS],
          ];
      v = {
        lead: (
          <>
            {eb("ALL OPTIONAL")}
            {H(you ? "A bit about you" : "And them?")}
            <p className="sf-sm">
              {you
                ? "So we can say stuff like “25–34s said…”. We never show a group smaller than 25."
                : "Only used to compare groups, always both ways, once there are 50+ stories on each side."}
            </p>
          </>
        ),
        body: (
          <div className="flex flex-col gap-5">
            {groups.map(([label, key, opts]) => (
              <div key={key} className="flex flex-col gap-2">
                <span className="text-[15px] font-bold leading-5">{label}</span>
                <Chips label={label} options={opts} value={a[key] as string | undefined} onPick={pick1(key)} wrap />
              </div>
            ))}
          </div>
        ),
        next: { label: you ? <>Next {ARROW}</> : <>Check my answers {ARROW}</>, onClick: advance },
        skip: you ? undefined : () => skip({ theirAge: undefined, theirGender: undefined }),
      };
      break;
    }

    case "check": {
      const count = (keys: (keyof Answers)[]) =>
        keys.filter((k) => {
          const x = a[k];
          return Array.isArray(x) ? x.length : typeof x === "object" && x ? Object.keys(x).length : Boolean(x && String(x).trim());
        }).length;
      const ratings = Object.keys(a.ratings ?? {}).length;
      const words = count(["story", "advice"]);
      const names = spotNames(`${a.story ?? ""} ${a.advice ?? ""} ${a.greenNote ?? ""} ${a.redNote ?? ""}`).length;
      const who = a.age && a.age !== "Rather not say" ? `someone, ${a.age}` : "someone";
      const rows: [string, string, React.ReactNode, StepId][] = [
        ["The basics", "Edit", `${count(["overall", "who", "type", "met", "howLong", "now", "when"])} answers`, "q1"],
        ["How it went", "Edit", `${ratings + count(["green", "red", "glad"])} answers`, "q7-0"],
        [
          "In your words",
          names ? "Review" : "Edit",
          <>
            {words}
            {names > 0 && (
              <>
                {" "}
                · <span className="text-[#BDB2FF]">{names} POSSIBLE NAME{names > 1 ? "S" : ""}</span>
              </>
            )}
          </>,
          "q11",
        ],
        ["About you + them", "Edit", `${count(["age", "gender", "region", "theirAge", "theirGender"])} answers`, "q13"],
      ];
      v = {
        lead: (
          <>
            {H("Here's what could show up on GATHER", "text-[27px] md:text-[34px] lg:text-[40px]")}
            {a.advice?.trim() ? (
              <div className="sf-card" style={{ borderColor: "var(--ac)" }}>
                {eb("IF OUR REVIEW TEAM PICKS YOUR ADVICE")}
                <span className="text-[18px] font-extrabold leading-6 [font-stretch:112%] lg:text-[21px] lg:leading-7">“{a.advice.trim()}”</span>
                <span className="sf-sm">— {who}</span>
              </div>
            ) : null}
            <p className="sf-sm">Everything else only counts as numbers, mixed in with at least 24 other stories.</p>
          </>
        ),
        body: (
          <div className="flex flex-col gap-3">
            {eb("EVERYTHING YOU TOLD US · PRIVATE")}
            <div>
              {rows.map(([t, act, n, to]) => (
                <div key={t} className="flex items-center justify-between gap-2.5 border-b-2 border-[var(--soft)] py-2.5 lg:py-3.5">
                  <span>
                    <b className="text-base lg:text-[17px]">{t}</b>
                    <br />
                    <span className="sf-sm">{n}</span>
                  </span>
                  <button type="button" className="sf-lk px-0 py-1.5" onClick={() => go(to, "back")} aria-label={`${act} ${t.toLowerCase()}`}>
                    {act}
                  </button>
                </div>
              ))}
            </div>
            <label className="sf-chk mt-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I get that a real person will read this and may remove details that could identify anyone before it&apos;s used.</span>
            </label>
          </div>
        ),
        next: { label: "Send it", onClick: () => go("email"), disabled: !consent },
      };
      break;
    }

    case "email": {
      const ok = /^\S+@\S+\.\S{2,}$/.test(email.trim());
      v = {
        progress: false,
        lead: (
          <>
            {eb("LAST BIT, PROMISE")}
            {H("Where should we tell you when it's counted?")}
            <p className="sf-hp md:text-[18px] md:leading-7">We&apos;ll send a 6-digit code to check it&apos;s you. Your email is never shown or shared.</p>
          </>
        ),
        body: (
          <div className="flex flex-col gap-2">
            <label htmlFor="sf-email" className="text-[15px] font-bold leading-5">
              Email
            </label>
            <input
              id="sf-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={`sf-in ${email && !ok ? "er" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="sf-email-help"
            />
            {email && !ok && <p className="sf-err">That email doesn&apos;t look right. Check for typos.</p>}
            <p id="sf-email-help" className="sf-sm">It&apos;s also how you edit or take down your story later.</p>
            <Preview>Preview: codes aren&apos;t emailed yet, so any 6 digits will work on the next screen.</Preview>
          </div>
        ),
        next: {
          label: "Send me the code",
          onClick: () => {
            setCode("");
            setCodeError(null);
            setTries(3);
            setResendIn(42);
            go("code");
          },
          disabled: !ok,
        },
      };
      break;
    }

    case "code": {
      const masked = email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");
      v = {
        progress: false,
        lead: (
          <>
            {H("Check your inbox")}
            {!codeError && <p className="sf-hp md:text-[18px] md:leading-7">We sent a code to {masked}. It works for 10 mins.</p>}
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
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? "sf-code-err" : undefined}
            />
            {codeError ? (
              <>
                <p id="sf-code-err" className="sf-err" role="alert">
                  {codeError}
                </p>
                <button type="button" className="sf-lk self-start px-0" onClick={() => { setCode(""); setCodeError(null); setResendIn(42); }}>
                  Send a new code
                </button>
                <div className="sf-safe">Your answers are safe. Nothing&apos;s lost while you sort this.</div>
              </>
            ) : (
              <p className="sf-sm">
                {resendIn > 0 ? (
                  `Resend in 0:${String(resendIn).padStart(2, "0")}`
                ) : (
                  <button type="button" className="underline underline-offset-[3px]" onClick={() => setResendIn(42)}>
                    Send a new code
                  </button>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <button type="button" className="sf-lk pl-0" onClick={() => go("email", "back")}>
                Use a different email
              </button>
            </div>
          </div>
        ),
        next: {
          label: sending ? "Sending…" : codeError ? "Try again" : "Verify and send",
          onClick: codeError ? () => { setCode(""); setCodeError(null); } : verify,
          disabled: tries <= 0 || (!codeError && code.length !== 6) || sending,
        },
      };
      break;
    }

    case "duplicate":
      v = {
        progress: false,
        centre: true,
        lead: (
          <>
            {H("Wait, haven't we heard this one?")}
            {dupe && (
              <div className="sf-card">
                {eb(`SENT ${daysAgo(dupe.createdAt).toUpperCase()}`)}
                <b className="text-[17px]">{dupe.title}</b>
                <span className="sf-sm">Still being read</span>
              </div>
            )}
            <p className="sf-hp">If it&apos;s someone else, go for it. If it&apos;s the same person, you can update your first story instead.</p>
          </>
        ),
        next: { label: "It's someone else, send it", onClick: () => send(true) },
      };
      break;

    case "error":
      v = {
        progress: false,
        centre: true,
        lead: (
          <>
            {H("Ugh, that didn't go through.")}
            <p className="sf-hp">Looks like the connection dropped. Your answers are saved on this device.</p>
            <div className="sf-safe">Not sent yet. Nothing&apos;s lost.</div>
          </>
        ),
        next: { label: "Try again", onClick: () => send(true) },
      };
      break;

    case "sent":
    default:
      v = {
        noBack: true,
        exit: "close",
        progress: false,
        centre: true,
        lead: (
          <>
            {H("Your story is with us.", "text-[38px] md:text-[48px] lg:text-[60px] lg:leading-[0.98]")}
            <p className="sf-hp text-[17px] leading-[26px] text-[var(--fg)] lg:text-[18px] lg:leading-7">
              Thanks for sharing your experience. The GATHER team will review your story, and we&apos;ll email you when there&apos;s an update.
            </p>
            <Preview>Preview: this story was saved in this browser only. Nothing was sent.</Preview>
          </>
        ),
        body: (
          <div className="flex flex-col gap-4">
            <div className="sf-card sf-tl gap-3.5 p-4 lg:p-6">
              <div>
                <i className="on" aria-hidden />
                <span>
                  <b>Received</b>Just now
                </span>
              </div>
              <div>
                <i aria-hidden />
                <span>
                  <b>Being reviewed</b>Usually 2–3 days
                </span>
              </div>
              <div>
                <i aria-hidden />
                <span>
                  <b>We&apos;ll email you</b>When the review&apos;s done
                </span>
              </div>
            </div>
            <p className="sf-sm border-t-2 border-[var(--soft)] pt-3.5">If a collectible is appropriate for the story, we may send you one by email.</p>
          </div>
        ),
        next: { label: "Back to GATHER", onClick: () => router.push("/") },
      };
  }

  /* ───────── progress ───────── */
  const stepDef = STEPS.find((s) => s.id === screen);
  const showProgress = v.progress !== false && Boolean(stepDef);
  const label = stepDef ? sectionLabel(a, stepDef.id) : "";
  const tiles = stepDef
    ? Array.from({ length: 5 }, (_, i) => (i < stepDef.section - 1 ? "d" : i === stepDef.section - 1 ? "c" : ""))
    : [];
  const progress = showProgress ? (
    <div className="flex items-center gap-3" aria-label={`Progress: ${label}`}>
      <div className="sf-tiles" aria-hidden>
        {tiles.map((c, i) => (
          <i key={i} className={c} />
        ))}
      </div>
      <span className="sf-eb">{label}</span>
    </div>
  ) : null;

  const exitLabel = v.exit === undefined ? "save" : v.exit;
  const exitBtn =
    exitLabel === null ? null : (
      <button type="button" onClick={exitLabel === "close" ? () => router.push("/") : saveAndExit} className="ml-auto min-h-[44px] rounded px-3 py-2.5 text-[15px] font-semibold underline underline-offset-[3px]">
        {exitLabel === "close" ? "Close" : "Save & exit"}
      </button>
    );
  const backBtn = !v.noBack ? (
    <button type="button" aria-label="Back" onClick={back} className="flex h-11 w-11 flex-none items-center justify-center rounded border-2 border-[var(--soft)] bg-[var(--sf)]">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
        <path d="M16 10H4M9 4l-6 6 6 6" />
      </svg>
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
  const extra =
    screen === "returning" ? (
      <button type="button" className="sf-lk" onClick={() => { reset(); setTrail([]); go("q1"); }}>
        Start over
      </button>
    ) : screen === "duplicate" ? (
      <Link href="/take-down" className="sf-bt sec md:w-auto">
        See my stories
      </Link>
    ) : screen === "error" ? (
      <button type="button" className="sf-lk" onClick={saveAndExit}>
        Save and come back later
      </button>
    ) : null;

  const twoCol = !writing && v.body && !v.centre;

  return (
    <div className="sf relative flex min-h-dvh flex-col overflow-x-clip" style={{ ["--ac" as string]: accent } as React.CSSProperties}>
      {/* corner shape in the accent */}
      <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-[140px] w-[140px] rounded-bl-full bg-[var(--ac)] opacity-95 md:-right-[90px] md:-top-[90px] md:h-[220px] md:w-[220px] md:opacity-90" />

      {/* header: phones */}
      <header className="relative flex min-h-[44px] items-center gap-3 px-4 pt-[18px] md:hidden">
        {backBtn}
        <Link href="/" aria-label="GATHER home" className="text-[var(--fg)]">
          <Mark size={26} />
        </Link>
        {exitBtn && <div className="ml-auto rounded bg-[var(--bg)]">{exitBtn}</div>}
      </header>
      {progress && <div className="relative mt-[18px] px-4 md:hidden">{progress}</div>}

      {/* header: tablet + desktop */}
      <header className="relative hidden items-center gap-5 border-b-2 border-[var(--soft)] px-8 py-5 md:flex lg:px-12 lg:py-[22px]">
        <Link href="/" aria-label="GATHER People Insights home" className="flex items-center gap-2.5 text-[18px] font-black leading-none [font-stretch:125%]">
          <Mark size={26} />
          GATHER <span className="font-semibold [font-stretch:100%]">People Insights</span>
        </Link>
        <div className="mx-auto">{progress}</div>
        {exitBtn && <div className="rounded bg-[var(--bg)]">{exitBtn}</div>}
      </header>

      <main
        key={screen}
        className={`relative flex flex-1 flex-col ${dir === "next" ? "sf-anim-next" : "sf-anim-back"} ${v.centre ? "justify-center" : ""}`}
      >
        <div
          className={
            writing
              ? "mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pb-6 pt-[26px] md:px-0 md:pt-14"
              : twoCol
                ? "flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-6 pt-[26px] md:px-16 md:pt-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-[72px] lg:px-24 lg:pt-16"
                : "flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-6 pt-[26px] md:px-16 md:pt-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-[72px] lg:px-24"
          }
        >
          <div className="flex flex-col gap-3.5 md:gap-4">{v.lead}</div>
          {v.body && <div className="flex flex-col gap-4">{v.body}</div>}
        </div>
      </main>

      {/* actions: stacked on phones (pinned to the bottom), a footer bar from tablet up */}
      {(nextBtn || skipBtn || extra) && (
        <footer className="sticky bottom-0 z-10 flex flex-col gap-1.5 bg-[var(--bg)] px-4 pb-[22px] pt-3.5 md:flex-row md:items-center md:gap-4 md:border-t-2 md:border-[var(--soft)] md:px-8 md:py-[18px] lg:px-12">
          {!v.noBack && (
            <button type="button" className="sf-bt sec hidden md:flex md:w-auto md:px-6" onClick={back}>
              Back
            </button>
          )}
          <div className="order-2 flex flex-col md:order-none md:ml-auto md:flex-row md:items-center md:gap-4">
            {skipBtn}
            {extra}
          </div>
          <div className="order-1 md:order-none">{nextBtn}</div>
        </footer>
      )}
      {screen === "sent" && (
        <div className="hidden items-center justify-between border-t-2 border-[var(--soft)] px-12 py-3.5 text-sm text-[var(--mu)] lg:flex">
          <span />
          <span>
            <Link href="/take-down" className="underline underline-offset-[3px]">
              Take my story down
            </Link>{" "}
            · © 2026 GATHER
          </span>
        </div>
      )}
    </div>
  );
}

export type { Draft };
