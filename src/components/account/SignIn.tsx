"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { draftSummary, useShareDraft } from "@/lib/share/draft";
import { storyTitle } from "@/lib/share/questions";
import { daysAgo, getStories } from "@/lib/share/stories";

/**
 * Account access (Claude Design board 19, S1/S2): email, then the same
 * 6-digit code as the share flow. New people find "Sign up" right there;
 * both paths are the same email + code, only the words change.
 *
 * No backend yet: the code is a labelled preview (any 6 digits work,
 * 000000 shows the error) and the account lives in this browser.
 */

type Step = "email" | "code" | "in";
type Mode = "signin" | "signup";

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
    <path d="M3 10h13M11 4l6 6-6 6" />
  </svg>
);

const h1 = "m-0 text-[44px] font-black leading-[0.94] tracking-[-0.02em] [font-stretch:125%] outline-none sm:text-[56px] lg:text-[72px]";
const lead = "m-0 max-w-[520px] text-[17px] leading-[1.55] text-[#2A2430] md:text-[19px]";
const input =
  "min-h-[56px] w-full max-w-[440px] rounded border-2 border-brief-ink bg-brief-white px-4 font-archivo text-[17px] text-brief-ink outline-none transition-shadow focus:shadow-[4px_4px_0_var(--color-brief-rani)]";
const small = "m-0 text-[15px] leading-[22px] text-[#5F5866]";
const textBtn = "font-semibold text-brief-ink underline underline-offset-[3px]";

export function SignIn() {
  const { hydrated, email: signedIn, draft, signIn, signOut } = useShareDraft();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(3);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: true });
    moved.current = true;
  }, [step, mode]);

  if (!hydrated) return <Shell />;

  const current: Step = signedIn && step !== "code" ? "in" : step;
  const ok = /^\S+@\S+\.\S{2,}$/.test(email.trim());

  const sendCode = () => {
    setCode("");
    setError(null);
    setTries(3);
    setStep("code");
  };
  const verify = () => {
    if (code === "000000") {
      const left = tries - 1;
      setTries(left);
      setError(left > 0 ? `That code didn’t match. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many tries. Wait 10 minutes or use a different email.");
      return;
    }
    signIn(email);
    setStep("in");
  };

  let body: React.ReactNode;

  if (current === "email") {
    const up = mode === "signup";
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className={h1}>
          {up ? "Create your account." : "Welcome back."}
        </h1>
        <p className={lead}>
          {up
            ? "Enter your email and we’ll send you a 6-digit code. That’s your account: no password to remember."
            : "Enter the email you used before and we’ll send you a 6-digit code. Your drafts and stories are waiting."}
        </p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (ok) sendCode();
          }}
        >
          <label htmlFor="si-email" className="text-[15px] font-bold leading-5">
            Email address
          </label>
          <input
            id="si-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(email) && !ok}
            aria-describedby="si-email-hint"
          />
          <p id="si-email-hint" className={small} aria-live="polite">
            {email && !ok ? "That email doesn’t look right. Check for typos." : "We’ll never show your email with your story."}
          </p>
          <button type="submit" disabled={!ok} className="landing-btn mt-2 w-full max-w-[440px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start">
            Send me a code {ARROW}
          </button>
        </form>
        <p className={small}>
          {up ? "Already have an account? " : "New to GATHER? "}
          <button type="button" className={textBtn} onClick={() => setMode(up ? "signin" : "signup")}>
            {up ? "Sign in" : "Sign up"}
          </button>
        </p>
      </>
    );
  } else if (current === "code") {
    const masked = email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className={h1}>
          Check your inbox.
        </h1>
        <p className={lead}>We sent a 6-digit code to {masked}. It works for 10 minutes.</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6 && tries > 0) verify();
          }}
        >
          <label htmlFor="si-code" className="text-[15px] font-bold leading-5">
            6-digit code
          </label>
          <input
            id="si-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className={`${input} max-w-[300px] text-center text-[24px] font-extrabold tracking-[0.6em]`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "si-code-err" : undefined}
          />
          {error && (
            <p id="si-code-err" role="alert" className="m-0 text-[15px] font-semibold text-[#B3123F]">
              {error}
            </p>
          )}
          <button type="submit" disabled={code.length !== 6 || tries <= 0} className="landing-btn mt-2 w-full max-w-[440px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start">
            {mode === "signup" ? "Create account" : "Sign in"} {ARROW}
          </button>
        </form>
        <button type="button" className={`${textBtn} self-start text-[15px]`} onClick={() => setStep("email")}>
          Use a different email
        </button>
        <p className="m-0 max-w-[520px] border-l-[3px] border-[#D9D2C4] pl-3 text-[14px] leading-[21px] text-[#5F5866]">
          Preview: emails aren’t connected yet, so any 6 digits will work. Your account is kept in this browser only.
        </p>
      </>
    );
  } else {
    const { hasDraft, answered, total } = draftSummary(draft);
    const mine = getStories().filter((s) => s.email === signedIn);
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className={h1}>
          You&apos;re in.
        </h1>
        <p className={lead}>
          Signed in as <b className="font-bold [overflow-wrap:anywhere]">{signedIn}</b>.
        </p>
        <div className="flex max-w-[560px] flex-col gap-4">
          {hasDraft && (
            <div className="flex flex-col gap-3 rounded border-2 border-brief-ink bg-brief-white p-5 shadow-[5px_5px_0_var(--color-brief-ink)]">
              <span className="font-martian-mono text-xs font-semibold tracking-[0.05em] text-[#5F5866]">YOUR DRAFT</span>
              <b className="text-[19px] leading-6">{storyTitle(draft.answers)}</b>
              <span className={small}>
                {answered} of {total} answered · saved {daysAgo(draft.updatedAt)}
              </span>
              <Link href="/share?resume=1" className="landing-btn mt-1 self-start">
                Keep going {ARROW}
              </Link>
            </div>
          )}
          {!hasDraft && (
            <Link href="/share" className="landing-btn self-start">
              Spill yours {ARROW}
            </Link>
          )}
          <div className="flex flex-col gap-1 rounded border-2 border-brief-ink bg-brief-paper p-5">
            <b className="text-[17px]">Your stories</b>
            <span className={small}>
              {mine.length === 0 ? "Nothing sent yet." : `${mine.length} sent from this browser.`}{" "}
              {mine.length > 0 && (
                <Link href="/take-down" className={textBtn}>
                  Manage or take one down
                </Link>
              )}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={`${textBtn} self-start text-[15px]`}
          onClick={() => {
            signOut();
            setEmail("");
            setMode("signin");
            setStep("email");
          }}
        >
          Sign out
        </button>
      </>
    );
  }

  return <Shell>{body}</Shell>;
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-brief-paper font-archivo text-brief-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[42px] -top-[42px] h-[170px] w-[170px] rounded-bl-full border-2 border-brief-ink bg-brief-rani md:-right-20 md:-top-20 md:h-[320px] md:w-[320px] lg:-right-[110px] lg:-top-[110px] lg:h-[440px] lg:w-[440px]"
      />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col justify-center gap-6 px-4 pb-14 pt-10 sm:px-8 md:px-12 md:pb-20 md:pt-14 lg:px-20">{children}</main>
      <SiteFooter />
    </div>
  );
}
