"use client";

import { useSyncExternalStore } from "react";
import { getLiveSubmissionCount } from "@/lib/submissions";

function subscribe() {
  return () => {};
}

/**
 * Adds locally-submitted experiences (this browser only) on top of the
 * sample baseline, so the demo dashboard visibly reacts to submissions.
 */
export function useLiveTotal(base: number) {
  return useSyncExternalStore(
    subscribe,
    () => base + getLiveSubmissionCount(),
    () => base
  );
}
