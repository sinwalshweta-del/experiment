import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take my story down · GATHER People Insights",
  description: "Remove a story you've shared, whenever you like. No reason needed.",
};

export default function TakeDownLayout({ children }: { children: React.ReactNode }) {
  return children;
}
