"use client";

import { useState } from "react";
import { Chip } from "./Chip";

const RATING_OPTIONS = ["never", "rarely", "sometimes", "mostly", "always", "doesn't apply"];

/** The Q7 rating pattern: one statement, one row of chips, single-select. */
export function Rating({
  question,
  value,
  onChange,
  className = "",
}: {
  question: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState<string | undefined>(undefined);
  const current = value ?? internal;

  return (
    <fieldset className={className}>
      <legend className="font-archivo text-[26px] font-extrabold leading-tight text-[var(--world-text)] [font-stretch:112%] sm:text-[28px]">
        {question}
      </legend>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {RATING_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={current === option}
            onClick={() => {
              setInternal(option);
              onChange?.(option);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
