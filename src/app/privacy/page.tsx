import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy · GATHER People Insights",
  description: "What GATHER collects, why, who sees it, and how to remove it. In plain words.",
};

/**
 * Privacy page in plain words. Every line here must stay true to how the site
 * actually works (lib/share/*, supabase/migrations). Update the date when it changes.
 */
const UPDATED = "31 October 2026";

const SECTIONS: { h: string; body: React.ReactNode }[] = [
  {
    h: "The short version",
    body: (
      <ul>
        <li>You share a dating or relationship experience. Never names, never the other person.</li>
        <li>Your email is only for signing in and for us to tell you about your story. It is never shown with your story.</li>
        <li>A real person reads every story before it&apos;s used.</li>
        <li>You can take your story down anytime, and then what you wrote is erased.</li>
        <li>No ads, no selling your data, no tracking cookies.</li>
      </ul>
    ),
  },
  {
    h: "What we collect",
    body: (
      <>
        <p><b>Your email address.</b> So you can sign in with a one-time code, come back to your story on any device, and hear from us about it.</p>
        <p><b>Your story and answers.</b> What you write, and the options you pick: the kind of connection, how you met, how it went, what felt good or hard.</p>
        <p><b>A little about you, if you choose.</b> Age range, gender and region. Every one of these has &ldquo;Prefer not to say&rdquo;.</p>
        <p><b>Your unfinished draft.</b> Saved as you go, so you don&apos;t lose your answers.</p>
        <p><b>Basic technical logs.</b> Like any website, our providers keep short-lived logs (such as IP address and browser) to keep the service running and secure.</p>
        <p>We ask you not to include names, places, handles or anything that could identify you or anyone else. If something slips in, our team removes it before anything is used.</p>
      </>
    ),
  },
  {
    h: "Why we collect it",
    body: (
      <ul>
        <li>To let you sign in and pick up where you left off.</li>
        <li>To review your story and, if you agree, share it anonymously.</li>
        <li>To build group insights about dating and relationships, so people going through the same thing feel less alone.</li>
        <li>To email you about your story, for example when it&apos;s been reviewed.</li>
      </ul>
    ),
  },
  {
    h: "Who sees what",
    body: (
      <>
        <p><b>You</b> see your own stories and drafts, and nobody else&apos;s.</p>
        <p><b>The GATHER team</b> reads stories to review them, and can see the email that sent each one, so we can reply to you. Nobody else can.</p>
        <p><b>The public</b> only ever sees:</p>
        <ul>
          <li>stories you chose to publish, after review, with anything identifying taken out, and never with your email;</li>
          <li>group insights, which are only counts. A number appears only once at least 20 approved stories answered that question, and any answer given by fewer than 5 people is grouped into &ldquo;Other answers&rdquo;, so no one can be picked out.</li>
        </ul>
        <p>If you choose &ldquo;Use my answers in insights only&rdquo;, your story is never published.</p>
      </>
    ),
  },
  {
    h: "Where it's kept",
    body: (
      <>
        <p>Your account, stories and answers are stored with Supabase, on servers in South Korea. The website runs on Vercel. Sign-in codes and emails about your story are sent through Gmail (Google).</p>
        <p>These providers process data only to run GATHER for us. We don&apos;t sell or rent your data, and we don&apos;t use it for advertising.</p>
      </>
    ),
  },
  {
    h: "How long we keep it",
    body: (
      <ul>
        <li><b>Your story</b> stays until you take it down or ask us to delete it.</li>
        <li><b>When you take a story down,</b> what you wrote and every answer is erased straight away. We keep only a short record (its title and dates) so your account shows it&apos;s down.</li>
        <li><b>Your draft</b> is cleared when you send your story or start a new one.</li>
        <li><b>Your account and email</b> stay until you ask us to delete them.</li>
      </ul>
    ),
  },
  {
    h: "Your choices",
    body: (
      <ul>
        <li><b>Take a story down anytime</b> from <Link href="/take-down">Take my story down</Link>. No reason needed.</li>
        <li><b>See your stories</b> and where they are in review by <Link href="/sign-in">signing in</Link>.</li>
        <li><b>Delete your account and everything with it,</b> get a copy of your data, or correct something: write to <a href="mailto:gatherpeopleinsights@gmail.com">gatherpeopleinsights@gmail.com</a> (or reply to any email from us) and we&apos;ll do it within 30 days.</li>
      </ul>
    ),
  },
  {
    h: "Cookies and storage",
    body: (
      <p>
        No ads, no analytics and no tracking cookies. Your browser keeps your sign-in and a copy of your draft so the site works smoothly. Signing out removes your sign-in.
      </p>
    ),
  },
  {
    h: "Who can use GATHER",
    body: <p>GATHER is for people aged 18 and over.</p>,
  },
  {
    h: "Questions or concerns",
    body: (
      <p>
        Write to <a href="mailto:gatherpeopleinsights@gmail.com">gatherpeopleinsights@gmail.com</a> and a real person will get back to you. If we ever change how we handle your data, we&apos;ll update this page and the date at the top.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-brief-paper font-archivo text-brief-ink">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-10 px-4 pb-16 pt-10 sm:px-8 md:pt-16">
        <div className="flex flex-col gap-4">
          <h1 className="m-0 text-[48px] font-black leading-[0.92] tracking-[-0.02em] [font-stretch:125%] sm:text-[64px]">Privacy, in plain words</h1>
          <p className="m-0 text-[15px] text-[#5F5866]">Last updated {UPDATED}</p>
        </div>
        {SECTIONS.map((s) => (
          <section key={s.h} className="privacy flex flex-col gap-3 text-[17px] leading-[1.6]">
            <h2 className="m-0 text-[26px] font-black leading-tight [font-stretch:112%]">{s.h}</h2>
            {s.body}
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
