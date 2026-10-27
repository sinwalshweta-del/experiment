import { getMyStories as fetchMine, takeDownStory } from "./share/stories";

/**
 * Take-down data layer on top of Supabase. The page shows three plain states:
 * live (approved and counted), review (not used yet) and down (taken down or
 * not used). Only the signed-in owner can see or remove a story.
 */
export type StoryStatus = "live" | "review" | "down";
export type MyStory = { id: string; title: string; sharedAt: string; status: StoryStatus; downAt?: string };

export async function getMyStories(userId: string): Promise<MyStory[]> {
  const rows = await fetchMine(userId);
  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    sharedAt: s.createdAt,
    status: s.status === "approved" ? "live" : s.status === "received" || s.status === "in_review" ? "review" : "down",
    downAt: s.takenDownAt ?? undefined,
  }));
}

export async function takeDown(id: string, reason?: string) {
  await takeDownStory(id, reason);
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
