"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mark } from "@/components/site/Mark";

/**
 * Landing page for the one-tap feeling in the approval email (board 32).
 * The tap is saved as soon as the page opens; the friend question and
 * comment are optional extras. Nothing here identifies the person.
 */
const FEEL = ["ugh", "meh", "it was okay", "felt good", "lowkey healing"];
const FRIEND: { v: "nah" | "maybe" | "yes"; label: string }[] = [
  { v: "nah", label: "nah" },
  { v: "maybe", label: "maybe" },
  { v: "yes", label: "yes, 100%" },
];
const pill = "min-h-[44px] rounded-full border-2 border-brief-ink px-4 text-[15px] font-semibold";

export function EmailFeedback() {
  const q = useSearchParams();
  const story = q.get("s") ?? "";
  const feeling = Number(q.get("f"));
  const valid = /^[0-9a-f-]{36}$/i.test(story) && feeling >= 1 && feeling <= 5;
  const [id, setId] = useState<string | null>(null);
  const [state, setState] = useState<"saving" | "saved" | "error" | "done">("saving");
  const [friend, setFriend] = useState<"nah" | "maybe" | "yes" | null>(null);
  const [comment, setComment] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    if (!valid || sent.current) return;
    sent.current = true;
    const key = `gather:fb:${story}:${feeling}`;
    const prev = (() => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    })();
    if (prev) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setId(prev);
      setState("saved");
      return;
    }
    void supabase()
      .rpc("email_feedback", { p_story: story, p_feeling: feeling })
      .then(({ data, error }) => {
        if (error || !data) return setState("error");
        try {
          sessionStorage.setItem(key, data as string);
        } catch {}
        setId(data as string);
        setState("saved");
      });
  }, [valid, story, feeling]);

  const more = async () => {
    if (!id) return;
    await supabase().rpc("email_feedback_more", { p_id: id, p_friend: friend, p_comment: comment.trim() || null });
    setState("done");
  };

  return (
    <main className="flex min-h-dvh flex-col bg-brief-paper text-brief-ink">
      <header className="px-4 py-4 sm:px-8">
        <Link href="/" aria-label="GATHER home">
          <Mark size={30} />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-6 px-4 pb-16 pt-6">
        {!valid || state === "error" ? (
          <>
            <h1 className="m-0 text-[34px] font-black leading-tight [font-stretch:125%]">Hmm, that link didn’t work.</h1>
            <p className="m-0 text-[17px] leading-[26px]">No worries. Thanks for wanting to tell us, it means a lot.</p>
          </>
        ) : state === "done" ? (
          <>
            <h1 className="m-0 text-[40px] font-black leading-tight [font-stretch:125%]">Noted. Thank you 🩷</h1>
            <p className="m-0 text-[17px] leading-[26px]">You just made GATHER a little better for the next person.</p>
            <Link href="/" className="text-[16px] font-semibold underline underline-offset-[3px]">
              Back to GATHER
            </Link>
          </>
        ) : (
          <>
            <span className="font-martian-mono text-[12px] font-semibold tracking-[0.06em] text-brief-rani">THANK YOU</span>
            <h1 className="m-0 text-[36px] font-black leading-tight [font-stretch:125%]">
              “{FEEL[feeling - 1]}”, noted {state === "saved" ? "🩷" : "…"}
            </h1>
            <p className="m-0 text-[17px] leading-[26px]">That’s all we needed. If you have ten more seconds:</p>
            <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
              <legend className="mb-3 p-0 text-[18px] font-extrabold [font-stretch:112%]">Would you put a friend on to GATHER?</legend>
              <div className="flex flex-wrap gap-2">
                {FRIEND.map((f) => (
                  <button
                    key={f.v}
                    type="button"
                    aria-pressed={friend === f.v}
                    onClick={() => setFriend(friend === f.v ? null : f.v)}
                    className={`${pill} ${friend === f.v ? "bg-brief-rani" : "bg-brief-white"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <label htmlFor="ef-c" className="text-[16px] font-extrabold [font-stretch:112%]">
                Anything we should fix or add? <span className="text-[13px] font-normal text-brief-muted">(optional)</span>
              </label>
              <textarea
                id="ef-c"
                rows={3}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Spill it, we can take it"
                className="rounded border-2 border-brief-ink bg-brief-white px-3.5 py-3 text-[15px] leading-[22px] outline-none focus:shadow-[3px_3px_0_var(--color-brief-rani)]"
              />
            </div>
            <button
              type="button"
              disabled={state !== "saved" || (!friend && !comment.trim())}
              onClick={more}
              className="btn-light min-h-[52px] self-start rounded border-2 border-brief-ink bg-brief-rani px-6 text-[16px] font-bold shadow-[4px_4px_0_var(--color-brief-ink)]"
            >
              Send
            </button>
          </>
        )}
      </div>
    </main>
  );
}
