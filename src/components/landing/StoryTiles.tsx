/**
 * "Every tile is one story": a 12 x 8 grid of quarter-circle tiles that
 * group into Gather Point-like marks. Deterministic (seeded), so the
 * server and client render the same pattern.
 *
 * Motion (approved on the Claude Design motion board): every tile moves on
 * its own 7–16s clock — a quarter turn, a half flip, a corner "bite" or a
 * small slide toward its corner — with a long rest between moves. Only the
 * tiles move; the grid frame, size and layout never do. Off under
 * prefers-reduced-motion (see globals.css).
 */
const COLORS = ["#FF3E9A", "#FFB627", "#006B5B", "#BDB2FF", "#F3EEE4"];
const INNER = ["q2", "q3", "q1", "q0"];
const OUTER = ["q0", "q1", "q3", "q2"];
const KINDS = ["landing-gt-turn", "landing-gt-turnb", "landing-gt-flip", "landing-gt-chomp", "landing-gt-nudge"] as const;
// the corner each quarter-disc grows from (its circle centre)
const ORIGIN: Record<string, string> = { q0: "0% 0%", q1: "100% 0%", q2: "100% 100%", q3: "0% 100%" };
const NUDGE: Record<string, [number, number]> = { q0: [-1, -1], q1: [1, -1], q2: [1, 1], q3: [-1, 1] };

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
      const dur = 7 + rnd() * 9;
      const delay = -rnd() * dur;
      const spins = kind === "landing-gt-turn" || kind === "landing-gt-turnb" || kind === "landing-gt-flip";
      const style: Record<string, string> = {
        background: bg,
        animation: `${kind} ${dur.toFixed(1)}s cubic-bezier(.45,0,.25,1) ${delay.toFixed(1)}s infinite`,
        transformOrigin: spins ? "50% 50%" : ORIGIN[c],
      };
      if (kind === "landing-gt-nudge") {
        const [dx, dy] = NUDGE[c];
        style["--nx"] = `${dx * 14}%`;
        style["--ny"] = `${dy * 14}%`;
      }
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
