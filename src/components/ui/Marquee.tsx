export function Marquee({ items }: { items: string[] }) {
  const track = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-line bg-paper-raised py-2.5">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {track.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-mono text-xs uppercase tracking-[0.14em] text-muted"
          >
            <span className="text-coral">&bull;</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
