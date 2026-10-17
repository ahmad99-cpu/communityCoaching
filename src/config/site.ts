/**
 * 6SLOT site config — content Jad may want to tweak.
 *
 * Payments and the founder counter live in `join` below. Price cards, FAQ and the two tests
 * are edited from the admin dashboard (/admin).
 */
export const site = {
  join: {
    /** Founder PayPal payment link ($19). The pay buttons open it in a new tab. */
    founderLink: "https://www.paypal.com/ncp/payment/MCNF7AWJ6KX6N",
    /** Regular-price ($27) payment link, used once founder spots are full. Empty = the button is disabled. */
    memberLink: "",
    /** Founder spots available. */
    founderCap: 25,
    /** FOUNDERS_TAKEN: founders who have paid. Update by hand after each founder payment. */
    foundersTaken: 0,
    /** All paying members, founders included. Drives the Battle Pass. Never counted lower than foundersTaken. */
    membersTaken: 0,
    /**
     * Later: a URL (e.g. a Google Apps Script web app) returning JSON like {"foundersTaken": 12},
     * optionally with "membersTaken". Empty = use the numbers above. If it fails, the numbers above are used.
     */
    countsUrl: "",
  },

  links: {
    /** DISCORD_INVITE_LINK: the Discord invite on the thank-you page after payment (the public server). */
    discordInvite: "https://discord.gg/n5ABqN44nX",
    /** ONBOARDING_FORM_LINK: the 2-minute onboarding form on the thank-you page. */
    onboardingForm: "https://docs.google.com/forms/d/e/1FAIpQLScvYmdK4GzBbOTUXj_RgBECUd6DoIcyNpWNWrwvmtlHI2pE1g/viewform",
    /**
     * WELCOME_VIDEO_LINK: Eixn's welcome video at the top of the thank-you page. A YouTube link
     * (unlisted is fine) or a direct .mp4 link. Empty = no video section.
     */
    welcomeVideo: "",
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
   * PayPal subscriptions (not used yet: the site runs on the payment links in `join` for now).
   * Kept for the switch to subscriptions: PayPalCheckout + the Supabase functions use this.
   */
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
  },
} as const;

