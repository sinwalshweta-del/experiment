import { SectionLabel } from "@/components/ui/SectionLabel";
import { PopColor, POP_COLOR_STYLES } from "@/lib/colors";

export function RankedList({
  title,
  items,
  color = "ink",
}: {
  title: string;
  items: string[];
  color?: PopColor;
}) {
  const numeralColor = POP_COLOR_STYLES[color].text;
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ol className="mt-6 space-y-5">
        {items.map((item, i) => (
          <li key={item} className="flex items-baseline gap-4">
            <span
              className={`font-display text-3xl font-bold leading-none sm:text-4xl ${
                color === "ink" ? "text-line" : numeralColor
              }`}
            >
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
