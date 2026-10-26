import type { Answers } from "./questions";
import { storyTitle } from "./questions";

/**
 * Stories sent from this browser. There's no backend in the MVP yet, so a
 * "sent" story is kept here; the take-down flow reads the same list. A real
 * API replaces this module without touching the pages.
 */
const KEY = "gather:stories";

export type SentStory = { id: string; title: string; answers: Answers; email: string; createdAt: string };

export function getStories(): SentStory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as SentStory[];
  } catch {
    return [];
  }
}

/** Throws if storage is unavailable, so the flow can show "that didn't go through". */
export function addStory(answers: Answers, email: string): SentStory {
  const story: SentStory = {
    id: `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    title: storyTitle(answers),
    answers,
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify([...getStories(), story]));
  return story;
}

/** A story sent recently from this browser about what looks like the same person. */
export function findDuplicate(answers: Answers, days = 30): SentStory | null {
  const title = storyTitle(answers);
  const since = Date.now() - days * 864e5;
  return getStories().find((s) => s.title === title && Date.parse(s.createdAt) > since) ?? null;
}

export function daysAgo(iso: string) {
  const d = Math.floor((Date.now() - Date.parse(iso)) / 864e5);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}
