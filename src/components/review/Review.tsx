"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SUPABASE_KEY, SUPABASE_URL, supabase } from "@/lib/supabase";
import { useShareDraft } from "@/lib/share/draft";
import { OTHER, MET_OTHER, isOngoing, type Answers } from "@/lib/share/questions";

/**
 * Review page for the GATHER team (Claude Design boards 23 and 24). Only
 * accounts in public.reviewers get data back (the server checks), so anyone
 * else just sees "this page is for the team". Approving or setting a story
 * aside can email the person a designed GATHER email (send-story-email
 * function), with a 10-second undo before it leaves.
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
  emailed_at: string | null;
  review_note: string | null;
  notused_reason: string | null;
};
type Feedback = { id: string; created_at: string; feeling: number; friend: "nah" | "maybe" | "yes"; comment: string | null };

const TABS: { id: string; label: string; match: (s: Status) => boolean }[] = [
  { id: "waiting", label: "Waiting", match: (s) => s === "received" || s === "in_review" },
  { id: "approved", label: "Approved", match: (s) => s === "approved" },
  { id: "not_used", label: "Not used", match: (s) => s === "not_used" },
  { id: "taken_down", label: "Taken down", match: (s) => s === "taken_down" },
];
const FEEL = ["ugh", "meh", "it was okay", "felt good", "lowkey healing"];
const FRIEND = { nah: "nah", maybe: "maybe", yes: "yes, 100%" } as const;
const REASONS: { id: string; label: string }[] = [
  { id: "names", label: "Has names or identifying details" },
  { id: "topic", label: "Not about dating or relationships" },
  { id: "duplicate", label: "Shared more than once" },
  { id: "other", label: "Something else" },
];
const UNDO_MS = 10_000;

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
const mask = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");

const btn = "inline-flex min-h-[44px] items-center justify-center rounded border-2 border-brief-ink px-4 font-archivo text-[15px] font-bold shadow-[3px_3px_0_var(--color-brief-ink)] disabled:opacity-50";
const h1 = "m-0 text-[44px] font-black leading-[0.94] [font-stretch:125%] sm:text-[56px]";
const small = "m-0 text-[14px] leading-[20px] text-brief-muted";

type Panel = { row: Row; kind: "approved" | "not_used" };
type Pending = { id: string; kind: "approved" | "not_used"; note: string; reason: string | null; prev: Status; token: string; timer: number; email: string };

async function sendEmail(p: { id: string; kind: string; note: string; reason: string | null; token: string }, keepalive = false) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-story-email`, {
    method: "POST",
    keepalive,
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${p.token}` },
    body: JSON.stringify({ story_id: p.id, kind: p.kind, note: p.note, reason: p.reason ?? undefined }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "The email didn’t go out.");
  }
}

export function Review() {
  const { hydrated, userId } = useShareDraft();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [tab, setTab] = useState("waiting");
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [toast, setToast] = useState<{ text: string; undo?: boolean } | null>(null);
  const pending = useRef<Pending | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: ok } = await sb.rpc("am_reviewer");
    setAllowed(Boolean(ok));
    if (!ok) return;
    const [{ data, error: e }, { data: fb }] = await Promise.all([sb.rpc("review_queue"), sb.rpc("review_feedback")]);
    if (e) setError("Couldn’t load stories. Refresh to try again.");
    setRows((data as Row[]) ?? []);
    setFeedback((fb as Feedback[]) ?? []);
  }, []);

  useEffect(() => {
    if (!hydrated || !userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [hydrated, userId, load]);

  // if the tab closes during the undo window, still send the email
  useEffect(() => {
    const flush = () => {
      const p = pending.current;
      if (!p) return;
      window.clearTimeout(p.timer);
      pending.current = null;
      void sendEmail(p, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const setStatus = async (id: string, status: "approved" | "not_used" | "received") => {
    const { error: e } = await supabase().rpc("review_story", { story_id: id, new_status: status });
    if (e) throw e;
  };

  const confirm = async (row: Row, kind: "approved" | "not_used", email: boolean, note: string, reason: string | null) => {
    setError(null);
    try {
      await setStatus(row.id, kind);
    } catch {
      setError("That didn’t save. Try again.");
      return;
    }
    setPanel(null);
    await load();
    const done = kind === "approved" ? "Approved." : "Marked as not used.";
    if (!email) {
      setToast({ text: done });
      window.setTimeout(() => setToast((t) => (t?.text === done ? null : t)), 4000);
      return;
    }
    const { data } = await supabase().auth.getSession();
    const token = data.session?.access_token ?? "";
    const p: Pending = { id: row.id, kind, note, reason, prev: row.status, token, email: row.email, timer: 0 };
    p.timer = window.setTimeout(async () => {
      if (pending.current !== p) return;
      pending.current = null;
      setToast({ text: `${done} Sending the email…` });
      try {
        await sendEmail(p);
        setToast({ text: `${done} Email sent to ${mask(p.email)}` });
        await load();
      } catch (e) {
        setToast({ text: `${done} ${e instanceof Error ? e.message : "The email didn’t go out."}` });
      }
      window.setTimeout(() => setToast(null), 5000);
    }, UNDO_MS);
    pending.current = p;
    setToast({ text: `${done} Email goes to ${mask(row.email)} in 10 seconds.`, undo: true });
  };

  const undo = async () => {
    const p = pending.current;
    if (!p) return;
    window.clearTimeout(p.timer);
    pending.current = null;
    try {
      await setStatus(p.id, p.prev === "approved" || p.prev === "not_used" ? p.prev : "received");
      setToast({ text: "Undone. Nothing was sent." });
    } catch {
      setToast({ text: "Undo didn’t save. Move it back by hand." });
    }
    await load();
    window.setTimeout(() => setToast(null), 4000);
  };

  let body: React.ReactNode;
  if (!hydrated || (userId && allowed === null)) {
    body = <p className="text-[17px]">Loading…</p>;
  } else if (!userId) {
    body = (
      <>
        <h1 className={h1}>Review</h1>
        <p className="m-0 text-[17px]">Sign in with your team email to see the stories.</p>
        <Link href="/sign-in" className="landing-btn self-start">Sign in</Link>
      </>
    );
  } else if (!allowed) {
    body = (
      <>
        <h1 className={h1}>Review</h1>
        <p className="m-0 text-[17px]">This page is for the GATHER team.</p>
      </>
    );
  } else {
    const counts: Record<string, number> = Object.fromEntries(TABS.map((t) => [t.id, (rows ?? []).filter((r) => t.match(r.status)).length]));
    counts.feedback = feedback?.length ?? 0;
    body = (
      <>
        <h1 className={h1}>Review</h1>
        <p className="m-0 max-w-[620px] text-[17px] leading-[1.55] text-[#2A2430]">
          Read each story, then approve it or mark it as not used. You can email the person in the same step. Approved stories count in the
          insights. Only stories marked &ldquo;publish&rdquo; can ever appear on the site.
        </p>
        <div role="tablist" aria-label="Review sections" className="flex flex-wrap gap-2">
          {[...TABS, { id: "feedback", label: "Feedback" }].map((t) => (
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
        {tab === "feedback" ? (
          <FeedbackTab items={feedback ?? []} />
        ) : (
          <Stories rows={(rows ?? []).filter((r) => TABS.find((t) => t.id === tab)!.match(r.status))} onPanel={setPanel} onBack={async (id) => { await setStatus(id, "received").catch(() => setError("That didn’t save.")); await load(); }} />
        )}
      </>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-brief-paper font-archivo text-brief-ink">
      <SiteHeader />
      <div className="relative mx-auto flex w-full max-w-[920px] flex-1 flex-col gap-6 px-4 pb-16 pt-10 sm:px-8 md:pt-14">{body}</div>
      <SiteFooter />
      {panel && <DecisionPanel panel={panel} onClose={() => setPanel(null)} onConfirm={confirm} />}
      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-[560px] items-center gap-4 rounded bg-brief-ink px-5 py-3.5 text-[15px] font-semibold text-brief-paper shadow-[4px_4px_0_var(--color-brief-rani)]">
          <span className="flex-1">{toast.text}</span>
          {toast.undo && (
            <button type="button" onClick={undo} className="min-h-[40px] px-1 underline underline-offset-[3px]">
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Stories({ rows, onPanel, onBack }: { rows: Row[]; onPanel: (p: Panel) => void; onBack: (id: string) => void }) {
  if (rows.length === 0) return <p className="m-0 text-[17px] text-brief-muted">Nothing here right now.</p>;
  return (
    <div className="flex flex-col gap-6">
      {rows.map((r) => (
        <article key={r.id} className="flex flex-col gap-4 rounded border-2 border-brief-ink bg-brief-white p-5 shadow-[6px_6px_0_var(--color-brief-ink)] sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-[22px] font-black leading-tight [font-stretch:112%]">{r.title}</h2>
              <span className={small}>Sent {when(r.created_at)}</span>
            </div>
            <span className={`rounded border-2 border-brief-ink px-2.5 py-1 font-martian-mono text-xs font-semibold ${r.publish ? "bg-brief-rani" : "bg-brief-paper"}`}>
              {r.publish ? "WANTS IT PUBLISHED" : "INSIGHTS ONLY"}
            </span>
          </header>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
            <span className="text-brief-muted">From</span>
            <b className="[overflow-wrap:anywhere]">{r.email}</b>
          </div>

          {r.status === "taken_down" ? (
            <p className="m-0 text-[15px] text-brief-muted">
              They took this story down{r.taken_down_at ? ` on ${when(r.taken_down_at)}` : ""}. What they wrote has been erased.
              {r.takedown_reason ? ` Reason: ${r.takedown_reason}.` : ""}
            </p>
          ) : (
            <>
              {r.answers.story && (
                <blockquote className="m-0 whitespace-pre-wrap border-l-4 border-brief-rani pl-4 text-[17px] leading-[1.6] [overflow-wrap:anywhere]">{r.answers.story}</blockquote>
              )}
              <dl className="m-0 grid gap-x-6 gap-y-2 text-[15px] leading-[22px] sm:grid-cols-[200px_1fr]">
                {details(r.answers)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-brief-muted">{k}</dt>
                      <dd className="m-0 font-semibold [overflow-wrap:anywhere]">{v}</dd>
                    </div>
                  ))}
              </dl>
              {r.answers.reflection && (
                <p className="m-0 text-[15px] leading-[22px]">
                  <span className="text-brief-muted">
                    What they&apos;ve realised ({isOngoing(r.answers) ? "still going" : "over"}):{" "}
                  </span>
                  <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{r.answers.reflection}</span>
                </p>
              )}
              {(r.reviewed_at || r.emailed_at) && (
                <p className={small}>
                  {r.reviewed_at && `${r.status === "approved" ? "Approved" : r.status === "not_used" ? "Set aside" : "Reviewed"} ${when(r.reviewed_at)}`}
                  {r.emailed_at && ` · Email sent ${when(r.emailed_at)}`}
                  {r.review_note && ` · Note: “${r.review_note}”`}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {r.status !== "approved" && (
                  <button type="button" onClick={() => onPanel({ row: r, kind: "approved" })} className={`${btn} bg-brief-peacock text-brief-paper`}>
                    Approve
                  </button>
                )}
                {r.status !== "not_used" && (
                  <button type="button" onClick={() => onPanel({ row: r, kind: "not_used" })} className={`${btn} bg-brief-white`}>
                    Don&apos;t use
                  </button>
                )}
                {r.status !== "received" && (
                  <button type="button" onClick={() => onBack(r.id)} className="min-h-[44px] px-2 font-archivo text-[15px] font-semibold underline underline-offset-[3px]">
                    Move back to waiting
                  </button>
                )}
              </div>
            </>
          )}
        </article>
      ))}
    </div>
  );
}

function DecisionPanel({
  panel,
  onClose,
  onConfirm,
}: {
  panel: Panel;
  onClose: () => void;
  onConfirm: (row: Row, kind: "approved" | "not_used", email: boolean, note: string, reason: string | null) => Promise<void>;
}) {
  const { row, kind } = panel;
  const approve = kind === "approved";
  const [email, setEmail] = useState(true);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string | null>(approve ? null : "names");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needsNote = !approve && email && reason === "other" && !note.trim();
  const subject = approve ? (row.publish ? "your story made the cut" : "your story is officially counted") : "about your GATHER story";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(23,18,28,0.55)] p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dp-h"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-[520px] flex-col gap-4 overflow-y-auto rounded border-2 border-brief-ink bg-brief-white p-6 shadow-[6px_6px_0_var(--color-brief-ink)]"
      >
        <span className="font-martian-mono text-[11px] font-semibold tracking-[0.06em]">{approve ? "APPROVE" : "DON’T USE"}</span>
        <h2 id="dp-h" ref={ref} tabIndex={-1} className="m-0 text-[28px] font-black leading-tight outline-none [font-stretch:125%]">
          {approve ? "Approve this story?" : "Not using this one?"}
        </h2>
        <p className="m-0 text-[15px] leading-[22px]">
          {approve ? (
            <>
              They chose <b>{row.publish ? "publish after review" : "insights only"}</b>. Approving counts it in the insights straight away.
            </>
          ) : (
            "Pick a reason. They’ll get a kind, plain version of it, never the label below."
          )}
        </p>

        {!approve && (
          <div role="radiogroup" aria-label="Reason" className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={reason === r.id}
                onClick={() => setReason(r.id)}
                className={`min-h-[40px] rounded border-2 border-brief-ink px-3 text-[14px] font-semibold shadow-[2px_2px_0_var(--color-brief-ink)] ${reason === r.id ? "bg-brief-peacock text-brief-paper" : "bg-brief-white"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="h-5 w-5 accent-brief-ink" />
          {approve ? "Email them that it’s approved" : "Email them"}
        </label>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dp-note" className="text-[15px] font-bold">
            Add a personal note <span className="font-normal text-brief-muted">{!approve && reason === "other" ? "(used as the reason)" : "(optional)"}</span>
          </label>
          <textarea
            id="dp-note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={approve ? "Thank you for trusting us with this." : "Anything you’d like to add…"}
            className="rounded border-2 border-brief-ink bg-brief-white px-3.5 py-3 text-[15px] leading-[22px] outline-none focus:shadow-[3px_3px_0_var(--color-brief-rani)]"
          />
          <span className={small}>Shown in the email, and kept with the story for your team.</span>
        </div>

        {email && (
          <p className="m-0 rounded border-2 border-dashed border-[#B9B0A2] bg-brief-paper px-3.5 py-3 text-[14px] font-semibold">
            Email to {mask(row.email)}: &ldquo;{subject}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            disabled={busy || needsNote}
            onClick={async () => {
              setBusy(true);
              await onConfirm(row, kind, email, note.trim(), approve ? null : reason);
              setBusy(false);
            }}
            className={`${btn} bg-brief-rani`}
          >
            {busy ? "Saving…" : approve ? (email ? "Approve & send email" : "Approve") : email ? "Mark not used & send" : "Mark not used"}
          </button>
          <button type="button" onClick={onClose} className="min-h-[44px] px-1 text-[15px] font-semibold underline underline-offset-[3px]">
            Cancel
          </button>
        </div>
        {needsNote && <p className={small}>For &ldquo;Something else&rdquo;, add a note so they know why.</p>}
      </div>
    </div>
  );
}

function FeedbackTab({ items }: { items: Feedback[] }) {
  if (items.length === 0) return <p className="m-0 text-[17px] text-brief-muted">No feedback yet. It shows up here after people share.</p>;
  const n = items.length;
  const avg = items.reduce((s, f) => s + f.feeling, 0) / n;
  const pct = (v: Feedback["friend"]) => Math.round((items.filter((f) => f.friend === v).length / n) * 100);
  const dist = [5, 4, 3, 2, 1].map((k) => ({ k, c: items.filter((f) => f.feeling === k).length }));
  const max = Math.max(1, ...dist.map((d) => d.c));
  const comments = items.filter((f) => f.comment?.trim());
  const tile = "flex flex-col gap-2.5 rounded border-2 border-brief-ink bg-brief-white p-5 shadow-[5px_5px_0_var(--color-brief-ink)]";
  const big = "text-[44px] font-black leading-none [font-stretch:125%]";
  const lab = "font-martian-mono text-[11px] font-semibold tracking-[0.06em]";
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={tile}>
          <span className={lab}>HOW SHARING FELT</span>
          <span className={big}>{avg.toFixed(1)} / 5</span>
          <span className={small}>average of {n} answer{n === 1 ? "" : "s"}</span>
          <div className="flex flex-col gap-1.5 text-[14px]">
            {dist.map((d) => (
              <div key={d.k} className="grid grid-cols-[110px_1fr_24px] items-center gap-2">
                <span>{FEEL[d.k - 1]}</span>
                <i className="block h-3 border-2 border-brief-ink bg-brief-rani" style={{ width: `${Math.max(4, (d.c / max) * 100)}%` }} />
                <span className="text-right">{d.c}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={tile}>
          <span className={lab}>WOULD PUT A FRIEND ON</span>
          <span className={big}>{pct("yes")}%</span>
          <span className={small}>
            said yes, 100% · {pct("maybe")}% maybe · {pct("nah")}% nah
          </span>
        </div>
        <div className={tile}>
          <span className={lab}>COMMENTS</span>
          <span className={big}>{comments.length}</span>
          <span className={small}>people left a note</span>
        </div>
      </div>
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className={lab}>LATEST COMMENTS</span>
          {comments.map((f) => (
            <div key={f.id} className="flex flex-col gap-2 rounded border-2 border-brief-ink bg-brief-white px-4 py-3.5">
              <span className="self-start rounded border-2 border-brief-ink bg-brief-marigold px-2 py-0.5 font-martian-mono text-[11px] font-semibold uppercase">
                {FEEL[f.feeling - 1]} · {FRIEND[f.friend]}
              </span>
              <p className="m-0 whitespace-pre-wrap text-[16px] leading-[1.5] [overflow-wrap:anywhere]">{f.comment}</p>
              <span className={small}>{when(f.created_at)}</span>
            </div>
          ))}
        </div>
      )}
      <p className={small}>Feedback isn&apos;t linked to anyone&apos;s email or story, so people can be honest.</p>
    </div>
  );
}
