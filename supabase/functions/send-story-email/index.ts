// send-story-email: GATHER's designed emails about a story (Claude Design board 23).
//
//   approved   -> E1 (wants it published) or E2 (insights only), optional team note
//   not_used   -> E3, with a kind reason and optional team note
//   taken_down -> E4, sent to the owner after they take a story down
//
// Only reviewers can send approved / not_used. Only the story's owner can trigger
// taken_down. Mail goes out through the GATHER Gmail (secrets GMAIL_USER and
// GMAIL_APP_PASSWORD, set in the Supabase dashboard, never in code).
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import nodemailer from "npm:nodemailer@6.9.16";

const SITE = "https://gather-people-insights.vercel.app";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const REASONS: Record<string, string> = {
  names: "It had names or details that could point to someone, and we keep everyone on GATHER anonymous.",
  topic: "It wasn’t about a dating or relationship experience, which is what GATHER is for.",
  duplicate: "It looked like a repeat of a story you’d already shared, so we kept just one.",
  unclear:
    "We couldn’t quite follow this one. It read more like a test or a few random keys than a real experience, and since every story counts in the insights, we only keep the ones that describe what actually happened.",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

function shell(inner: string) {
  return `<div style="font-family:Arial,sans-serif;color:#17121C;max-width:480px;font-size:16px;line-height:1.55">
<p style="font-size:19px;font-weight:bold;margin:0 0 14px">Hey you 🩷</p>
${inner}
<p style="font-size:13px;color:#5F5866;border-top:1px solid #EEE7DC;padding-top:14px;margin:22px 0 0">Your story stays yours. No names, ever, and your email never shows up next to it.<br><br>With love,<br>GATHER 🩷</p>
</div>`;
}
const p = (t: string) => `<p style="margin:0 0 14px">${t}</p>`;
const ARROW = `&nbsp;<span style="font-size:1.35em;line-height:0;vertical-align:-1px">&#8594;</span>`;
const button = (label: string, href: string) =>
  `<p style="margin:6px 0 16px"><a href="${href}" style="display:inline-block;background:#FF3E9A;color:#17121C;border:2px solid #17121C;border-radius:4px;padding:11px 20px;font-weight:bold;font-size:15px;text-decoration:none">${label}${ARROW}</a></p>`;
const noteBlock = (note?: string) =>
  note?.trim()
    ? `<div style="border-left:4px solid #FF3E9A;background:#FFF3F8;padding:12px 14px;font-size:15px;margin:0 0 14px"><div style="font-size:12px;letter-spacing:.06em;color:#5F5866;margin-bottom:4px"><b>A NOTE FROM GATHER</b></div>${esc(note.trim())}</div>`
    : "";
const changed = p(`<span style="font-size:15px">Changed your mind? You can take it down anytime from your account.</span>`);

// One-tap feeling (board 32). The story id only proves the email was real; it is never saved with the answer.
const FEEL = ["ugh", "meh", "it was okay", "felt good", "lowkey healing"];
const feedback = (storyId: string) =>
  `<div style="border-top:1px dashed #D9CCB8;margin:22px 0 0;padding-top:18px">` +
  `<p style="margin:0 0 12px;font-weight:bold;font-size:16px">One tiny favour: how did sharing your story feel?</p><p style="margin:0">` +
  FEEL.map((f, i) =>
    `<a href="${SITE}/feedback?s=${storyId}&f=${i + 1}" style="display:inline-block;margin:0 6px 8px 0;border:2px solid #17121C;border-radius:999px;padding:7px 13px;font-weight:bold;font-size:13px;color:#17121C;text-decoration:none;background:${i === 4 ? "#FF3E9A" : "#FFFFFF"}">${f}</a>`,
  ).join("") +
  `</p><p style="margin:4px 0 0;font-size:12px;color:#8A7A88">One tap is enough. It helps us make GATHER better for the next person.</p></div>`;

// Their own story, folded at the bottom of the email (board 38). Only ever sent to the person who wrote it.
type Answers = Record<string, unknown>;
const ROWS: [string, string][] = [
  ["withGender", "Who it was with"], ["met", "How you met"], ["hope", "What you hoped for"], ["thought", "What you thought they wanted"],
  ["good", "What felt good"], ["hard", "What made it hard"], ["status", "Where it ended up"], ["slowed", "When it slowed down"], ["reasons", "Why it slowed down"],
];
const val = (a: Answers, k: string) => {
  const v = a[k];
  const other = typeof a[`${k}Other`] === "string" ? (a[`${k}Other`] as string).trim() : "";
  const fix = (x: string) => (other && /^other/i.test(x) ? `${x}: ${other}` : x);
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x).map((x) => fix(x as string)).join(", ");
  return typeof v === "string" ? fix(v) : "";
};
const sub = (h: string) => `<div style="font-size:11px;letter-spacing:.1em;color:#5F5866;font-weight:bold;margin:10px 0 4px">${h}</div>`;
const quote = (t: string) => `<div style="border-left:3px solid #FF3E9A;padding:2px 0 2px 10px;font-size:15px;color:#3d3a40;white-space:pre-wrap;word-break:break-word">${esc(t)}</div>`;
function storyCard(label: string, title: string, a: Answers, sharedAt: string) {
  const date = new Date(sharedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const rows = ROWS.map(([k, q]) => [q, val(a, k)]).filter(([, v]) => v)
    .map(([q, v]) => `<tr><td style="padding:5px 12px 5px 0;color:#5F5866;vertical-align:top;width:44%;border-top:1px solid #EEE7DC">${q}</td><td style="padding:5px 0;font-weight:bold;vertical-align:top;border-top:1px solid #EEE7DC">${esc(v)}</td></tr>`).join("");
  const story = typeof a.story === "string" ? a.story.trim() : "";
  const refl = typeof a.reflection === "string" ? a.reflection.trim() : "";
  // The card is a plain div so Gmail (which drops <details>) still shows it boxed and evenly aligned;
  // Apple Mail and iPhone Mail fold it behind the summary line.
  return `<div style="border:2px solid #17121C;border-radius:12px;background:#FFFDF8;margin:22px 0 0;padding:14px 16px">` +
    `<details><summary style="cursor:pointer;font-size:15px;font-weight:bold;margin:0;padding:0">${label} · shared ${date}</summary>` +
    `<div style="margin:0;padding:10px 0 0"><div style="font-size:17px;font-weight:bold;margin:0 0 8px">${esc(title)}</div>` +
    (rows ? `<table style="border-collapse:collapse;width:100%;font-size:14px;line-height:1.4;margin:0">${rows}</table>` : "") +
    (story ? sub("WHAT YOU WROTE") + quote(story) : "") + (refl ? sub("LOOKING BACK") + quote(refl) : "") + `</div></details></div>`;
}
const standing = (publish: boolean) =>
  p("Your story is approved, and it already counts in the insights.") +
  p(publish
    ? "It isn’t public yet. You said yes to publishing, so it’ll go up on GATHER when we open stories to everyone. Before it does, we’ll remove anything that could identify you or the other person, like names or places."
    : "It will never be public on GATHER, because you asked us not to publish it.");

// Personalised sticker pack (boards 31 and 32): a sealed envelope image and a Download & stick button.
const DEFAULT_BLURB =
  "Download it now and take back what’s yours: your peace, your standards, your playlist. It’s time to let go of what no longer serves you. Let the glow-up begin.";
const packBlock = (token: string, title: string, blurb?: string) =>
  `<div style="background:#FBF3E6;border:2px solid #17121C;border-radius:14px;padding:18px 18px 22px;margin:18px 0;text-align:center">` +
  `<img src="${SITE}/packs/${token}/email-gift.png" width="420" alt="A free sticker pack, made from your story: ${esc(title)}" style="display:block;width:100%;max-width:420px;height:auto;margin:0 auto 10px;border:0"/>` +
  `<p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#3d3a40">${esc(blurb?.trim() || DEFAULT_BLURB)}</p>` +
  `<a href="${SITE}/pack/${token}" style="display:inline-block;background:#FF3E9A;border:2.5px solid #17121C;border-radius:999px;padding:13px 26px;font-weight:bold;font-size:18px;color:#17121C;text-decoration:none">Download &amp; stick${ARROW}</a>` +
  `<p style="margin:14px 0 0;font-size:13px;color:#5F5866">3 stickers and a little note inside. No peeking till you open it.</p></div>`;

type Story = { id: string; publish: boolean; title: string | null; answers: Answers | null; created_at: string };
function build(kind: string, st: Story, note?: string, reason?: string, pack?: { token: string; title: string; blurb?: string }) {
  const publish = st.publish, storyId = st.id;
  const card = (label: string) => storyCard(label, st.title ?? "Your story", st.answers ?? {}, st.created_at);
  if (kind === "approved" && pack) {
    return {
      subject: "your story’s in. we made you something",
      html: shell(
        standing(publish) +
          (note?.trim() ? p(`${esc(note.trim())} While we were reading your story, we made you something.`) : p("While we were reading your story, we made you something.")) +
          packBlock(pack.token, pack.title, pack.blurb) + card("Your story") + feedback(storyId),
      ),
    };
  }
  if (kind === "approved") {
    return {
      subject: publish ? "your story made the cut" : "your story is officially counted",
      html: shell(standing(publish) + noteBlock(note) + button("See your story", `${SITE}/sign-in`) + changed + card("Your story") + feedback(storyId)),
    };
  }
  if (kind === "not_used") {
    const why = reason && REASONS[reason] ? REASONS[reason] : note?.trim() ? esc(note.trim()) : "";
    return {
      subject: "about your GATHER story",
      html: shell(
        p("Thanks for sharing your story with us. We read every single one, and this time we couldn’t use it.") +
          (why ? `<div style="background:#F3EEE4;border-radius:4px;padding:12px 14px;font-size:15px;margin:0 0 14px">${why}</div>` : "") +
          (reason && REASONS[reason] ? noteBlock(note) : "") +
          (reason === "unclear"
            ? p("Nothing from it is shown or counted. If there’s a real story behind it, we’d love to hear it.") + button("Share it again", `${SITE}/share`)
            : p("Nothing from it is shown or counted. You’re always welcome to share again, just leave out names, places and handles.") + button("Share again", `${SITE}/share`)) +
          card("What we received"),
      ),
    };
  }
  return {
    subject: "done. your story is down",
    html: shell(
      p("Your story is down. It doesn’t show anywhere, and your answers no longer count in the insights.") +
        p("Thanks for trusting us with it in the first place. If you ever want to share again, we’ll be here. No pressure.") +
        button("Back to GATHER", SITE),
    ),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const auth = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: me } = await asCaller.auth.getUser();
  if (!me.user) return json(401, { error: "sign in first" });

  let body: { story_id?: string; kind?: string; note?: string; reason?: string; pack_token?: string; pack_title?: string; pack_blurb?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad request" });
  }
  const { story_id, kind } = body;
  const note = body.note?.slice(0, 1000);
  const reason = body.reason && body.reason in REASONS ? body.reason : body.reason === "other" ? "other" : undefined;
  if (!story_id || !["approved", "not_used", "taken_down"].includes(kind ?? "")) return json(400, { error: "bad request" });
  const pack =
    kind === "approved" && body.pack_token && /^[A-Za-z0-9]{16,40}$/.test(body.pack_token)
      ? { token: body.pack_token, title: (body.pack_title ?? "your sticker pack").slice(0, 80), blurb: body.pack_blurb?.slice(0, 300) }
      : undefined;

  const { data: story } = await admin.from("stories").select("id, user_id, status, publish, title, answers, created_at").eq("id", story_id).maybeSingle();
  if (!story) return json(404, { error: "story not found" });

  if (kind === "taken_down") {
    if (story.user_id !== me.user.id || story.status !== "taken_down") return json(403, { error: "not allowed" });
  } else {
    const { data: ok } = await asCaller.rpc("am_reviewer");
    if (!ok) return json(403, { error: "reviewers only" });
    if (story.status !== kind) return json(409, { error: `story is ${story.status}, not ${kind}` });
  }

  const { data: owner } = await admin.auth.admin.getUserById(story.user_id);
  const to = owner.user?.email;
  if (!to) return json(404, { error: "no email for this story" });

  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) return json(500, { error: "email isn’t set up yet" });

  const { subject, html } = build(kind!, story as Story, note, reason, pack);
  try {
    const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
    await t.sendMail({ from: `GATHER <${user}>`, to, subject, html });
  } catch (e) {
    console.error("send failed", e instanceof Error ? e.message : e);
    return json(502, { error: "the email didn’t go out, try again" });
  }

  if (kind !== "taken_down") {
    await admin
      .from("stories")
      .update({ emailed_at: new Date().toISOString(), review_note: note?.trim() || null, notused_reason: kind === "not_used" ? reason ?? null : null })
      .eq("id", story_id);
  }
  return json(200, { ok: true });
});
