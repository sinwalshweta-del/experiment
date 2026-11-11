"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Shrikhand, Poppins } from "next/font/google";
import { Mark } from "@/components/site/Mark";
import type { Pack } from "@/lib/packs";
import { packPath } from "@/lib/packs";

const shrikhand = Shrikhand({ weight: "400", subsets: ["latin"], variable: "--font-shrikhand" });
const poppins = Poppins({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-poppins" });

const INK = "#1B1420";
const PINK = "#FF3E9A";
const GOLD = "#FFB627";

/**
 * The unboxing page behind "Download & stick" (approved on Claude Design board 32):
 * a sealed envelope, then the letter, then the sticker sheet with downloads.
 */
function Envelope({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 240 170" width="100%" style={{ maxWidth: 360, overflow: "visible", display: "block" }} aria-hidden>
      <rect x="14" y="26" width="200" height="128" rx="10" fill={INK} />
      <rect x="8" y="20" width="200" height="128" rx="10" fill="#FFFDF8" stroke={INK} strokeWidth="3" />
      <path d="M 10,146 L 82,84 M 206,146 L 134,84" fill="none" stroke={INK} strokeWidth="2" opacity=".35" />
      <path
        d="M 10,24 L 108,98 L 206,24"
        fill="#FBF3E6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
        className="pk-flap"
        style={{ transformOrigin: "108px 22px", transform: open ? "rotateX(180deg)" : "none" }}
      />
      {!open && (
        <g>
          <circle cx="108" cy="98" r="22" fill={PINK} stroke={INK} strokeWidth="3" />
          <path d="M 108,109 l -9,-9 c -5,-5 -1,-12 5,-11 c 2,0 3,1 4,3 c 1,-2 2,-3 4,-3 c 6,-1 10,6 5,11 z" fill="#FFF7EC" />
        </g>
      )}
      <g transform="rotate(-8 180 32)">
        <rect x="132" y="16" width="96" height="28" rx="14" fill={GOLD} stroke={INK} strokeWidth="2.5" />
        <text x="180" y="35" textAnchor="middle" fontWeight="700" fontSize="12" fill={INK} style={{ fontFamily: "var(--font-poppins)" }}>
          just for you
        </text>
      </g>
    </svg>
  );
}

function Heart() {
  return (
    <svg width="18" height="16" viewBox="0 0 20 18" aria-hidden style={{ display: "inline", verticalAlign: "-2px" }}>
      <path d="M10 17 L2.2 9.4 C-1 6.2 1.2 1 5.4 1 C7.6 1 9 2.4 10 3.9 C11 2.4 12.4 1 14.6 1 C18.8 1 21 6.2 17.8 9.4 Z" fill="#E2264D" />
    </svg>
  );
}

const dl =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-[2.5px] border-[#1B1420] px-5 text-[15px] font-bold shadow-[3px_3px_0_#1B1420] transition-transform hover:-translate-x-px hover:-translate-y-px motion-reduce:transition-none";

export function PackUnbox({ pack }: { pack: Pack }) {
  const [stage, setStage] = useState<"sealed" | "letter" | "stickers">("sealed");
  const letterRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<HTMLElement>(null);
  const base = packPath(pack);

  const open = () => {
    setStage("letter");
    window.setTimeout(() => letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 420);
  };
  const reveal = () => {
    setStage("stickers");
    window.setTimeout(() => stickersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <main
      className={`${shrikhand.variable} ${poppins.variable} min-h-dvh bg-[#FBF3E6] text-[#1B1420]`}
      style={{ fontFamily: "var(--font-poppins), Arial, sans-serif", backgroundImage: "radial-gradient(rgba(27,20,32,.05) 1px, transparent 1.2px)", backgroundSize: "9px 9px" }}
    >
      <style>{`
        .pk-flap{transition:transform .6s cubic-bezier(.3,.7,.2,1)}
        .pk-in{animation:pk-in .7s cubic-bezier(.2,.8,.2,1) both}
        @keyframes pk-in{from{opacity:0;transform:translateY(40px) rotate(-1deg)}to{opacity:1;transform:none}}
        .pk-wiggle{animation:pk-w 2.4s ease-in-out infinite}
        @keyframes pk-w{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-3deg)}84%{transform:rotate(3deg)}92%{transform:rotate(-1deg)}}
        @media (prefers-reduced-motion: reduce){.pk-flap{transition:none}.pk-in{animation:none}.pk-wiggle{animation:none}}
        .pk-title{font-family:var(--font-shrikhand);color:${PINK};-webkit-text-stroke:3px ${INK};paint-order:stroke;text-shadow:5px 5px 0 ${INK};line-height:.98}
        .pk-kicker{font-family:var(--font-shrikhand);color:${GOLD};-webkit-text-stroke:2.5px ${INK};paint-order:stroke;text-shadow:3px 3px 0 ${INK};display:inline-block;transform:rotate(-3deg)}
      `}</style>

      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" aria-label="GATHER home" className="text-[#1B1420]">
          <Mark size={30} />
        </Link>
        <span className="text-[13px] font-medium text-[#5F5866]">A private page, just for you</span>
      </header>

      {/* 1 · the sealed envelope */}
      <section className="mx-auto flex max-w-[640px] flex-col items-center gap-5 px-4 pb-10 pt-6 text-center sm:pt-12">
        <span className="pk-kicker text-[34px] sm:text-[44px]">{pack.kicker}</span>
        <h1 className="pk-title m-0 -mt-2 text-[64px] sm:text-[96px]">{pack.title.replace(`${pack.kicker} `, "")}</h1>
        <p className="m-0 text-[17px] font-medium">A sticker pack, made from your story.</p>
        <button
          type="button"
          onClick={open}
          disabled={stage !== "sealed"}
          aria-label={stage === "sealed" ? "Open your envelope" : "Envelope opened"}
          className={`mt-4 w-full max-w-[360px] cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default ${stage === "sealed" ? "pk-wiggle" : ""}`}
          style={{ perspective: 600 }}
        >
          <Envelope open={stage !== "sealed"} />
        </button>
        {stage === "sealed" && (
          <button type="button" onClick={open} className={`${dl} mt-2 bg-[#FF3E9A] text-[17px]`}>
            Tap to open
          </button>
        )}
      </section>

      {/* 2 · the letter */}
      {stage !== "sealed" && (
        <section ref={letterRef} className="mx-auto max-w-[640px] scroll-mt-6 px-4 pb-12">
          <div className="pk-in relative -rotate-1 border-2 border-[#1B1420] bg-[#FFFDF8] px-6 py-10 shadow-[8px_8px_0_#1B1420] sm:px-12">
            <span aria-hidden className="absolute -top-4 left-1/2 h-8 w-36 -translate-x-1/2 rotate-3 border border-[rgba(27,20,32,.25)] bg-[#FF8FC4] opacity-85" />
            <span aria-hidden className="pointer-events-none absolute inset-3 border border-dashed border-[rgba(255,62,154,.5)]" />
            <h2 className="m-0 mb-5 text-[28px] font-normal text-[#FF3E9A]" style={{ fontFamily: "var(--font-shrikhand)" }}>
              a little note, just for you
            </h2>
            <div className="flex flex-col gap-4 text-[16px] leading-[1.65] sm:text-[17px]">
              <p className="m-0">{pack.letter.greeting}</p>
              {pack.letter.paragraphs.map((t) => (
                <p key={t} className="m-0">
                  {t}
                </p>
              ))}
              <p className="m-0 mt-2 whitespace-pre-line font-bold">
                {pack.letter.sign} <Heart />
              </p>
            </div>
          </div>
          {stage === "letter" && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={reveal} className={`${dl} bg-[#FFB627] text-[17px]`}>
                See your stickers &#8594;
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3 · the stickers + downloads */}
      {stage === "stickers" && (
        <section ref={stickersRef} className="mx-auto flex max-w-[860px] scroll-mt-6 flex-col items-center gap-8 px-4 pb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${base}/sticker-sheet.png`}
            alt={`${pack.title} sticker sheet with three stickers: ${pack.stickers.map((s) => s.name).join(", ")}`}
            className="pk-in w-full max-w-[720px] rounded-[22px] shadow-[0_24px_50px_rgba(60,35,45,.22)]"
          />
          <a href={`${base}/${pack.zip}`} download className={`${dl} bg-[#FF3E9A] px-7 text-[18px]`}>
            Download everything &#8594;
          </a>
          <div className="grid w-full max-w-[720px] grid-cols-1 gap-4 sm:grid-cols-2">
            <a href={`${base}/sticker-sheet.png`} download={`${pack.zip.replace(/\.zip$/, "")}-sticker-sheet.png`} className={`${dl} bg-white`}>
              Sticker sheet (to print) &#8594;
            </a>
            <a href={`${base}/note.png`} download="a-note-from-gather.png" className={`${dl} bg-white`}>
              The letter &#8594;
            </a>
            {pack.stickers.map((s, i) => (
              <a key={s.file} href={`${base}/${s.file}`} download={`sticker-${i + 1}.png`} className={`${dl} bg-white`}>
                {s.name} &#8594;
              </a>
            ))}
          </div>
          <p className="m-0 max-w-[560px] text-center text-[14px] leading-[22px] text-[#5F5866]">
            The three stickers have no background, so you can add them as WhatsApp stickers or drop them on your Instagram stories.
          </p>
        </section>
      )}

      <footer className="px-4 pb-10 pt-4 text-center text-[15px] font-medium">
        Digitally crafted with <Heart /> by <b>GATHER</b> © 2026
      </footer>
    </main>
  );
}
