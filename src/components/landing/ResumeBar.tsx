"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { draftProgress, useSurvey } from "@/lib/store/surveyStore";
import { SURVEY_QUESTIONS } from "@/lib/surveyQuestions";

/**
 * Saved-draft resume bar (approved board "Saved draft · Option A"): a slim
 * full-width strip on the hero's bottom edge that only appears when this
 * device has an unfinished story. Discard is a secondary text link and
 * always asks first, with focus on "Keep my draft".
 */
function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden>
      <path d="M3 10h13M11 4l6 6-6 6" />
    </svg>
  );
}

export function ResumeBar() {
  const { state, hydrated, reset } = useSurvey();
  const [confirming, setConfirming] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const discardRef = useRef<HTMLButtonElement>(null);

  const questionCount = state.category ? SURVEY_QUESTIONS[state.category].length : 0;
  const { hasDraft, answered, total, href } = draftProgress(state, questionCount);

  useEffect(() => {
    if (!confirming) return;
    keepRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirming(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirming]);

  useEffect(() => {
    if (!discarded) return;
    const t = window.setTimeout(() => setDiscarded(false), 6000);
    return () => window.clearTimeout(t);
  }, [discarded]);

  if (!hydrated) return null;

  if (discarded) {
    return (
      <div role="status" className="flex justify-center px-4 py-3">
        <span className="flex items-center gap-4 rounded bg-brief-ink px-[18px] py-3.5 font-archivo text-[15px] font-semibold text-brief-paper shadow-[5px_5px_0_var(--color-brief-rani)]">
          Draft discarded.
          <Link href="/share" className="underline underline-offset-[3px]">
            Start a new story
          </Link>
        </span>
      </div>
    );
  }

  if (!hasDraft) return null;

  return (
    <>
      <section
        aria-labelledby="resume-h"
        className="relative flex flex-col gap-3 border-y-2 border-brief-ink bg-brief-white py-4 pl-[26px] pr-4 before:absolute before:inset-y-0 before:left-0 before:w-2.5 before:bg-brief-rani sm:pl-[44px] sm:pr-8 lg:flex-row lg:items-center lg:gap-6 lg:pl-[92px] lg:pr-20"
      >
        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-4">
          <span className="font-martian-mono text-xs font-semibold leading-[18px] tracking-[0.04em] text-[#5F5866]">
            YOUR STORY IS WAITING
          </span>
          <h2 id="resume-h" className="m-0 font-archivo text-[20px] font-extrabold leading-[1.2] [font-stretch:112%] sm:text-[22px]">
            Pick up where you left off.
          </h2>
        </div>
        <span className="whitespace-nowrap font-archivo text-sm text-[#5F5866]">
          {answered} of {total} answered · saved on this device
        </span>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <Link href={href} className="landing-btn min-h-[46px] w-full whitespace-nowrap px-5 text-base sm:w-auto">
            Continue your story <Arrow />
          </Link>
          <button
            ref={discardRef}
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-[44px] whitespace-nowrap px-1 font-archivo text-[15px] font-semibold underline underline-offset-[3px]"
          >
            Discard draft
          </button>
        </div>
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(23_18_28/0.55)] p-4" onClick={() => setConfirming(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-h"
            aria-describedby="discard-b"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[520px] flex-col gap-4 rounded border-2 border-brief-ink bg-brief-paper p-6 shadow-[8px_8px_0_var(--color-brief-ink)] sm:p-8"
          >
            <h2 id="discard-h" className="m-0 font-archivo text-[28px] font-black leading-none tracking-[-0.015em] [font-stretch:125%] sm:text-[30px]">
              Discard this draft?
            </h2>
            <p id="discard-b" className="m-0 font-archivo text-[17px] leading-[26px]">
              This deletes your saved answers from this device. Your story hasn&rsquo;t been sent, and this can&rsquo;t be undone.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-3.5">
              <button
                ref={keepRef}
                type="button"
                onClick={() => {
                  setConfirming(false);
                  discardRef.current?.focus();
                }}
                className="landing-btn min-h-[52px] bg-brief-white px-6 text-base shadow-[4px_4px_0_var(--color-brief-ink)]"
              >
                Keep my draft
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setConfirming(false);
                  setDiscarded(true);
                }}
                className="inline-flex min-h-[52px] items-center justify-center rounded border-2 border-brief-ink bg-brief-ink px-6 font-archivo text-base font-bold text-brief-paper"
              >
                Discard draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
