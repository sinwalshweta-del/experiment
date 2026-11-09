import type { Metadata } from "next";
import { Suspense } from "react";
import { EmailFeedback } from "@/components/share/EmailFeedback";

export const metadata: Metadata = {
  title: "Thank you · GATHER",
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <EmailFeedback />
    </Suspense>
  );
}
