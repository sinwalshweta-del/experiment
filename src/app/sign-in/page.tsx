import type { Metadata } from "next";
import { SignIn } from "@/components/account/SignIn";

export const metadata: Metadata = {
  title: "Sign in · GATHER People Insights",
  description: "Sign in with your email to pick up your draft or manage your stories.",
};

export default function SignInPage() {
  return <SignIn />;
}
