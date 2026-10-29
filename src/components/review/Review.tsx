"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/lib/supabase";
import { useShareDraft } from "@/lib/share/draft";
import { OTHER, MET_OTHER, type Answers } from "@/lib/share/questions";

/**
 * Review page for the GATHER team. Only accounts in public.reviewers get
 * data back (review_queue() checks on the server), so anyone else just sees
 * "this page is for the team". Each story reads in plain words, with the
 * sender's email so the team can write back from their own inbox.
 */

type Status = "received" | "in_review" | "approved" | "not_used" | "taken_down";
type Row = {
  id: string;
  title: string;
  answers: Answers;
  publish: boolean;
  status: Status;
  created_at: string;
  reviewed_at: string | null;
  taken_down_at: string | null;
  takedown_reason: string | null;
  email: string;
};

const TABS: { id: string; label: string; match: (s: Status) => boolean }[] = [
  { id: "waiting", label: "Waiting", match: (s) => s === "received" || s === "in_review" },
  { id: "approved", label: "Approved", match: (s) => s === "approved" },
  { id: "not_used", label: "Not used", match: (s) => s === "not_used" },
  { id: "taken_down", label: "Taken down", match: (s) => s === "taken_down" },
];

const withOther = (v: string | undefined, other: string | undefined, key = OTHER) => (v === key && other?.trim() ? `${v}: ${other.trim()}` : v);
const list = (xs: string[] | undefined, other?: string) =>
  xs?.length ? xs.map((x) => (x === OTHER && other?.trim() ? `${OTHER}: ${other.trim()}` : x)).join(", ") : undefined;

function details(a: Answers): [string, string | undefined][] {
  return [
    ["Connection", withOther(a.type, a.typeOther)],
    ["With", a.withGender],
    ["How they met", withOther(a.met, a.metOther, MET_OTHER)],
    ["How long", a.howLong],
    ["They hoped for", a.hope],
    ["Thought the other wanted", a.thought],
    ["What felt good", list(a.good, a.goodOther)],
    ["What made it hard", list(a.hard, a.hardOther)],
    ["Where it stands", a.status],
    ["When it slowed", a.slowed],
    ["Why it ended", list(a.reasons, a.reasonOther)],
    ["About them", [a.age, a.gender, a.region].filter((x) => x && x !== "Prefer not to say").join(" · ") || undefined],
  ];
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const btn = "inline-flex min-h-[44px] items-center justify-center rounded border-2 border-brief-ink px-4 font-archivo text-[15px] font-bold shadow-[3px_3px_0_var(--color-brief-ink)] disabled:opacity-50";

export function Review() {
  const { hydrated, userId } = useShareDraft();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [tab, setTab] = useState("waiting");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: ok } = await sb.rpc("am_reviewer");
    setAllowed(Boolean(ok));
    if (!ok) return;
    const { data, error: e } = await sb.rpc("review_queue");
    if (e) setError("Couldn’t load stories. Refresh to try again.");
    setRows((data as Row[]) ?? []);
  }, []);

  useEffect(() => {
    if (!hydrated || !userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [hydrated, userId, load]);

  const decide = async (id: string, status: "approved" | "not_used" | "received") => {
    setBusy(id);
    setError(null);
    const { error: e } = await supabase().rpc("review_story", { story_id: id, new_status: status });
    if (e) setError("That didn’t save. Try again.");
    await load();
    setBusy(null);
  };

  let body: React.ReactNode;
  if (!hydrated || (userId && allowed === null)) {
    body = <p className="text-[17px]">Loading…</p>;
  } else if (!userId) {
    body = (
      <>
        <h1 className="m-0 text-[44px] font-black leading-[0.94] [font-stretch:125%] sm:text-[56px]">Review</h1>
        <p className="m-0 text-[17px]">Sign in with your team email to see the stories.</p>
        <Link href="/sign-in" className="landing-btn self-start">Sign in</Link>
      </>
    );
  } else if (!allowed) {
    body = (
      <>
        <h1 className="m-0 text-[44px] font-black leading-[0.94] [font-stretch:125%] sm:text-[56px]">Review</h1>
        <p className="m-0 text-[17px]">This page is for the GATHER team.</p>
      </>
    );
  } else {
    const counts = Object.fromEntries(TABS.map((t) => [t.id, (rows ?? []).filter((r) => t.match(r.status)).length]));
    const shown = (rows ?? []).filter((r) => TABS.find((t) => t.id === tab)!.match(r.status));
    body = (
      <>
        <h1 className="m-0 text-[44px] font-black leading-[0.94] [font-stretch:125%] sm:text-[56px]">Review</h1>
        <p className="m-0 max-w-[620px] text-[17px] leading-[1.55] text-[#2A2430]">
          Read each story, then approve it or mark it as not used. Approved stories count in the insights. Only stories marked
          &ldquo;publish&rdquo; can ever appear on the site.
        </p>
        <div role="tablist" aria-label="Story status" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`${btn} ${tab === t.id ? "bg-brief-ink text-brief-paper" : "bg-brief-white"}`}
            >
              {t.label} <span className="ml-2 font-martian-mono text-xs">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        {error && <p role="alert" className="m-0 font-semibold text-[#B3123F]">{error}</p>}
        {shown.length === 0 && <p className="m-0 text-[17px] text-[#5F5866]">Nothing here right now.</p>}
        <div className="flex flex-col gap-6">
          {shown.map((r) => (
            <article key={r.id} className="flex flex-col gap-4 rounded border-2 border-brief-ink bg-brief-white p-5 shadow-[6px_6px_0_var(--color-brief-ink)] sm:p-7">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="m-0 text-[22px] font-black leading-tight [font-stretch:112%]">{r.title}</h2>
                  <span className="text-[14px] text-[#5F5866]">Sent {when(r.created_at)}</span>
                </div>
                <span className={`rounded border-2 border-brief-ink px-2.5 py-1 font-martian-mono text-xs font-semibold ${r.publish ? "bg-brief-rani" : "bg-brief-paper"}`}>
                  {r.publish ? "WANTS IT PUBLISHED" : "INSIGHTS ONLY"}
                </span>
              </header>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <span className="text-[#5F5866]">From</span>
                <b className="[overflow-wrap:anywhere]">{r.email}</b>
                <a href={`mailto:${r.email}?subject=${encodeURIComponent("About your GATHER story")}`} className="font-semibold underline underline-offset-[3px]">
                  Email them
                </a>
              </div>

              {r.status === "taken_down" ? (
                <p className="m-0 text-[15px] text-[#5F5866]">
                  They took this story down{r.taken_down_at ? ` on ${when(r.taken_down_at)}` : ""}. What they wrote is no longer shown.
                  {r.takedown_reason ? ` Reason: ${r.takedown_reason}.` : ""}
                </p>
              ) : (
                <>
                  {r.answers.story && (
                    <blockquote className="m-0 whitespace-pre-wrap border-l-4 border-brief-rani pl-4 text-[17px] leading-[1.6] [overflow-wrap:anywhere]">
                      {r.answers.story}
                    </blockquote>
                  )}
                  <dl className="m-0 grid gap-x-6 gap-y-2 text-[15px] leading-[22px] sm:grid-cols-[200px_1fr]">
                    {details(r.answers)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-[#5F5866]">{k}</dt>
                          <dd className="m-0 font-semibold [overflow-wrap:anywhere]">{v}</dd>
                        </div>
                      ))}
                  </dl>
                  {r.answers.reflection && (
                    <p className="m-0 text-[15px] leading-[22px]">
                      <span className="text-[#5F5866]">Looking back: </span>
                      <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{r.answers.reflection}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {r.status !== "approved" && (
                      <button type="button" disabled={busy === r.id} onClick={() => decide(r.id, "approved")} className={`${btn} bg-brief-peacock text-brief-paper`}>
                        Approve
                      </button>
                    )}
                    {r.status !== "not_used" && (
                      <button type="button" disabled={busy === r.id} onClick={() => decide(r.id, "not_used")} className={`${btn} bg-brief-white`}>
                        Don&apos;t use
                      </button>
                    )}
                    {r.status !== "received" && (
                      <button type="button" disabled={busy === r.id} onClick={() => decide(r.id, "received")} className="min-h-[44px] px-2 font-archivo text-[15px] font-semibold underline underline-offset-[3px]">
                        Move back to waiting
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-brief-paper font-archivo text-brief-ink">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-[920px] flex-1 flex-col gap-6 px-4 pb-16 pt-10 sm:px-8 md:pt-14">{body}</main>
      <SiteFooter />
    </div>
  );
}
