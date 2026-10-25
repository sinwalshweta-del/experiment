import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "GATHER People Insights",
};

// First-timer landing page. Built from the approved Claude Design board
// "Final - 25/10/2026"; see src/components/landing.
export default function Home() {
  return <Landing />;
}
