export const POP_COLORS = ["pink", "blue", "lime", "coral", "gold", "moss"] as const;
export type PopColor = (typeof POP_COLORS)[number];

interface PopColorStyle {
  bgSoft: string;
  border: string;
  text: string;
  bgSolid: string;
  shadow: string;
  shadowHover: string;
  /** Text color to use on top of bgSolid, chosen per-hue for contrast. */
  onSolid: string;
}

export const POP_COLOR_STYLES: Record<PopColor, PopColorStyle> = {
  pink: {
    bgSoft: "bg-pink-soft",
    border: "border-pink",
    text: "text-pink",
    bgSolid: "bg-pink",
    shadow: "shadow-[5px_5px_0_0_var(--color-pink)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-pink)]",
    onSolid: "text-paper",
  },
  blue: {
    bgSoft: "bg-blue-soft",
    border: "border-blue",
    text: "text-blue",
    bgSolid: "bg-blue",
    shadow: "shadow-[5px_5px_0_0_var(--color-blue)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-blue)]",
    onSolid: "text-paper",
  },
  lime: {
    bgSoft: "bg-lime-soft",
    border: "border-lime",
    text: "text-lime",
    bgSolid: "bg-lime",
    shadow: "shadow-[5px_5px_0_0_var(--color-lime)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-lime)]",
    onSolid: "text-ink",
  },
  coral: {
    bgSoft: "bg-coral-soft",
    border: "border-coral",
    text: "text-coral",
    bgSolid: "bg-coral",
    shadow: "shadow-[5px_5px_0_0_var(--color-coral)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-coral)]",
    onSolid: "text-paper",
  },
  gold: {
    bgSoft: "bg-gold-soft",
    border: "border-gold",
    text: "text-gold",
    bgSolid: "bg-gold",
    shadow: "shadow-[5px_5px_0_0_var(--color-gold)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-gold)]",
    onSolid: "text-ink",
  },
  moss: {
    bgSoft: "bg-moss-soft",
    border: "border-moss",
    text: "text-moss",
    bgSolid: "bg-moss",
    shadow: "shadow-[5px_5px_0_0_var(--color-moss)]",
    shadowHover: "hover:shadow-[8px_8px_0_0_var(--color-moss)]",
    onSolid: "text-paper",
  },
};

export function popColorForIndex(index: number): PopColor {
  return POP_COLORS[index % POP_COLORS.length];
}
