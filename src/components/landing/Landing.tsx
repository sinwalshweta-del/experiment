import Link from "next/link";
import { Collectibles, ArrowIcon } from "./Collectibles";
import { StoryTiles } from "./StoryTiles";

/**
 * First-timer landing page, implemented from the approved Claude Design
 * board "Final - 25/10/2026". Copy is verbatim from the board. Uses the
 * GATHER_BUILD_BRIEF tokens (brief-*), Archivo + Martian Mono and the
 * shared brief components. Layout: 12-column on desktop (lg, 1024+),
 * stacked on tablet and mobile.
 */

const display = "font-archivo font-black tracking-[-0.015em] [font-stretch:125%]";
const h2 = `${display} text-[40px] leading-[0.95] sm:text-[52px] lg:text-[64px]`;
const mono = "font-martian-mono text-xs font-semibold tracking-[0.04em] leading-[18px]";

type TagTone = "plain" | "peacock" | "rani" | "marigold" | "dark";
const TAG_TONES: Record<TagTone, string> = {
  plain: "bg-brief-white text-brief-ink",
  peacock: "bg-brief-peacock text-brief-paper",
  rani: "bg-brief-rani text-brief-ink",
  marigold: "bg-brief-marigold text-brief-ink",
  dark: "border-brief-paper bg-[#241D2B] text-brief-paper",
};

/** Non-interactive topic chip (same shape as the brief Chip). */
function Tag({ children, tone = "plain", className = "", style }: { children: React.ReactNode; tone?: TagTone; className?: string; style?: React.CSSProperties }) {
  const filled = tone === "peacock" || tone === "rani";
  return (
    <span
      className={`inline-flex min-h-[46px] items-center gap-2.5 whitespace-nowrap rounded border-2 pl-3 pr-4 font-archivo text-base font-semibold leading-5 ${tone === "dark" ? "shadow-[3px_3px_0_var(--color-brief-paper)]" : "shadow-[4px_4px_0_var(--color-brief-ink)]"} ${tone === "dark" ? "" : "border-brief-ink"} ${TAG_TONES[tone]} ${className}`}
      style={style}
    >
      <span aria-hidden className={`h-4 w-4 shrink-0 border-2 border-current ${filled ? "rounded-tl-full bg-current" : ""}`} />
      {children}
    </span>
  );
}

/**
 * Static Gather Point for the landing page: four quarter-discs touching,
 * exactly as on the board. (The brief GatherPoint animates its quadrants
 * in from apart, which reads as a broken logo in the header.)
 */
const QUARTERS = ["rounded-br-full", "rounded-bl-full", "rounded-tr-full", "rounded-tl-full"];
function Mark({ size, className = "" }: { size: number; className?: string }) {
  return (
    <span aria-hidden className={`grid shrink-0 grid-cols-2 grid-rows-2 ${className}`} style={{ width: size, height: size }}>
      {QUARTERS.map((q) => (
        <span key={q} className={`bg-current ${q}`} />
      ))}
    </span>
  );
}

function Header() {
  return (
    <header className="relative flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 lg:px-20 lg:pt-7">
      <Link
        href="/"
        aria-label="GATHER People Insights home"
        className="flex items-center gap-3 bg-brief-paper py-1 pr-2.5 text-brief-ink"
      >
        <Mark size={32} className="sm:hidden" />
        <Mark size={40} className="hidden sm:grid" />
        {/* stacked lockup on phones, one line from sm up */}
        <span className="flex flex-col gap-0.5 font-archivo leading-none sm:flex-row sm:items-baseline sm:gap-[0.3em]">
          <span className="text-[19px] font-black tracking-[-0.01em] [font-stretch:125%] sm:text-[20px]">GATHER</span>
          <span className="text-[13px] font-semibold sm:text-[20px]">People Insights</span>
        </span>
      </Link>
      <nav className="flex items-center gap-3 border-2 border-brief-ink bg-brief-paper py-1 pl-4 pr-1.5 max-sm:border-0 max-sm:bg-transparent max-sm:p-0">
        <Link href="/insights" className="hidden px-2 py-3 font-archivo text-base font-semibold text-brief-ink md:inline">
          Insights
        </Link>
        <a href="#how" className="hidden px-2 py-3 font-archivo text-base font-semibold text-brief-ink md:inline">
          How it works
        </a>
        <Link href="/share" className="landing-btn min-h-[44px] whitespace-nowrap px-4 text-[15px] sm:min-h-[46px] sm:px-5 sm:text-base">
          Share yours
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative grid gap-12 px-4 pb-20 pt-14 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-20 lg:pb-[110px] lg:pt-24">
      <div className="flex flex-col gap-7 lg:col-span-7">
        <h1 className={`${display} text-[48px] leading-[0.92] sm:text-[68px] lg:w-[759px] lg:text-[88px]`}>
          People are an experience. Rate yours.
        </h1>
        <p className="max-w-[600px] font-archivo text-[19px] leading-[29px] text-brief-ink lg:text-[21px] lg:leading-[32px]">
          The green flags, the red flags, the people who made your day, and the ones who made you question your life
          choices.
        </p>
        <div className="flex flex-col gap-[18px] sm:flex-row sm:flex-wrap">
          <Link href="/share" className="landing-btn">
            <span>Share yours</span> <ArrowIcon />
          </Link>
          <Link href="/insights" className="landing-btn bg-brief-white">
            See what people are saying
          </Link>
        </div>
        <span className={`${mono} text-[#5F5866]`}>4 MINS · MOSTLY TAPS · NO NAMES, EVER</span>
      </div>

      {/* Collage: absolutely placed on desktop, a loose stack below lg */}
      <div className="relative flex flex-col gap-6 lg:col-span-5 lg:block lg:h-[540px]">
        <div className="flex w-full max-w-[400px] -rotate-3 flex-col gap-4 rounded border-2 border-brief-ink bg-brief-ink p-7 text-brief-paper shadow-[8px_8px_0_var(--color-brief-rani)] lg:absolute lg:left-2.5 lg:top-10 lg:w-[400px]">
          <span className="font-archivo text-[26px] font-black leading-[1.05] [font-stretch:112%] lg:text-[30px]">
            ok but what did they get right?
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Tag tone="rani">made me laugh</Tag>
            <Tag tone="dark">had my back</Tag>
            <Tag tone="rani">actually listened</Tag>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:contents">
          <Tag tone="peacock" className="rotate-[4deg] lg:absolute lg:right-5 lg:top-0">situationship</Tag>
          <Tag className="-rotate-[5deg] lg:absolute lg:left-0 lg:top-[300px]">my ex girlfriend</Tag>
          <Tag tone="marigold" className="rotate-[3deg] lg:absolute lg:left-[150px] lg:top-[350px]">my mum, honestly</Tag>
        </div>
        <div className="flex w-full max-w-[300px] rotate-[2.5deg] flex-col gap-2 self-end rounded border-2 border-brief-ink bg-brief-lilac p-[22px] shadow-[6px_6px_0_var(--color-brief-ink)] lg:absolute lg:bottom-5 lg:right-0 lg:w-[300px]">
          <span className="landing-sample">SAMPLE DATA</span>
          <span className={`${display} text-[52px] leading-none`}>47%</span>
          <span className="font-archivo font-semibold leading-[22px]">got mixed signals too. you&apos;re not the only one.</span>
        </div>
      </div>
    </section>
  );
}

function Concept() {
  return (
    <section className="grid gap-10 border-y-2 border-brief-ink bg-brief-ink px-4 py-16 text-brief-paper sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-20 lg:py-[100px]">
      <div className="flex flex-col gap-6 lg:col-span-6">
        <h2 className={h2}>Like reviews. But for people. Minus the names.</h2>
        <p className="font-archivo text-[18px] leading-[28px] text-[#E2DCD0] lg:text-[20px] lg:leading-[31px]">
          Relationships, dating, marriage — the expectations, the green flags, the mixed signals. We&apos;re bringing
          people&apos;s experiences together to see what&apos;s really going on.
        </p>
        <p className="font-archivo text-[18px] font-bold leading-[28px] lg:text-[20px] lg:leading-[31px]">
          No one gets named or rated. You review the experience, not the person.
        </p>
      </div>
      <div className="flex flex-col gap-[18px] lg:col-span-5 lg:col-start-8">
        <StoryTiles />
        <p className="font-archivo text-base leading-6 text-[#B4ACBA]">
          Every tile is one story. On its own, it&apos;s a moment. Together, they show the patterns.
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Spill.",
    body: "Got a dating or relationship story? Tell us what happened.",
    card: "bg-brief-white text-brief-ink",
    mark: "text-brief-peacock",
    lift: "",
  },
  {
    n: "02",
    title: "A real person reads it.",
    body: "We review every story before it goes live, to keep things safe and useful.",
    card: "bg-brief-marigold text-brief-ink",
    mark: "text-brief-ink",
    lift: "lg:translate-y-6",
  },
  {
    n: "03",
    title: "It joins the pattern.",
    body: "Once approved, your story joins the others to build a bigger picture of dating and relationships. Along the way, you might find a GATHER Collectible or two.",
    card: "bg-brief-peacock text-brief-paper",
    mark: "text-brief-rani",
    lift: "lg:translate-y-12",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="flex scroll-mt-6 flex-col gap-12 px-4 py-16 sm:px-8 lg:px-20 lg:pb-[158px] lg:pt-[110px]">
      <h2 className={`${h2} max-w-[900px]`}>Here&apos;s the whole thing.</h2>
      <ol className="flex flex-col gap-5 md:grid md:grid-cols-3 lg:flex lg:flex-row lg:items-stretch">
        {STEPS.map((s, i) => (
          <li key={s.n} className="contents">
            {i > 0 && (
              <span aria-hidden className="hidden self-center text-brief-ink lg:block">
                <ArrowIcon size={40} />
              </span>
            )}
            <div className={`flex flex-1 flex-col gap-3 rounded border-2 border-brief-ink p-7 shadow-[6px_6px_0_var(--color-brief-ink)] ${s.card} ${s.lift}`}>
              <Mark size={44} className={s.mark} />
              <span className={`${mono} opacity-70`}>{s.n}</span>
              <h3 className={`${display} text-[28px] leading-none lg:text-[30px]`}>{s.title}</h3>
              <p className="font-archivo text-[17px] leading-[27px]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Topics() {
  return (
    <section className="flex flex-col gap-9 overflow-hidden border-y-2 border-brief-ink bg-brief-marigold py-16 lg:py-[100px]">
      <div className="grid gap-6 px-4 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-20">
        <h2 className={`${h2} lg:col-span-7`}>It&apos;s complicated. Let&apos;s talk.</h2>
        <p className="font-archivo text-[18px] leading-[28px] lg:col-span-5 lg:col-start-8 lg:text-[19px] lg:leading-[29px]">
          First dates, situationships, exes and everything in between. It&apos;s about how it went, not who they were.
        </p>
      </div>
      <div className="flex -rotate-[1.5deg] flex-wrap gap-3.5 px-4 sm:px-8 lg:flex-nowrap lg:pl-20">
        <Tag>dating</Tag>
        <Tag tone="peacock">situationships</Tag>
        <Tag>first dates</Tag>
        <Tag tone="rani">red flags</Tag>
        <Tag>mixed signals</Tag>
        <Tag>long-distance</Tag>
      </div>
      <div className="flex -rotate-[1.5deg] flex-wrap gap-3.5 px-4 sm:px-8 lg:flex-nowrap lg:pl-[220px]">
        <Tag>exes</Tag>
        <Tag tone="peacock">green flags</Tag>
        <Tag>ghosting</Tag>
        <Tag>breakups</Tag>
        <Tag tone="rani">the one that got away</Tag>
      </div>
    </section>
  );
}

const SAMPLE_BARS = [
  { label: "dating app", pct: 40 },
  { label: "through friends", pct: 19 },
  { label: "work", pct: 16 },
];

function InsightsPeek() {
  return (
    <section className="grid gap-10 border-y-2 border-brief-ink bg-brief-lilac px-4 py-16 sm:px-8 lg:grid-cols-12 lg:items-start lg:gap-7 lg:px-20 lg:py-[100px]">
      <div className="flex flex-col gap-5 lg:col-span-5">
        <h2 className={`${display} text-[40px] leading-[0.95] sm:text-[48px] lg:text-[56px]`}>
          A peek at what you&apos;ll find.
        </h2>
        <p className="font-archivo text-[18px] leading-[28px] lg:text-[19px] lg:leading-[29px]">
          As more people share their stories, we&apos;ll start spotting patterns in dating and relationships. Every
          story adds another piece to the picture.
        </p>
        <Link href="/insights" className="landing-btn self-start bg-brief-white">
          Explore insights
        </Link>
      </div>
      <div className="flex flex-col gap-[22px] lg:col-span-6 lg:col-start-7">
        <div className="flex flex-col gap-3 rounded border-2 border-brief-ink bg-brief-white p-5 shadow-[6px_6px_0_var(--color-brief-ink)] sm:p-7">
          <span className="landing-sample self-start">SAMPLE DATA · FOR ILLUSTRATION ONLY</span>
          <h3 className="font-archivo text-[24px] font-black leading-[1.05] [font-stretch:112%] sm:text-[28px]">
            Where are people meeting these days?
          </h3>
          {SAMPLE_BARS.map((b) => (
            <div key={b.label} className="grid grid-cols-[110px_1fr_44px] items-center gap-3 font-archivo sm:grid-cols-[160px_1fr_50px]">
              <span>{b.label}</span>
              <div className="h-5 border-2 border-brief-ink bg-brief-paper">
                <div className="h-full border-r-2 border-brief-ink bg-brief-peacock" style={{ width: `${b.pct}%` }} />
              </div>
              <span className={mono}>{b.pct}%</span>
            </div>
          ))}
          <span className={`${mono} text-[#5F5866]`}>NOT REAL DATA. REAL NUMBERS SHOW UP ONCE STORIES COME IN.</span>
        </div>
        <div className="flex w-full -rotate-[1.5deg] flex-col gap-3.5 self-end rounded border-2 border-brief-ink bg-brief-marigold p-5 shadow-[6px_6px_0_var(--color-brief-ink)] sm:w-[86%] sm:p-7">
          <span className={`${mono} text-[#4A3A10]`}>QUESTIONS WE&apos;RE EXPLORING</span>
          <ul className="flex flex-col gap-3">
            {[
              "Do green flags look the same at work and in dating?",
              "What do people wish they'd noticed sooner?",
              "Where do the friendships that last tend to start?",
            ].map((q) => (
              <li key={q} className="relative pl-7 font-archivo text-[18px] font-extrabold leading-[25px] [font-stretch:112%] sm:text-[20px] sm:leading-[26px]">
                <span aria-hidden className="absolute left-0 top-[5px] h-4 w-4 rounded-tl-full bg-brief-ink" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const RULES = [
  "Leave out names, handles, workplaces, schools and exact places.",
  "Nothing about religion or caste.",
  "A person reviews every story before it's used.",
  "Every approved story is shared anonymously. Together, they help us understand what's happening in modern relationships.",
  "We only show group insights when enough people have shared.",
  "It's about experiences, not exposing or targeting anyone.",
  "18+ only.",
];

function Rules() {
  return (
    <section className="grid gap-10 bg-brief-ink px-4 py-16 text-brief-paper sm:px-8 lg:grid-cols-12 lg:items-start lg:gap-7 lg:px-20 lg:py-[100px]">
      <h2 className={`${display} text-[40px] leading-[0.95] sm:text-[48px] lg:col-span-5 lg:text-[56px]`}>
        The rules we don&apos;t break.
      </h2>
      <ul className="flex flex-col gap-[22px] lg:col-span-6 lg:col-start-7">
        {RULES.map((r) => (
          <li key={r} className="flex items-start gap-3.5 font-archivo text-[17px] font-semibold leading-[25px] sm:text-[19px] sm:leading-[27px]">
            <span aria-hidden className="mt-[3px] h-[22px] w-[22px] shrink-0 rounded-tl-full border-2 border-brief-paper bg-brief-rani" />
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}

const FAQS = [
  {
    q: "Is it anonymous?",
    a: "We never ask for your name. Your email is only used to sign in and update you about your story. It's never shown publicly or attached to anything we publish.",
  },
  {
    q: "Who can read what I write?",
    a: "Your full story may be published on GATHER, but never with your identity attached. The GATHER team reviews every submission before it goes live, removing identifying details to help protect your privacy.",
  },
  {
    q: "How does review work?",
    a: "A real person checks every story within a few hours. It's approved, approved with edits, or not used, and we'll email you to say which.",
  },
  {
    q: "What if I mention a name by accident?",
    a: "We'll nudge you while you type, and the team removes identifying details before anything is used.",
  },
  { q: "Can I take my story down?", a: "Yes, anytime, using the link in your email." },
  { q: "Does it cost anything?", a: "No. Sharing is free, and so are the insights." },
];

function FairQuestions() {
  return (
    <section id="faq" className="flex scroll-mt-6 flex-col gap-8 px-4 py-16 sm:px-8 lg:px-20 lg:py-[110px]">
      <h2 className={h2}>Fair questions.</h2>
      <dl className="border-b-2 border-brief-ink">
        {FAQS.map((f) => (
          <div key={f.q} className="grid gap-2 border-t-2 border-brief-ink py-[22px] md:grid-cols-12 md:gap-6">
            <dt className="font-archivo text-[20px] font-extrabold leading-[1.2] [font-stretch:112%] md:col-span-5 lg:text-[22px]">
              {f.q}
            </dt>
            <dd className="font-archivo text-[17px] leading-[27px] md:col-span-6 md:col-start-7">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t-2 border-brief-ink bg-brief-rani px-4 py-20 sm:px-8 lg:px-20 lg:py-[110px]">
      <div aria-hidden className="absolute -bottom-[60px] -right-[60px] h-[200px] w-[200px] rounded-tl-full bg-brief-ink sm:h-[360px] sm:w-[360px]" />
      <div className="relative flex max-w-[860px] flex-col gap-[26px]">
        <h2 className={`${display} text-[52px] leading-[0.9] sm:text-[72px] lg:text-[96px]`}>Got a story to share?</h2>
        <p className="font-archivo text-[19px] font-semibold leading-[29px] lg:text-[22px] lg:leading-[32px]">
          Good, bad or complicated, it takes about 4 minutes. Leave the names out and help someone else spot the
          pattern.
        </p>
        <Link
          href="/share"
          className="landing-btn self-start bg-brief-ink text-brief-paper shadow-[5px_5px_0_var(--color-brief-paper)]"
        >
          Share yours <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="flex flex-col gap-5 bg-brief-ink px-4 py-9 text-brief-paper sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-20">
      <span role="img" aria-label="GATHER" className="text-brief-paper">
        <Mark size={32} />
      </span>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <Link href="/take-down" className="font-archivo text-[15px] underline underline-offset-[3px]">
          Take my story down
        </Link>
        <span className={`${mono} text-[#B4ACBA]`}>© 2026 GATHER</span>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="relative overflow-x-clip bg-brief-paper font-archivo text-[17px] leading-[27px] text-brief-ink">
      {/* corner blobs behind the header */}
      <div aria-hidden className="pointer-events-none absolute -right-[90px] -top-[90px] h-[180px] w-[180px] rounded-bl-full border-2 border-brief-ink bg-brief-rani sm:h-[380px] sm:w-[380px] lg:h-[520px] lg:w-[520px]" />
      <div aria-hidden className="pointer-events-none absolute -top-0.5 right-[400px] hidden h-[170px] w-[170px] rounded-br-full border-2 border-brief-ink bg-brief-marigold lg:block" />
      <Header />
      <Hero />
      <Concept />
      <HowItWorks />
      <Collectibles />
      <Topics />
      <InsightsPeek />
      <Rules />
      <FairQuestions />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
