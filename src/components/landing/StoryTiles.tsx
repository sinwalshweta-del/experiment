/**
 * "Every tile is one story": a 12 x 8 grid of quarter-circle tiles that
 * group into Gather Point-like marks. Deterministic (seeded), so the
 * server and client render the same pattern.
 *
 * Motion v2.1 (Claude Design board 27): tiles only use brand shapes, the
 * square and the quarter-circle, and move the way the ticked checkbox does.
 * Each tile runs one of four moves on its own 4.5-8.5s clock: the curve
 * walking to the next corner, a turn while it squares up, tucking into its
 * corner and growing back, or jumping to the opposite corner. With
 * "Reduce motion" on, tiles only ease from quarter to square and back,
 * slowly, with no turning, sliding or scaling (see globals.css).
 */
const COLORS = ["#FF3E9A", "#FFB627", "#006B5B", "#BDB2FF", "#F3EEE4"];
const INNER = ["q2", "q3", "q1", "q0"];
const OUTER = ["q0", "q1", "q3", "q2"];
const KINDS = ["landing-gt-walk", "landing-gt-turn", "landing-gt-tuck", "landing-gt-jump"] as const;
// border-radius of each quarter (the curve sits opposite the corner it grows from)
const RADIUS: Record<string, string> = { q0: "0 0 100% 0", q1: "0 0 0 100%", q2: "100% 0 0 0", q3: "0 100% 0 0" };
const NEXT: Record<string, string> = { q0: "q1", q1: "q2", q2: "q3", q3: "q0" };
// the corner each quarter-disc grows from (its circle centre)
const ORIGIN: Record<string, string> = { q0: "0% 0%", q1: "100% 0%", q2: "100% 100%", q3: "0% 100%" };

function rand(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// small seeded PRNG for the motion choices (same on server and client)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tile = { c: string; style: React.CSSProperties };

const TILES: Tile[] = (() => {
  const rnd = mulberry32(11);
  const out: Tile[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 12; x++) {
      const s = (x >> 1) * 31 + (y >> 1) * 17;
      const mode = rand(s) < 0.55 ? INNER : OUTER;
      const c = mode[(y % 2) * 2 + (x % 2)];
      let bg = COLORS[Math.floor(rand(s * 3.3 + 1) * 5)];
      if (rand(x * 1.7 + y * 9.1) < 0.15) bg = "#17121C";

      const kind = KINDS[Math.floor(rnd() * KINDS.length)];
      const dur = 4.5 + rnd() * 4;
      const delay = -rnd() * dur;
      const style: Record<string, string> = {
        background: bg,
        animation: `${kind} ${dur.toFixed(1)}s cubic-bezier(.45,0,.25,1) ${delay.toFixed(1)}s infinite`,
        transformOrigin: kind === "landing-gt-tuck" ? ORIGIN[c] : "50% 50%",
        "--gt-b": RADIUS[c],
        "--gt-n": RADIUS[NEXT[c]],
        "--gt-o": RADIUS[NEXT[NEXT[c]]],
        "--gt-rd": `${(dur * 1.8).toFixed(1)}s`,
        "--gt-rdl": `${(delay * 1.8).toFixed(1)}s`,
      };
      out.push({ c, style: style as React.CSSProperties });
    }
  }
  return out;
})();

export function StoryTiles() {
  return (
    <div aria-hidden className="grid grid-cols-12 overflow-hidden border-2 border-brief-paper">
      {TILES.map((t, i) => (
        <span key={i} className={`landing-tile ${t.c}`} style={t.style} />
      ))}
    </div>
  );
}
