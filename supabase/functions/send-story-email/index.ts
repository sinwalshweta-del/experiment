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
const button = (label: string, href: string) =>
  `<p style="margin:6px 0 16px"><a href="${href}" style="display:inline-block;background:#FF3E9A;color:#17121C;border:2px solid #17121C;border-radius:4px;padding:11px 20px;font-weight:bold;font-size:15px;text-decoration:none">${label}</a></p>`;
const noteBlock = (note?: string) =>
  note?.trim()
    ? `<div style="border-left:4px solid #FF3E9A;background:#FFF3F8;padding:12px 14px;font-size:15px;margin:0 0 14px"><div style="font-size:12px;letter-spacing:.06em;color:#5F5866;margin-bottom:4px"><b>A NOTE FROM THE TEAM</b></div>${esc(note.trim())}</div>`
    : "";
const changed = p(`<span style="font-size:15px">Changed your mind? You can take it down anytime from your account.</span>`);

function build(kind: string, publish: boolean, note?: string, reason?: string) {
  if (kind === "approved" && publish) {
    return {
      subject: "your story made the cut",
      html: shell(
        p("Good news: your story made it through review.") +
          p("You chose to publish it, so it’ll be shared on GATHER once stories go live, with anything that could point to anyone taken out. It already counts in the insights, helping someone else spot the pattern.") +
          noteBlock(note) + button("See your story", `${SITE}/sign-in`) + changed,
      ),
    };
  }
  if (kind === "approved") {
    return {
      subject: "your story is officially counted",
      html: shell(
        p("Good news: your story made it through review.") +
          p("Like you asked, it won’t be published. Your answers now count in the insights, so someone going through the same thing feels a little less alone.") +
          noteBlock(note) + button("See your story", `${SITE}/sign-in`) + changed,
      ),
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
          p("Nothing from it is shown or counted. You’re always welcome to share again, just leave out names, places and handles.") +
          button("Share again", `${SITE}/share`),
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

  let body: { story_id?: string; kind?: string; note?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad request" });
  }
  const { story_id, kind } = body;
  const note = body.note?.slice(0, 1000);
  const reason = body.reason && body.reason in REASONS ? body.reason : body.reason === "other" ? "other" : undefined;
  if (!story_id || !["approved", "not_used", "taken_down"].includes(kind ?? "")) return json(400, { error: "bad request" });

  const { data: story } = await admin.from("stories").select("id, user_id, status, publish").eq("id", story_id).maybeSingle();
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

  const { subject, html } = build(kind!, story.publish, note, reason);
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
