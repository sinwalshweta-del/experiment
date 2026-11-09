/**
 * Personalised sticker packs (Claude Design boards 31 and 32).
 *
 * Each pack lives at /pack/<token>, a private page only the storyteller is
 * sent. The token is long and random so the page can't be guessed; nothing on
 * it names the person or quotes their story. Files sit in /public/packs/<token>/.
 */
export type Pack = {
  token: string;
  storyIds: string[];
  title: string;
  kicker: string;
  tagline: string;
  letter: { greeting: string; paragraphs: string[]; sign: string };
  stickers: { file: string; name: string }[];
};

export const PACKS: Pack[] = [
  {
    token: "DZWs3ifDJJT243XbpHNLaq",
    // Kirti's story, plus Shweta's own test story for a dry run of the email
    storyIds: ["0e23f1c1-f394-4d63-9c03-f58836b07c65", "c773f0f0-bb02-44b6-a1f6-64cc5680cf9c"],
    title: "Things You Took Back",
    kicker: "Things You",
    tagline: "Your peace. Your standards. Your playlist.",
    letter: {
      greeting: "Hey you,",
      paragraphs: [
        "Some signals aren’t worth decoding. Wanting something clear and consistent was never asking for too much.",
        "That was a lot of plot twists for less than a month. You read it right, you said it out loud, and now your story helps the next person spot the same mess a little sooner. You’re not the only one.",
        "Keep the standards. Keep the sparkle. The next chapter is all yours, main character.",
      ],
      sign: "With love,\nGATHER",
    },
    stickers: [
      { file: "sticker-1.png", name: "He couldn’t handle the patakha" },
      { file: "sticker-2.png", name: "Mixed signals? Better playlist now" },
      { file: "sticker-3.png", name: "Main character pass" },
    ],
  },
];

export const packByToken = (token: string) => PACKS.find((p) => p.token === token);
export const packForStory = (storyId: string) => PACKS.find((p) => p.storyIds.includes(storyId));
export const packPath = (p: Pack) => `/packs/${p.token}`;
