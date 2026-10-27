import { COLLECTIBLES_DEFS } from "./collectiblesDefs";

/**
 * GATHER Collectibles section, built from the approved Claude Design board.
 * The artwork is the exact SVG from the board; pieces are positioned as
 * percentages of a fixed-ratio box so the composition scales without
 * reflowing. Desktop and mobile use the two arrangements from the board.
 */

type Piece = {
  id: string;
  w: number;
  h: number;
  left: number;
  top: number;
  rot: number;
  label: string;
  /** die-cut stickers carry their own shadow inside the SVG filter */
  sticker?: boolean;
};

const LABELS = {
  post: "Air mail postcard: the plot twist wasn't your fault. Greetings from the other side.",
  arc: "Arc-shaped progress gauge sticker: status, healing arc, in progress, 72 percent.",
  cert: "Certificate of appreciation: this certifies that you were, in fact, a green flag.",
  ticket: "Ticket: admit one, the talking stage. Expires at 'so, what are we?'",
};

// Board coordinates. Desktop box is 740 x 740 (board art area shifted
// down 40px so the gauge's negative top fits); mobile box is 358 x 470.
const DESKTOP = {
  box: { w: 740, h: 740 },
  pieces: [
    { id: "x-post2", w: 450, h: 291, left: 10, top: 80, rot: -5, label: LABELS.post },
    { id: "x-arc", w: 270, h: 218, left: 470, top: 0, rot: 7, label: LABELS.arc, sticker: true },
    { id: "x-cert", w: 380, h: 285, left: 310, top: 310, rot: 4, label: LABELS.cert },
    { id: "x-ticket", w: 410, h: 171, left: 0, top: 540, rot: -7, label: LABELS.ticket },
  ] satisfies Piece[],
};

const MOBILE = {
  box: { w: 358, h: 470 },
  pieces: [
    { id: "x-post2", w: 260, h: 168, left: -6, top: 60, rot: -5, label: LABELS.post },
    { id: "x-arc", w: 150, h: 121, left: 214, top: 4, rot: 8, label: LABELS.arc, sticker: true },
    { id: "x-cert", w: 230, h: 173, left: 128, top: 218, rot: 4, label: LABELS.cert },
    { id: "x-ticket", w: 250, h: 104, left: -4, top: 340, rot: -8, label: LABELS.ticket },
  ] satisfies Piece[],
};

function Arrangement({
  layout,
  className,
}: {
  layout: { box: { w: number; h: number }; pieces: Piece[] };
  className: string;
}) {
  const { box, pieces } = layout;
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `${box.w} / ${box.h}` }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          role="img"
          aria-label={p.label}
          className={`landing-collectible ${p.sticker ? "is-sticker" : ""}`}
          style={
            {
              left: `${(p.left / box.w) * 100}%`,
              top: `${(p.top / box.h) * 100}%`,
              width: `${(p.w / box.w) * 100}%`,
              "--r": `${p.rot}deg`,
            } as React.CSSProperties
          }
        >
          <svg viewBox={`0 0 ${p.w} ${p.h}`} className="block h-auto w-full overflow-visible" aria-hidden>
            <use href={`#${p.id}`} width={p.w} height={p.h} />
          </svg>
        </div>
      ))}
    </div>
  );
}

function Postmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 160" role="img" aria-label="A little something from GATHER" className={`overflow-visible text-brief-marigold ${className}`}>
      <use href="#c-pm" width={300} height={160} />
    </svg>
  );
}

export function Collectibles() {
  return (
    <section
      data-reveal
      aria-labelledby="gc-h"
      className="landing-mat relative overflow-hidden border-y-2 border-brief-ink text-brief-paper"
    >
      {/* artwork definitions, referenced by <use> below */}
      <svg
        width="0"
        height="0"
        className="absolute"
        aria-hidden
        focusable="false"
        dangerouslySetInnerHTML={{ __html: `<defs>${COLLECTIBLES_DEFS}</defs>` }}
      />
      <div
        aria-hidden
        data-px="120"
        className="pointer-events-none absolute -bottom-[90px] -left-[90px] hidden h-[280px] w-[280px] rounded-tr-full border-2 border-brief-ink bg-brief-rani lg:block"
      />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:min-h-[920px] lg:grid-cols-[540px_1fr] lg:items-center lg:gap-[60px] lg:px-20 lg:py-0">
        <div data-px="14" className="relative flex flex-col gap-6 lg:gap-7">
          <Postmark className="-ml-1 h-auto w-[160px] lg:-ml-1.5 lg:w-[220px]" />
          <h2
            id="gc-h"
            className="font-archivo text-[38px] font-black leading-[0.96] tracking-[-0.015em] [font-stretch:125%] sm:text-[52px] lg:text-[64px] lg:leading-[0.94]"
          >
            Share your experience. <span className="text-brief-marigold">Discover GATHER Collectibles.</span>
          </h2>
          <p className="max-w-[500px] font-archivo text-[17px] leading-[27px] text-[#E2DCD0] lg:text-[20px] lg:leading-[31px]">
            From little pick-me-ups to feel-good appreciation, discover quirky keepsakes inspired by life&rsquo;s plot
            twists, green flags and everything in between.
          </p>
          <a
            href="/share"
            className="landing-btn mt-1.5 w-full shadow-[5px_5px_0_var(--color-brief-paper)] sm:w-auto sm:self-start"
          >
            Spill yours <ArrowIcon />
          </a>
        </div>
        <div data-px="46" className="mx-auto w-full max-w-[740px]">
          <Arrangement layout={DESKTOP} className="hidden sm:block" />
          <Arrangement layout={MOBILE} className="sm:hidden" />
        </div>
      </div>
    </section>
  );
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="M3 10h13M11 4l6 6-6 6" />
    </svg>
  );
}
