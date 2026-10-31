"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Mark } from "@/components/site/Mark";
import { getMyStories, MyStory, shortDate, takeDown } from "@/lib/takedown";
import { useShareDraft } from "@/lib/share/draft";
import { supabase } from "@/lib/supabase";

/**
 * "Take my story down" (approved Claude Design board 11). Main flow:
 * start → confirm it's you → your stories → confirm → done, plus the edge
 * states: still being reviewed, already taken down, no stories found,
 * link expired, and something went wrong.
 */

type Step = "start" | "verify" | "list" | "none" | "confirm" | "review" | "already" | "done" | "expired" | "error";
type Tone = "paper" | "gold" | "dark";

const TONES: Record<Tone, { page: string; surface: string; muted: string; blob: string; line: string }> = {
  paper: { page: "bg-brief-paper text-brief-ink", surface: "bg-brief-white", muted: "text-[#5F5866]", blob: "bg-brief-lilac", line: "border-brief-ink" },
  gold: { page: "bg-brief-marigold text-brief-ink", surface: "bg-[#FFF8E8]", muted: "text-[#4A3A10]", blob: "bg-brief-rani", line: "border-brief-ink" },
  dark: { page: "bg-brief-ink text-brief-paper", surface: "bg-[#241D2B]", muted: "text-[#B4ACBA]", blob: "bg-brief-rani", line: "border-brief-paper" },
};

// Where "Report a concern" goes. Left empty until there is a real support inbox,
// so the links stay hidden rather than pointing nowhere.
const SUPPORT_EMAIL = "";
const concern = (label: string) =>
  SUPPORT_EMAIL ? (
    <a href={`mailto:${SUPPORT_EMAIL}?subject=Report%20a%20concern`} className={link}>
      {label}
    </a>
  ) : null;

const REASONS = ["Changed my mind", "Feels too identifiable", "Shared by mistake", "Something else"];

const btn = "inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded border-2 px-6 font-archivo text-[17px] font-bold";
const link = "min-h-[44px] p-2.5 text-center font-archivo text-[15px] font-semibold underline underline-offset-[3px]";

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
      <path d="M3 10h13M11 4l6 6-6 6" />
    </svg>
  );
}

type T = (typeof TONES)[Tone];

function H({ children, hRef }: { children: React.ReactNode; hRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <h1 ref={hRef} tabIndex={-1} className="m-0 font-archivo text-[30px] font-extrabold leading-[1.02] tracking-[-0.01em] outline-none [font-stretch:112%] sm:text-[36px]">
      {children}
    </h1>
  );
}
function P({ children, t, small = false }: { children: React.ReactNode; t: T; small?: boolean }) {
  return <p className={`m-0 ${small ? "text-[13px] leading-[19px]" : "text-base leading-6"} ${t.muted}`}>{children}</p>;
}
function Summary({ s, line, t }: { s: MyStory; line: string; t: T }) {
  return (
    <div className={`flex flex-col gap-0.5 border-2 border-l-[6px] border-l-brief-rani px-3.5 py-3 ${t.line} ${t.surface}`}>
      <b className="font-archivo text-[17px] font-extrabold leading-[22px]">{s.title}</b>
      <span className={`text-sm ${t.muted}`}>{line}</span>
    </div>
  );
}
function Primary({ children, onClick, t, tone, rani = false, disabled = false }: { children: React.ReactNode; onClick: () => void; t: T; tone: Tone; rani?: boolean; disabled?: boolean }) {
  const pink = rani || tone === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${btn} ${t.line} disabled:opacity-50 ${pink ? "bg-brief-rani text-brief-ink" : "bg-brief-peacock text-brief-paper"} ${tone === "dark" ? "shadow-[4px_4px_0_var(--color-brief-paper)]" : "shadow-[4px_4px_0_var(--color-brief-ink)]"}`}
    >
      {children}
    </button>
  );
}
function Secondary({ href, children, t }: { href: string; children: React.ReactNode; t: T }) {
  return (
    <Link href={href} className={`${btn} ${t.line} ${t.surface} shadow-[4px_4px_0_var(--color-brief-ink)]`}>
      {children}
    </Link>
  );
}

export default function TakeDownPage() {
  const [step, setStep] = useState<Step>("start");
  const [history, setHistory] = useState<Step[]>([]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stories, setStories] = useState<MyStory[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { userId, email: signedIn, requestCode, verifyCode } = useShareDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // links from our emails land here with ?link=expired once they've lapsed
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("link") === "expired") setStep("expired");
  }, []);

  // move focus to each new screen's heading so screen readers follow along
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };
  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setStep(prev);
    setHistory(history.slice(0, -1));
  };

  const story = stories.find((s) => s.id === picked) ?? null;
  const tone: Tone = step === "done" ? "gold" : step === "error" ? "dark" : "paper";
  const t = TONES[tone];
  const canBack = history.length > 0 && !["done", "start", "expired"].includes(step);

  const loadStories = async (uid: string) => {
    try {
      const mine = await getMyStories(uid);
      setStories(mine);
      setPicked(mine.find((s) => s.status !== "down")?.id ?? mine[0]?.id ?? null);
      go(mine.length ? "list" : "none");
    } catch {
      go("error");
    }
  };

  const start = () => (userId ? loadStories(userId) : go("verify"));

  const sendCode = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    const r = await requestCode(email);
    setBusy(false);
    if (!r.ok) return setAuthError(r.error);
    setCode("");
    setCodeSent(true);
  };
  const verify = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    const r = await verifyCode(email, code);
    setBusy(false);
    if (!r.ok) return setAuthError(r.error);
    await loadStories(r.userId);
  };

  const choose = () => {
    if (!story) return;
    go(story.status === "down" ? "already" : story.status === "review" ? "review" : "confirm");
  };

  const remove = async () => {
    if (!story || busy) return;
    setBusy(true);
    try {
      await takeDown(story.id, reason ?? undefined);
      // confirmation email (board 23, E4); it's a nice-to-have, so a failure doesn't block the flow
      void supabase().functions.invoke("send-story-email", { body: { story_id: story.id, kind: "taken_down" } }).catch(() => undefined);
      if (userId) setStories(await getMyStories(userId));
      go("done");
    } catch {
      go("error");
    } finally {
      setBusy(false);
    }
  };

  const tags: Record<MyStory["status"], [string, string]> = {
    live: ["COUNTED", "bg-brief-peacock text-brief-paper"],
    review: ["BEING REVIEWED", "bg-brief-marigold text-brief-ink"],
    down: ["TAKEN DOWN", "border-dashed bg-brief-paper text-[#5F5866]"],
  };

  let body: React.ReactNode;
  let foot: React.ReactNode;
  switch (step) {
    case "start":
    case "expired":
      body = (
        <>
          {step === "start" ? <H hRef={headingRef}>Take my story down</H> : <H hRef={headingRef}>That link has expired</H>}
          {step === "start" ? (
            <>
              <P t={t}>Changed your mind? That&apos;s completely fine. You can remove any story you&apos;ve shared, whenever you like. No reason needed.</P>
              <P t={t}>
                {signedIn ? <>You&apos;re signed in as <b className="[overflow-wrap:anywhere]">{signedIn}</b>, so we can show your stories straight away.</> : "Confirm the email you used and we’ll show you your stories."}
              </P>
            </>
          ) : (
            <P t={t}>For your privacy, links in our emails only work for 7 days, and only once. Confirm your email and you&apos;ll be back here in a minute.</P>
          )}
        </>
      );
      foot = (
        <>
          <Primary t={t} tone={tone} onClick={start}>{signedIn ? "Show my stories" : "Continue with my email"}</Primary>
          {step === "start" && <P t={t} small>Only you can see or remove your stories.</P>}
        </>
      );
      break;
    case "verify": {
      const emailOk = /\S+@\S+\.\S+/.test(email);
      body = (
        <>
          <H hRef={headingRef}>First, a quick check</H>
          <P t={t}>Use the email you shared your story with. We&apos;ll send you a 6-digit code.</P>
          <label htmlFor="td-email" className="m-0 text-[15px] font-bold">Email</label>
          <input
            id="td-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setCodeSent(false);
            }}
            className={`min-h-[52px] rounded border-2 px-3.5 text-base outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brief-peacock ${t.line} ${t.surface}`}
          />
          {codeSent && <label htmlFor="td-code" className="m-0 text-[15px] font-bold">Code from your email</label>}
          {codeSent && <input
            id="td-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6 digits"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className={`min-h-[56px] max-w-[240px] rounded border-2 px-3.5 font-archivo text-[22px] font-extrabold tracking-[0.5em] outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brief-peacock ${t.line} ${t.surface}`}
          />}
          {authError && <p role="alert" className="m-0 text-[15px] font-semibold text-[#B3123F]">{authError}</p>}
          {codeSent && !authError && <P t={t} small>Can&apos;t find it? Check spam or promotions.</P>}
        </>
      );
      foot = codeSent ? (
        <>
          <Primary t={t} tone={tone} onClick={verify} disabled={code.length !== 6 || busy}>{busy ? "Checking…" : "Verify"}</Primary>
          <button type="button" onClick={sendCode} className={link} disabled={busy}>Send a new code</button>
        </>
      ) : (
        <Primary t={t} tone={tone} onClick={sendCode} disabled={!emailOk || busy}>{busy ? "Sending…" : "Send me a code"}</Primary>
      );
      break;
    }
    case "list":
      body = (
        <>
          <H hRef={headingRef}>Which one?</H>
          <P t={t}>These are the stories shared with your email. Pick the one you want gone.</P>
          <div role="radiogroup" aria-label="Your stories" className="flex flex-col gap-3">
            {stories.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={picked === s.id}
                onClick={() => setPicked(s.id)}
                className={`flex flex-col gap-1.5 rounded border-2 px-4 py-3.5 text-left shadow-[4px_4px_0_var(--color-brief-ink)] ${t.line} ${t.surface} ${picked === s.id ? "outline-3 outline-offset-[3px] outline-brief-rani" : ""}`}
              >
                <span className="flex items-center justify-between gap-2.5">
                  <b className="font-archivo text-[17px] font-extrabold leading-[22px]">{s.title}</b>
                  <span className={`whitespace-nowrap border-2 border-brief-ink px-2 py-0.5 font-martian-mono text-xs font-semibold ${tags[s.status][1]}`}>{tags[s.status][0]}</span>
                </span>
                <span className={`text-sm ${t.muted}`}>Shared {shortDate(s.sharedAt)}</span>
              </button>
            ))}
          </div>
          <P t={t} small>We only show what you chose at the start, never what you wrote.</P>
        </>
      );
      foot = <Primary t={t} tone={tone} onClick={choose} disabled={!story}>Continue <Arrow /></Primary>;
      break;
    case "none":
      body = (
        <>
          <H hRef={headingRef}>No stories with this email</H>
          <P t={t}>We couldn&apos;t find anything shared with {email || "this email"}. Maybe you used a different email?</P>
        </>
      );
      foot = (
        <>
          <button type="button" onClick={back} className={`${btn} ${t.line} ${t.surface} shadow-[4px_4px_0_var(--color-brief-ink)]`}>Try another email</button>
          {concern("Need help? Report a concern")}
        </>
      );
      break;
    case "confirm":
    case "review":
      body = story && (
        <>
          {step === "confirm" ? <H hRef={headingRef}>Take this one down?</H> : <H hRef={headingRef}>This one hasn&apos;t gone live yet</H>}
          <Summary t={t} s={story} line={`Shared ${shortDate(story.sharedAt)} · ${step === "confirm" ? "counted in insights" : "being reviewed"}`} />
          {step === "confirm" ? (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[22px]">
              {[
                "Your answers stop counting in the insights straight away.",
                "If it was published, it comes down too.",
                "This can't be undone, but you can always share again.",
              ].map((li) => (
                <li key={li} className="relative pl-[26px] before:absolute before:left-0 before:top-1 before:h-3.5 before:w-3.5 before:rounded-tl-full before:bg-brief-peacock">{li}</li>
              ))}
            </ul>
          ) : (
            <P t={t}>Our team hasn&apos;t finished reading it. If you take it down now, it&apos;s withdrawn before it&apos;s ever used. Nothing counts, nothing shows.</P>
          )}
          {step === "confirm" && (
            <>
              <p className="m-0 text-[15px] font-bold">Want to tell us why? <span className={`font-normal ${t.muted}`}>(Optional, only our team sees it)</span></p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={reason === r}
                    onClick={() => setReason(reason === r ? null : r)}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded border-2 border-brief-ink pl-2.5 pr-3 font-archivo text-[15px] font-semibold shadow-[3px_3px_0_var(--color-brief-ink)] before:h-4 before:w-4 before:border-2 before:border-current ${reason === r ? "bg-brief-peacock text-brief-paper before:rounded-tl-full before:bg-current" : "bg-brief-white"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      );
      foot = (
        <>
          <Primary t={t} tone={tone} rani onClick={remove} disabled={busy}>{busy ? "Taking it down…" : step === "confirm" ? "Take it down" : "Withdraw it"}</Primary>
          <button type="button" onClick={back} className={link}>{step === "confirm" ? "Keep it up" : "Keep it in review"}</button>
        </>
      );
      break;
    case "already":
      body = story && (
        <>
          <H hRef={headingRef}>Already done</H>
          <Summary t={t} s={story} line={`Taken down ${story.downAt ? shortDate(story.downAt) : ""}`} />
          <P t={t}>This story is already down and no longer counts anywhere. There&apos;s nothing else you need to do.</P>
        </>
      );
      foot = <button type="button" onClick={back} className={`${btn} ${t.line} ${t.surface} shadow-[4px_4px_0_var(--color-brief-ink)]`}>See my other stories</button>;
      break;
    case "done":
      body = (
        <>
          <span className="text-brief-ink"><Mark size={64} /></span>
          <H hRef={headingRef}>Your story is down.</H>
          <P t={t}>Thanks for trusting us with it in the first place. Here&apos;s where things stand:</P>
          <div className="flex flex-col gap-3.5 rounded border-2 border-brief-ink bg-[#FFF8E8] p-4">
            {[
              ["Request received", "Saved on our side.", true],
              ["Removed from view", "It's out of our team's queue and off the site if it was published.", true],
              ["Out of the insights", "Your answers no longer count. Nothing for you to do.", true],
            ].map(([b, s, on]) => (
              <div key={b as string} className="flex gap-3 text-[15px] leading-[21px]">
                <i aria-hidden className={`mt-0.5 h-[18px] w-[18px] shrink-0 border-2 border-brief-ink ${on ? "rounded-tl-full bg-brief-ink" : ""}`} />
                <span><b className="block font-archivo text-base font-extrabold leading-[21px]">{b as string}</b>{s as string}</span>
              </div>
            ))}
          </div>
        </>
      );
      foot = (
        <>
          <Secondary t={t} href="/">Back to home</Secondary>
          {concern("Something else wrong? Report a concern")}
        </>
      );
      break;
    case "error":
      body = (
        <>
          <H hRef={headingRef}>That didn&apos;t go through</H>
          <P t={t}>Your story is still up. Nothing was changed. Give it another go in a moment.</P>
        </>
      );
      foot = (
        <>
          <Primary t={t} tone={tone} rani onClick={() => { back(); }}>Try again</Primary>
          {concern("Still stuck? Report a concern")}
        </>
      );
      break;
  }

  return (
    <div className={`relative flex min-h-dvh flex-col overflow-x-clip font-archivo ${t.page}`}>
      <div aria-hidden className={`pointer-events-none absolute -right-[70px] -top-[70px] h-[200px] w-[200px] rounded-bl-full border-2 md:-right-24 md:-top-24 md:h-[320px] md:w-[320px] ${t.blob} ${t.line}`} />
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col px-4 pb-10 pt-6 sm:pt-12">
        <div className="min-h-[44px]">
          {canBack && (
            <button type="button" aria-label="Back" onClick={back} className={`flex h-11 w-11 items-center justify-center rounded border-2 shadow-[3px_3px_0_currentColor] ${t.line} ${t.surface}`}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
                <path d="M17 10H4M9 4l-6 6 6 6" />
              </svg>
            </button>
          )}
        </div>
        <div aria-live="polite" className="mt-6 flex flex-col gap-3.5">{body}</div>
        <div className="mt-8 flex flex-col gap-2">{foot}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
