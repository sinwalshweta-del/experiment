import type { MetadataRoute } from "next";

/** Lets phones save GATHER to the home screen with the pink Gather Point icon (Claude Design board 20, option B). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GATHER People Insights",
    short_name: "GATHER",
    description: "Anonymous dating and relationship experiences, turned into insights.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3EEE4",
    theme_color: "#FF3E9A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
