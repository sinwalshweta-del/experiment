import Link from "next/link";
import { TallyMarks } from "@/components/ui/TallyMarks";

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
      <div className="mb-8 flex items-center gap-3">
        <TallyMarks count={step} size="sm" animate={false} className="text-muted" />
        <span className="font-mono text-xs text-muted">step {step} of 4</span>
      </div>

      {backHref && (
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          &larr; Back
        </Link>
      )}

      <h1 className="animate-rise-in font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-[1.05] tracking-tight">
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
