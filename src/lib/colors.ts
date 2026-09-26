export const POP_COLORS = ["pink", "blue", "lime", "coral", "gold", "moss"] as const;
export type PopColor = (typeof POP_COLORS)[number];

interface PopColorStyle {
  /** Whisper-soft tint, used as a card/chip background. */
  bgSoft: string;
  /** Thin border in the hue's own (still muted) tone. */
  border: string;
  /** Muted text/dot color — decorative accents only, not body copy. */
  text: string;
  bgSolid: string;
  /** Gentle blurred glow shadow on hover — no hard offset. */
  shadowHover: string;
  /** Text color to use on top of bgSolid — ink works on every pastel here. */
  onSolid: string;
}

// Tailwind's build-time scanner needs every class name to appear literally
// in source — no template-string construction — so each entry is spelled
// out in full even though the shape repeats.
export const POP_COLOR_STYLES: Record<PopColor, PopColorStyle> = {
  pink: {
    bgSoft: "bg-pink-soft",
    border: "border-pink",
    text: "text-pink",
    bgSolid: "bg-pink",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-pink)]",
    onSolid: "text-ink",
  },
  blue: {
    bgSoft: "bg-blue-soft",
    border: "border-blue",
    text: "text-blue",
    bgSolid: "bg-blue",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-blue)]",
    onSolid: "text-ink",
  },
  lime: {
    bgSoft: "bg-lime-soft",
    border: "border-lime",
    text: "text-lime",
    bgSolid: "bg-lime",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-lime)]",
    onSolid: "text-ink",
  },
  coral: {
    bgSoft: "bg-coral-soft",
    border: "border-coral",
    text: "text-coral",
    bgSolid: "bg-coral",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-coral)]",
    onSolid: "text-ink",
  },
  gold: {
    bgSoft: "bg-gold-soft",
    border: "border-gold",
    text: "text-gold",
    bgSolid: "bg-gold",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-gold)]",
    onSolid: "text-ink",
  },
  moss: {
    bgSoft: "bg-moss-soft",
    border: "border-moss",
    text: "text-moss",
    bgSolid: "bg-moss",
    shadowHover: "hover:shadow-[0_14px_28px_-16px_var(--color-moss)]",
    onSolid: "text-ink",
  },
};

export function popColorForIndex(index: number): PopColor {
  return POP_COLORS[index % POP_COLORS.length];
}
