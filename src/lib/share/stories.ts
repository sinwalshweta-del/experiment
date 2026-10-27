import type { Answers } from "./questions";
import { storyTitle } from "./questions";

/**
 * Stories sent from this browser. There's no backend in the MVP yet, so a
 * "sent" story is kept here; the take-down flow reads the same list. The
 * email is stored with the private record only, never with anything that
 * would be published. A real API replaces this module.
 */
const KEY = "gather:stories";

export type SentStory = {
  id: string;
  title: string;
  answers: Answers;
  email: string;
  /** true: publish story + selected answers after review; false: insights only */
  publish: boolean;
  createdAt: string;
};

export function getStories(): SentStory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as SentStory[];
  } catch {
    return [];
  }
}

/** Throws if storage is unavailable, so the flow can show "that didn't go through". */
export function addStory(answers: Answers, email: string, publish: boolean): SentStory {
  const story: SentStory = {
    id: `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    title: storyTitle(answers),
    answers,
    email: email.trim().toLowerCase(),
    publish,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify([...getStories(), story]));
  return story;
}

export function daysAgo(iso: string | number) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}
