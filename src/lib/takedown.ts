import { getSubmissions } from "./submissions";
import { CATEGORY_META, ExperienceCategory } from "./types";

/**
 * Take-down data layer. In the MVP there's no backend yet: stories live in
 * this browser (see submissions.ts), so "your stories" are the ones shared
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

function title(category: ExperienceCategory) {
  return CATEGORY_META[category]?.label ?? "A story";
}

export function getMyStories(): MyStory[] {
  const removed = readRemoved();
  return getSubmissions()
    .map((s) => ({
      id: s.id,
      title: title(s.category),
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
