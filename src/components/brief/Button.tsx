import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const base =
  "brief-press brief-shadow-control inline-flex items-center justify-center gap-2 rounded border-2 border-[var(--world-text)] px-5 py-3.5 font-archivo text-[15px] font-bold lowercase tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--world-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--world-bg)] disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--world-accent)] text-[var(--world-accent-text)]",
  secondary: "bg-[var(--world-surface)] text-[var(--world-text)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
