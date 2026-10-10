/**
 * 6SLOT site config — content Jad may want to tweak.
 *
 * The founder counter and giveaway progress are LIVE: every PayPal payment is recorded
 * in Supabase (supabase/subscriptions.sql + supabase/functions/), and the site reads the
 * counts from there. Nothing to update by hand when someone joins or cancels.
 * Giveaway, price cards, FAQ and the two tests are edited from the admin dashboard (/admin).
 */
export const site = {
  /** Shown only until Supabase is connected (or if it can't be reached). */
  fallbackMemberCount: 0,
  /** Keep in sync with founder_cap() in supabase/subscriptions.sql. */
  founderSpots: 20,

  /** First session, in UTC. Shown to visitors in their own timezone. */
  firstSessionUtc: "2026-10-31T12:00:00Z",

  links: {
    /** Members-only Discord invite, shown on the thank-you page after payment. */
    discordInvite: "https://discord.gg/REPLACE_ME",
    /** 1-on-1 entry offer on eixn-dota.com, linked from the position test result. */
    realProblemDiagnostic: "https://www.eixn-dota.com/coaching",
    socials: [
      { label: "Discord", href: "https://discord.gg/n5ABqN44nX", icon: "discord" },
      { label: "YouTube", href: "https://www.youtube.com/@eixndota", icon: "youtube" },
      { label: "X", href: "https://x.com/EixnDota", icon: "x" },
      { label: "Instagram", href: "https://www.instagram.com/eixndota", icon: "instagram" },
      { label: "TikTok", href: "https://www.tiktok.com/@jadhamoud8", icon: "tiktok" },
    ],
  },

  /**
   * PayPal Business. Only the client ID lives in the browser; the plan IDs and secret
   * are Supabase Edge Function secrets, because subscriptions are created server-side
   * (that is what keeps the founder cap exact). Payments redirect to /thank-you.
   */
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
  },
} as const;

