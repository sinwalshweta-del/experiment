import type { Metadata } from "next";
import { ShareFlow } from "@/components/share/ShareFlow";

export const metadata: Metadata = {
  title: "Share your experience · GATHER People Insights",
  description: "Share a dating or relationship experience anonymously. No names, ever.",
};

export default function SharePage() {
  return <ShareFlow />;
}
