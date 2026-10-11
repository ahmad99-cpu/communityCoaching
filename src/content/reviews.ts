/**
 * Public reviews of Eixn's 1-on-1 coaching on Metafy (https://metafy.gg/@eixn/reviews),
 * copied word for word. Keep them verbatim: they're shown as verified reviews.
 */
export const METAFY_PROFILE_URL = "https://metafy.gg/@eixn/reviews";

export interface Review {
  name: string;
  date: string;
  /**
   * Bold highlight line, taken from the review with light edits only (capitalised, "you" → "Eixn").
   * Shown without quote marks; the full review in `text` is verbatim and quoted.
   */
  headline: string;
  text: string;
}

export const REVIEWS: Review[] = [
  {
    name: "DS",
    date: "July 2026",
    headline: "Eixn seemed as invested in my improvement as I was",
    text: "Off the bat, your calmness while patiently breaking down the entire gameplay bit by bit was impressive. I really liked that you didn’t just hand me instructions on what to do, but instead shifted my perspective so the right play became obvious on its own. As a low-rank player, I have a lot of random bits of gameplay knowledge that you structured really well. The session was genuinely encouraging because you seemed as invested in my improvement as I was. Thank you. Definitely worth it.",
  },
  {
    name: "Vyoman Lingham",
    date: "June 2026",
    headline: "faster results which really did happen",
    text: "Great session with Eixn. He covered all areas of improvement that i require. He also gave me a checklist on quick fixes i need to make that will make me see faster results which really did happen.",
  },
  {
    name: "Andre",
    date: "July 2026",
    headline: "spot on things that need improving",
    text: "Jad is a very knowledgeable guy. had such a fun and easy session with him. explained everything so clearly. doesnt make you feel less. spot on things that need improving. time flew by so quickly. i definitely recommend.",
  },
  {
    name: "YobertyAlej",
    date: "April 2026",
    headline: "Totally recommended no matter the rank",
    text: "It's simply outstanding how much can you learn in a single session with Eixn, i'm deeply grateful for his time and how he give me the kind of mindset it will simply make me a better player. Totally recommended no matter the rank",
  },
  {
    name: "Kin",
    date: "September 2026",
    headline: "It is my first session and i already have learned a lot",
    text: "It is my first session and i already have learned a lot. He was able to point out my weaknesses and analyze what was needed. Looking forward for more session hours.",
  },
  {
    name: "Bakeran",
    date: "August 2026",
    headline: "Really helped me a lot to understand the game",
    text: "Really helped me a lot to understand the game. The calm and informative approach will help any player understanding the game better.",
  },
  {
    name: "CharbelAlam",
    date: "June 2026",
    headline: "Eixn cleared things for me and told me what to do to get better",
    text: "The session was amazing, Eixn cleared things for me and told me what to do to get better.",
  },
  {
    name: "Spjuth",
    date: "March 2026",
    headline: "a quick chat with a lot of information",
    text: "very nice and straightforward and good points of view. a quick chat with a lot of information. totally worth it",
  },
];
