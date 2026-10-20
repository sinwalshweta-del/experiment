import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "mt-2 w-full rounded border-2 border-[var(--world-text)] bg-[var(--world-surface)] px-4 py-3.5 font-archivo text-base text-[var(--world-text)] outline-none placeholder:text-[var(--world-muted)] focus-visible:ring-[3px] focus-visible:ring-[var(--world-accent)]";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-martian-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--world-text)]"
    >
      {children}
    </label>
  );
}

function FieldNote({ id, error, children }: { id: string; error?: boolean; children: React.ReactNode }) {
  return (
    <p
      id={id}
      className={`mt-1.5 font-archivo text-sm ${error ? "text-[var(--world-text)]" : "text-[var(--world-muted)]"}`}
    >
      {children}
    </p>
  );
}

interface BaseProps {
  label: string;
  helperText?: string;
  errorText?: string;
  id: string;
}

export function TextField({
  label,
  helperText,
  errorText,
  id,
  className = "",
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = errorText ? `${id}-note` : helperText ? `${id}-note` : undefined;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        className={fieldBase}
        aria-describedby={describedBy}
        aria-invalid={Boolean(errorText)}
        {...props}
      />
      {errorText ? (
        <FieldNote id={`${id}-note`} error>
          {errorText}
        </FieldNote>
      ) : helperText ? (
        <FieldNote id={`${id}-note`}>{helperText}</FieldNote>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  helperText,
  errorText,
  id,
  className = "",
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const describedBy = errorText ? `${id}-note` : helperText ? `${id}-note` : undefined;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        className={`${fieldBase} leading-relaxed`}
        aria-describedby={describedBy}
        aria-invalid={Boolean(errorText)}
        {...props}
      />
      {errorText ? (
        <FieldNote id={`${id}-note`} error>
          {errorText}
        </FieldNote>
      ) : helperText ? (
        <FieldNote id={`${id}-note`}>{helperText}</FieldNote>
      ) : null}
    </div>
  );
}
