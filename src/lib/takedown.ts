import { getStories } from "./share/stories";

/**
 * Take-down data layer. In the MVP there's no backend yet: stories live in
 * this browser (see share/stories.ts), so "your stories" are the ones shared
 * from this device, and a removal is recorded here too. A backend (email
 * codes, real review status, insights recompute) replaces this module
 * without touching the page.
 */
const KEY = "gather:takedown";

export type StoryStatus = "live" | "review" | "down";
export type MyStory = { id: string; title: string; sharedAt: string; status: StoryStatus; downAt?: string };

type Removed = Record<string, { at: string; reason?: string }>;

function readRemoved(): Removed {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Removed;
  } catch {
    return {};
  }
}

/** Stories sent from this browser; when an email is given, only the ones sent with it. */
export function getMyStories(email?: string): MyStory[] {
  const removed = readRemoved();
  const e = email?.trim().toLowerCase();
  return getStories()
    .filter((s) => !e || !s.email || s.email === e)
    .map((s) => ({
      id: s.id,
      title: s.title,
      sharedAt: s.createdAt,
      // no review backend yet, so anything not taken down is still with the review team
      status: (removed[s.id] ? "down" : "review") as StoryStatus,
      downAt: removed[s.id]?.at,
    }))
    .sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
}

export function takeDown(id: string, reason?: string) {
  const removed = readRemoved();
  removed[id] = { at: new Date().toISOString(), reason };
  window.localStorage.setItem(KEY, JSON.stringify(removed)); // throws if storage is unavailable
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
