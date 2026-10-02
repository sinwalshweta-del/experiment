export const POP_COLORS = ["pink", "purple", "lime", "tangerine", "ink"] as const;
export type PopColor = (typeof POP_COLORS)[number];

interface PopColorStyle {
  /** Full-strength fill, for a full-bleed section or a solid chip. */
  bgSolid: string;
  /** The hue used as text/accent on a paper or ink background. */
  text: string;
  /** Border in the hue's own color — tabs, underlines, active states. */
  border: string;
  /** Text color to use on top of bgSolid, chosen for contrast. */
  onSolid: string;
}

// Tailwind's build-time scanner needs every class name to appear literally
// in source — no template-string construction — so each entry is spelled
// out in full even though the shape repeats.
export const POP_COLOR_STYLES: Record<PopColor, PopColorStyle> = {
  pink: {
    bgSolid: "bg-pink",
    text: "text-pink",
    border: "border-pink",
    onSolid: "text-paper",
  },
  purple: {
    bgSolid: "bg-purple",
    text: "text-purple",
    border: "border-purple",
    onSolid: "text-paper",
  },
  lime: {
    bgSolid: "bg-lime",
    text: "text-lime",
    border: "border-lime",
    onSolid: "text-ink",
  },
  tangerine: {
    bgSolid: "bg-tangerine",
    text: "text-tangerine",
    border: "border-tangerine",
    onSolid: "text-ink",
  },
  // The deliberately uncolored option — "Other" doesn't get a loud accent,
  // which is what makes the other four read as a system rather than decoration.
  ink: {
    bgSolid: "bg-ink",
    text: "text-ink",
    border: "border-line-strong",
    onSolid: "text-paper",
  },
};

export function popColorForIndex(index: number): PopColor {
  return POP_COLORS[index % POP_COLORS.length];
}
