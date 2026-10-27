import { supabase } from "@/lib/supabase";
import type { Answers } from "./questions";
import { storyTitle } from "./questions";

/**
 * Stories, stored in Supabase (public.stories). Row-level security means a
 * person only ever sees their own; new stories always start as "received"
 * and only a reviewer can approve them. The email is never stored here: the
 * row points at the auth user id, and the address lives in Supabase Auth.
 */
export type StoryStatus = "received" | "in_review" | "approved" | "not_used" | "taken_down";

export type MyStory = {
  id: string;
  title: string;
  publish: boolean;
  status: StoryStatus;
  createdAt: string;
  takenDownAt: string | null;
};

/** Throws if it doesn't go through, so the flow can show "that didn't go through". */
export async function addStory(answers: Answers, userId: string, publish: boolean) {
  const { error } = await supabase()
    .from("stories")
    .insert({ user_id: userId, title: storyTitle(answers), answers, publish });
  if (error) throw error;
}

/** Filter by owner explicitly: a reviewer's account can read every story. */
export async function getMyStories(userId: string): Promise<MyStory[]> {
  const { data, error } = await supabase()
    .from("stories")
    .select("id, title, publish, status, created_at, taken_down_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id as string,
    title: s.title as string,
    publish: s.publish as boolean,
    status: s.status as StoryStatus,
    createdAt: s.created_at as string,
    takenDownAt: (s.taken_down_at as string | null) ?? null,
  }));
}

export async function takeDownStory(id: string, reason?: string) {
  const { error } = await supabase().rpc("take_down_story", { story_id: id, reason: reason ?? null });
  if (error) throw error;
}

export function daysAgo(iso: string | number) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}
