"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Feedback after sharing (Claude Design board 24). Two taps and an optional
 * line, saved anonymously: the feedback row has no user, email or story link.
 */
const FEEL = ["ugh", "meh", "it was okay", "felt good", "lowkey healing"];
const FRIEND: { v: "nah" | "maybe" | "yes"; label: string }[] = [
  { v: "nah", label: "nah" },
  { v: "maybe", label: "maybe" },
  { v: "yes", label: "yes, 100%" },
];

/** The GATHER mark filling up quarter by quarter: 1 to 4 quarters, 5 is the full mark. */
function Fill({ n }: { n: number }) {
  const radius = ["rounded-br-full", "rounded-bl-full", "rounded-tr-full", "rounded-tl-full"];
  return (
    <span aria-hidden className="grid h-6 w-6 grid-cols-2 grid-rows-2">
      {radius.map((r, k) => (
        <span key={r} className={`bg-current ${r}`} style={{ opacity: n === 5 || k < n ? 1 : 0.18 }} />
      ))}
    </span>
  );
}

export function FeedbackCard() {
  const [feeling, setFeeling] = useState<number | null>(null);
  const [friend, setFriend] = useState<"nah" | "maybe" | "yes" | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"open" | "sending" | "sent" | "skipped" | "error">("open");

  if (state === "skipped") return null;
  if (state === "sent") {
    return (
      <div className="flex flex-col items-start gap-2.5 rounded-md border-2 border-[var(--soft)] bg-[var(--sf)] p-4 lg:p-5" role="status">
        <span className="grid h-10 w-10 grid-cols-2 grid-rows-2 text-brief-rani" aria-hidden>
          {["rounded-br-full", "rounded-bl-full", "rounded-tr-full", "rounded-tl-full"].map((r) => (
            <span key={r} className={`bg-current ${r}`} />
          ))}
        </span>
        <b className="text-[22px] font-extrabold [font-stretch:112%]">Noted. Thank you 🩷</b>
        <p className="sf-hp">You just made GATHER a little better for the next person.</p>
      </div>
    );
  }

  const ready = feeling !== null && friend !== null;
  const send = async () => {
    if (!ready) return;
    setState("sending");
    const { error } = await supabase()
      .from("feedback")
      .insert({ feeling, friend, comment: comment.trim() || null });
    setState(error ? "error" : "sent");
  };

  return (
    <section aria-labelledby="fb-h" className="flex flex-col gap-4 rounded-md border-2 border-[var(--soft)] bg-[var(--sf)] p-4 lg:p-5">
      <span id="fb-h" className="sf-eb !text-brief-rani">ONE LAST THING, PROMISE</span>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[18px] font-extrabold leading-tight [font-stretch:112%]">How did sharing feel?</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {FEEL.map((label, i) => {
            const on = feeling === i + 1;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => setFeeling(on ? null : i + 1)}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-md border-2 px-0.5 py-2 text-center text-[12px] font-semibold leading-[1.15] ${on ? "border-brief-rani bg-brief-rani text-brief-ink" : "border-[var(--soft)] text-[var(--fg)]"}`}
              >
                <Fill n={i + 1} />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="m-0 flex flex-col border-0 p-0">
        <legend className="mb-2.5 p-0 text-[18px] font-extrabold leading-tight [font-stretch:112%]">Would you put a friend on to GATHER?</legend>
        <div className="flex flex-wrap gap-2">
          {FRIEND.map((f) => {
            const on = friend === f.v;
            return (
              <button
                key={f.v}
                type="button"
                aria-pressed={on}
                onClick={() => setFriend(on ? null : f.v)}
                className={`min-h-[44px] rounded-full border-2 px-4 text-[14px] font-semibold ${on ? "border-brief-rani bg-brief-rani text-brief-ink" : "border-[var(--soft)] text-[var(--fg)]"}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="fb-c" className="text-[16px] font-extrabold [font-stretch:112%]">
          Anything we should fix or add? <span className="text-[13px] font-normal text-[var(--mu)] [font-stretch:100%]">(optional)</span>
        </label>
        <textarea
          id="fb-c"
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Spill it, we can take it"
          className="sf-in min-h-[80px] resize-y"
        />
      </div>

      {state === "error" && (
        <p className="sf-err" role="alert">
          That didn’t go through. Try again?
        </p>
      )}
      <button type="button" className="sf-bt" onClick={send} disabled={!ready || state === "sending"}>
        {state === "sending" ? "Sending…" : "Send feedback"}
      </button>
      <button type="button" className="sf-lk self-center" onClick={() => setState("skipped")}>
        Skip
      </button>
    </section>
  );
}
