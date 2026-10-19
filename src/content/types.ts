/** Shapes of the admin-editable site sections (stored in Supabase `site_content`). */

export type PrizeCategory = "coaching" | "dota_item" | "tshirt" | "jacket" | "other";

export const PRIZE_CATEGORY_LABELS: Record<PrizeCategory, string> = {
  coaching: "Coaching",
  dota_item: "Dota 2 item",
  tshirt: "Team T-shirt",
  jacket: "Team jacket",
  other: "Other",
};

export interface Prize {
  category: PrizeCategory;
  /** e.g. "Free 1-on-1 coaching session with Eixn", "Arcana: Manifold Paradox". */
  name: string;
  /** Team name for jerseys/jackets, e.g. "Team Liquid". Optional. */
  team: string;
  /** Value in USD, shown as "($55 value)". 0 hides it. */
  value: number;
  /** Public image URL (uploaded from the dashboard). Empty = no image. */
  imageUrl: string;
}

export interface GiveawayItem {
  /** Permanent id. Entries and draws (giveaway_entries / giveaway_draws) are linked to it. */
  id: string;
  /** Members needed to unlock this giveaway. */
  goal: number;
  prize: Prize;
  /**
   * Winner shown on the public site (gold shine + hover to reveal). Set from the admin
   * Draw tab with "Display winner on site"; null/absent = not announced.
   */
  winner?: { name: string; drawnAt: string } | null;
}

export interface GiveawayContent {
  /** Current giveaways. One shows as a single card; two or more become a carousel. */
  items: GiveawayItem[];
  next: {
    /** false = blacked-out Aegis with a "?". */
    revealed: boolean;
    goal: number;
    prize: Prize;
  };
}

export interface PlanCard {
  name: string;
  price: number;
  /** e.g. "Locked in forever. First 20 members only." */
  subtitle: string;
  /** Small pill on the card, e.g. "Limited". Empty hides it. */
  badge: string;
  features: string[];
  /** Highlighted last line, e.g. "Founder perks: gold Founder role…". Text before the first ":" shows in gold. Empty hides it. */
  highlight: string;
  buttonLabel: string;
}

/** One line of the value stack under the price cards. */
export interface StackItem {
  item: string;
  /** Short outcome line under the item. */
  detail: string;
  /** USD per month. */
  value: number;
  /** Shown as a "Founder bonus" and left out of the Member total. */
  founderOnly: boolean;
}

export interface PricingContent {
  heading: string;
  subheading: string;
  founder: PlanCard;
  member: PlanCard;
  /** Hormozi-style value stack: everything included, with a value per line and a total. */
  stackTitle: string;
  stack: StackItem[];
  /** Footnote under the stack explaining the values: bold first line + text. */
  valueBoxTitle: string;
  valueBox: string;
  guarantee: string;
  smallPrint: string;
}

export interface FaqContent {
  /** `group` is the small title the question sits under; questions keep their order inside each group. */
  items: { q: string; a: string; group?: string }[];
}

export interface WheelSlot {
  name: string;
  statements: [string, string];
}

export interface WheelTestContent {
  /** Always exactly 6 slots (the wheel is a hexagon) with 2 statements each. */
  slots: WheelSlot[];
}

/** The "Next session" card in the hero, set from the dashboard. */
export interface NextSessionContent {
  /** Start time as an ISO string in UTC, e.g. "2026-10-31T12:00:00Z". */
  startsAt: string;
  /** This week's topic. Empty shows "Topic drops soon". */
  topic: string;
}

export interface SiteContent {
  giveaway: GiveawayContent;
  pricing: PricingContent;
  faq: FaqContent;
  wheel_test: WheelTestContent;
  next_session: NextSessionContent;
}

export type ContentKey = keyof SiteContent;
