/**
 * "Every tile is one story": a 12 x 8 grid of quarter-circle tiles that
 * group into Gather Point-like marks. Deterministic (seeded), so the
 * server and client render the same pattern.
 */
const COLORS = ["#FF3E9A", "#FFB627", "#006B5B", "#BDB2FF", "#F3EEE4"];
const INNER = ["q2", "q3", "q1", "q0"];
const OUTER = ["q0", "q1", "q3", "q2"];

function rand(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const TILES = (() => {
  const out: { c: string; bg: string }[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 12; x++) {
      const s = (x >> 1) * 31 + (y >> 1) * 17;
      const mode = rand(s) < 0.55 ? INNER : OUTER;
      const c = mode[(y % 2) * 2 + (x % 2)];
      let bg = COLORS[Math.floor(rand(s * 3.3 + 1) * 5)];
      if (rand(x * 1.7 + y * 9.1) < 0.15) bg = "#17121C";
      out.push({ c, bg });
    }
  }
  return out;
})();

export function StoryTiles() {
  return (
    <div aria-hidden className="grid grid-cols-12 border-2 border-brief-paper">
      {TILES.map((t, i) => (
        <span key={i} className={`landing-tile ${t.c}`} style={{ background: t.bg }} />
      ))}
    </div>
  );
}
