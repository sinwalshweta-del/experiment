"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. The URL and publishable key are public by design:
 * every table is protected by row-level security (supabase/migrations), so the
 * key only lets people read and change their own drafts and stories, and read
 * the thresholded insight counts. Never put the secret service-role key here.
 * Env vars override the defaults (set them in Vercel to point at another project).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxyrqhuusuwentiptswl.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_j-ok3kKWho1CYK5LnzdbHg_jJtI7udR";

let client: SupabaseClient | null = null;

export function supabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "gather:auth" },
    });
  }
  return client;
}

/** Friendly copy for the auth errors people actually hit. */
export function authErrorText(message: string | undefined) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) return "That code didn’t match or has expired.";
  if (m.includes("not authorized") || m.includes("not allowed"))
    return "We can’t send a code to that email yet. Please try again later.";
  if (m.includes("rate") || m.includes("security purposes") || m.includes("too many"))
    return "Too many tries for now. Wait a few minutes, then ask for a new code.";
  return "Something went wrong. Check your connection and try again.";
}
