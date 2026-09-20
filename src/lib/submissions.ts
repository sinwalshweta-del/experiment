import { ExperienceSubmission } from "./types";

const KEY = "gather:submissions";

export function getSubmissions(): ExperienceSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExperienceSubmission[];
  } catch {
    return [];
  }
}

export function addSubmission(submission: ExperienceSubmission) {
  if (typeof window === "undefined") return;
  const existing = getSubmissions();
  const next = [...existing, submission];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

/**
 * Returns the count of locally-added submissions this session/browser.
 * In the MVP this is the only "real" data source; a future backend can
 * replace this whole module with API calls without touching callers.
 */
export function getLiveSubmissionCount(): number {
  return getSubmissions().length;
}
