import { TallyMarks } from "@/components/ui/TallyMarks";

export function ProgressBar({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="mb-10 flex items-center justify-between gap-4">
      <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
        {label ?? "Progress"}
      </span>
      <div className="flex items-center gap-3">
        <TallyMarks count={step} size="sm" animate={false} className="text-pen" />
        <span className="font-mono text-xs text-muted">
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
