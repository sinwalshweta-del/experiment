import { SectionLabel } from "@/components/ui/SectionLabel";

export function RankedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ol className="mt-6 space-y-5">
        {items.map((item, i) => (
          <li key={item} className="flex items-baseline gap-4">
            <span className="font-display text-3xl font-bold leading-none text-line sm:text-4xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-xl font-bold sm:text-2xl">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
