import type { Metadata } from "next";
import { Review } from "@/components/review/Review";

export const metadata: Metadata = {
  title: "Review · GATHER People Insights",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <Review />;
}
