import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PACKS, packByToken } from "@/lib/packs";
import { PackUnbox } from "@/components/pack/PackUnbox";

// Private pages: never indexed, never linked from the site.
export const metadata: Metadata = {
  title: "A little something, just for you · GATHER",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return PACKS.map((p) => ({ token: p.token }));
}
export const dynamicParams = false;

export default async function PackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pack = packByToken(token);
  if (!pack) notFound();
  return <PackUnbox pack={pack} />;
}
