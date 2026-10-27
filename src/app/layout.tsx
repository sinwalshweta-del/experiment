import type { Metadata } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Fraunces,
  Inter,
  Martian_Mono,
  Space_Mono,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { HideOnHome } from "@/components/layout/HideOnHome";
import { ShareDraftProvider } from "@/lib/share/draft";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
});

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// GATHER_BUILD_BRIEF design system. Powers /styleguide and the landing
// page at "/"; loaded alongside the current fonts above, which still power
// the rest of the app.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: "600",
});

export const metadata: Metadata = {
  title: "GATHER People Insights",
  description:
    "Share an anonymous experience about someone you've known, and see what thousands of experiences reveal about people.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${fraunces.variable} ${inter.variable} ${spaceMono.variable} ${archivo.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ShareDraftProvider>
          <HideOnHome>
            <Nav />
          </HideOnHome>
          <main className="flex-1 flex flex-col">{children}</main>
          <HideOnHome>
            <Footer />
          </HideOnHome>
        </ShareDraftProvider>
      </body>
    </html>
  );
}
