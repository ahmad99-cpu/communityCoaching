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
  founderSpots: 25,

  links: {
    /** Members-only Discord invite, shown on the thank-you page after payment. */
    discordInvite: "https://discord.gg/REPLACE_ME",
    /** 1-on-1 entry offer on eixn-dota.com, linked from the position test result. */
    realProblemDiagnostic: "https://www.eixn-dota.com/coaching",
    /**
     * "Still have a question?" under the FAQ. Discord is the main way to reach Eixn; the others
     * show as smaller links. Leave a link empty ("") to hide it.
     */
    ask: {
      discord: "https://discord.gg/n5ABqN44nX",
      instagram: "https://www.instagram.com/eixndota",
      tiktok: "https://www.tiktok.com/@jadhamoud8",
      /** Add the Facebook page link here to show the Facebook button. */
      facebook: "https://www.facebook.com/p/Eixn-61583056599814/",
    },
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

