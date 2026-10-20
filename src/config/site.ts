/**
 * 6SLOT site config — content Jad may want to tweak.
 *
 * Payments and the founder counter live in `join` below. Price cards, FAQ and the two tests
 * are edited from the admin dashboard (/adminDashboard).
 */
export const site = {
  join: {
    /** Founder spots available. */
    founderCap: 25,
    /**
     * The live counts come from Supabase (active PayPal subscriptions) automatically. These are a
     * floor: the site never shows fewer than this. Leave at 0 unless someone joined outside PayPal.
     */
    foundersTaken: 0,
    /** Same, for all paying members (founders included). Drives the Battle Pass. */
    membersTaken: 0,
    /**
     * Later: a URL (e.g. a Google Apps Script web app) returning JSON like {"foundersTaken": 12},
     * optionally with "membersTaken". Empty = use the numbers above. If it fails, the numbers above are used.
     */
    countsUrl: "",
  },

  links: {
    /** DISCORD_INVITE_LINK: the Discord invite on the thank-you page after payment (the public server). */
    discordInvite: "https://discord.gg/UPz75GNqGP",
    /**
     * Where "Open the Discord" takes people the site knows are members (opens the app on phones):
     * founders go to the Founders Lounge, regular members to the members chat. Channel links only
     * work for people already in the server, so the invite stays the link for everyone else.
     */
    foundersLounge: "https://discord.com/channels/1408527454171172905/1561359478891217056",
    membersChat: "https://discord.com/channels/1408527454171172905/1561356621781663886",
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
      discord: "https://discord.gg/UPz75GNqGP",
      instagram: "https://www.instagram.com/eixndota",
      tiktok: "https://www.tiktok.com/@jadhamoud8",
      /** Add the Facebook page link here to show the Facebook button. */
      facebook: "https://www.facebook.com/p/Eixn-61583056599814/",
    },
    socials: [
      { label: "Discord", href: "https://discord.gg/UPz75GNqGP", icon: "discord" },
      { label: "YouTube", href: "https://www.youtube.com/@eixndota", icon: "youtube" },
      { label: "X", href: "https://x.com/EixnDota", icon: "x" },
      { label: "Instagram", href: "https://www.instagram.com/eixndota", icon: "instagram" },
      { label: "TikTok", href: "https://www.tiktok.com/@jadhamoud8", icon: "tiktok" },
    ],
  },

  /**
   * Visitor numbers (Umami, cloud.umami.is). Paste the Website ID from Umami > Settings > Websites.
   * Empty = no tracking. Only counts visits on these domains, so local testing is never counted.
   */
  analytics: {
    umamiWebsiteId: "b1734554-1266-4a9b-ae11-22c87904fa7a",
    domains: ["6slot.gg", "www.6slot.gg"],
  },

  /**
   * PayPal subscriptions (not used yet: the site runs on the payment links in `join` for now).
   * Kept for the switch to subscriptions: PayPalCheckout + the Supabase functions use this.
   */
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "",
  },
} as const;

