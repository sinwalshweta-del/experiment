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
  /** File name of the "download everything" zip in the pack folder. */
  zip: string;
  /** The line under the envelope in the approval email. */
  emailBlurb: string;
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
    zip: "things-you-took-back.zip",
    emailBlurb:
      "Download it now and take back what’s yours: your peace, your standards, your playlist. It’s time to let go of what no longer serves you. Let the glow-up begin.",
  },
  {
    token: "KLAe1s8hGqpERfEuvZ4OTv",
    // Bhavik's story (Claude Design boards 36 + 37)
    storyIds: ["296524e8-3d84-44cb-b3f3-bd7593a35ffd"],
    title: "Better Chemistry",
    kicker: "Next up:",
    tagline: "Same vibe. Better match. Zero static.",
    letter: {
      greeting: "Hey you,",
      paragraphs: [
        "A few dates, a lot of mixed signals, and zero explanation. Not exactly the soundtrack anyone orders.",
        "So we’re calling it: next round, better chemistry. Clearer vibes, more fun, less decoding, more enjoying.",
        "And for the record, saying what you want out loud is the sexiest move on any dating app. Keep doing that.",
        "Stay honest. Keep the good tracks coming.",
      ],
      sign: "With love,\nGATHER",
    },
    stickers: [
      { file: "sticker-1.png", name: "Chemistry, please" },
      { file: "sticker-2.png", name: "Say what you’re after. That’s hot." },
      { file: "sticker-3.png", name: "Mixed signals? Change the track" },
    ],
    zip: "better-chemistry.zip",
    emailBlurb:
      "Download it now: a little manifesting, a better track, and a reminder that saying what you’re after is hot. Next up: better chemistry.",
  },
];

export const packByToken = (token: string) => PACKS.find((p) => p.token === token);
export const packForStory = (storyId: string) => PACKS.find((p) => p.storyIds.includes(storyId));
export const packPath = (p: Pack) => `/packs/${p.token}`;
