import Link from "next/link";

const STEPS = ["Who", "About you", "The survey", "The story"];

export function WizardShell({
  step,
  title,
  subtitle,
  backHref,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i + 1 <= step ? "bg-signature" : "bg-line"
            }`}
            title={s}
          />
        ))}
      </div>

      {backHref && (
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          &larr; Back
        </Link>
      )}

      <h1 className="animate-rise-in font-display text-[clamp(1.75rem,5vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="animate-rise-in mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      )}

      <div className="mt-10">{children}</div>
    </div>
  );
}
