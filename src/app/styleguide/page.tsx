"use client";

import { useState } from "react";
import { WorldProvider, World } from "@/components/brief/World";
import { Button } from "@/components/brief/Button";
import { Chip } from "@/components/brief/Chip";
import { Rating } from "@/components/brief/Rating";
import { TextField, TextArea } from "@/components/brief/TextField";
import { ProgressTiles } from "@/components/brief/ProgressTiles";
import { Card } from "@/components/brief/Card";
import { GatherPoint } from "@/components/brief/GatherPoint";
import { Nav } from "@/components/brief/Nav";
import { Footer } from "@/components/brief/Footer";

const PALETTE = [
  { name: "ink", hex: "#17121C" },
  { name: "paper", hex: "#F3EEE4" },
  { name: "rani", hex: "#FF3E9A" },
  { name: "marigold", hex: "#FFB627" },
  { name: "peacock", hex: "#006B5B" },
  { name: "lilac", hex: "#BDB2FF" },
  { name: "white", hex: "#FFFFFF" },
] as const;

const WORLDS: { id: World; label: string }[] = [
  { id: "basics", label: "basics — “a bit of both”" },
  { id: "rant", label: "rant — “kinda rough”" },
  { id: "grateful", label: "grateful — “honestly good”" },
];

function WorldSection({ world, label }: { world: World; label: string }) {
  const [selectedChip, setSelectedChip] = useState<string | null>("respect");
  const [ratingValue, setRatingValue] = useState<string | undefined>(undefined);

  return (
    <WorldProvider world={world} className="border-2 border-[var(--world-text,#17121C)]">
      <Nav />

      <div className="space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        <div>
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            world
          </p>
          <h2 className="mt-2 font-archivo text-[34px] font-black leading-[0.95] [font-stretch:125%] sm:text-[44px]">
            {label}
          </h2>
        </div>

        {/* Type scale */}
        <section className="space-y-4">
          <p className="font-archivo text-[40px] font-black leading-[0.95] [font-stretch:125%]">
            display, 900, 125%
          </p>
          <p className="font-archivo text-[27px] font-extrabold leading-tight [font-stretch:112%]">
            questions, 800, 112%
          </p>
          <p className="max-w-xl font-archivo text-base leading-relaxed">
            body, 400 to 700, normal width. this is the voice of the product: casual, warm, a
            little cheeky, lowercase. sounds like a friend texting, not a brand.
          </p>
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            martian mono 600 — labels and counters only
          </p>
        </section>

        {/* Buttons */}
        <section className="space-y-3">
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            button
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">share yours</Button>
            <Button variant="secondary">not now</Button>
            <Button variant="primary" disabled>
              sending
            </Button>
          </div>
        </section>

        {/* Chips */}
        <section className="space-y-3">
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            chip
          </p>
          <div className="flex flex-wrap gap-2.5">
            {["respect", "communication", "trust", "consistency"].map((value) => (
              <Chip
                key={value}
                label={value}
                selected={selectedChip === value}
                onClick={() => setSelectedChip(value)}
              />
            ))}
          </div>
        </section>

        {/* Rating (Q7 pattern) */}
        <section>
          <Rating
            question="they respected me."
            value={ratingValue}
            onChange={setRatingValue}
          />
        </section>

        {/* Text fields */}
        <section className="grid gap-6 sm:grid-cols-2">
          <TextField
            id={`email-${world}`}
            label="email"
            type="email"
            placeholder="you@example.com"
            helperText="stays private. proves you're a real inbox, not that your story is true."
          />
          <TextField
            id={`code-${world}`}
            label="6-digit code"
            placeholder="000000"
            errorText="that code's expired. we've sent a new one."
          />
          <TextArea
            id={`advice-${world}`}
            label="what would you tell someone going through the same thing?"
            placeholder="give it to them straight."
            rows={3}
            className="sm:col-span-2"
          />
        </section>

        {/* Progress tiles */}
        <section className="space-y-3">
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            progress tiles
          </p>
          <ProgressTiles current={3} />
        </section>

        {/* Card */}
        <section className="space-y-3">
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            card
          </p>
          <Card className="max-w-sm">
            <p className="font-archivo text-xl font-extrabold [font-stretch:112%]">
              communication keeps coming up.
            </p>
            <p className="mt-2 font-archivo text-sm leading-relaxed text-[var(--world-muted)]">
              from 1,240 stories · this year
            </p>
          </Card>
        </section>

        {/* Gather Point mark */}
        <section className="space-y-3">
          <p className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-muted)]">
            the gather point
          </p>
          <GatherPoint size={72} />
        </section>
      </div>

      <Footer />
    </WorldProvider>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
        Stage 2 — foundations
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.02] tracking-tight">
        Styleguide
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
        The GATHER_BUILD_BRIEF design system: tokens, fonts and base components, in all three
        worlds. Not wired into the live site yet (that happens page by page in later stages) —
        the nav and footer above and below this card are still the current prototype&rsquo;s.
      </p>

      {/* Raw palette, outside any single world (lilac in particular is an
          admin-only color, not tied to a world) */}
      <section className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">Palette</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
          {PALETTE.map((color) => (
            <div key={color.name}>
              <div
                className="h-16 w-full rounded border-2 border-ink"
                style={{ backgroundColor: color.hex }}
              />
              <p className="mt-2 font-mono text-xs text-ink-soft">{color.name}</p>
              <p className="font-mono text-xs text-muted">{color.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-14">
        {WORLDS.map(({ id, label }) => (
          <WorldSection key={id} world={id} label={label} />
        ))}
      </div>
    </div>
  );
}
