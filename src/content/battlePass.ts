import type { IconName } from "@/components/site/Icons";

/**
 * The 6SLOT Battle Pass: a level unlocks at each member milestone (25, 50, 75, 100). Every level has
 * a reward for every member plus prizes drawn for winners, ending on the Aegis at 100 members.
 */
/** One reward on a level, shown as a picture tile with a short label; tapping it shows `detail`. */
export interface BattlePassReward {
  /** "everyone": every member gets it. "prize": drawn among active members. */
  kind: "everyone" | "prize";
  /** 2 to 4 words, under the tile. */
  label: string;
  /** The tile's picture: an icon, big text like "2×", or the Aegis itself. */
  icon?: IconName;
  glyph?: string;
  aegis?: boolean;
  /** Prizes only: how many members win it (shown as ×4 on the tile). */
  winners?: number;
  /** The full sentence, shown when the tile is tapped. */
  detail: string;
}

export interface BattlePassLevel {
  /** Active members needed to unlock the level. */
  goal: number;
  title: string;
  rewards: BattlePassReward[];
}

export const BATTLE_PASS: BattlePassLevel[] = [
  {
    goal: 25,
    title: "Founders full",
    rewards: [
      { kind: "everyone", icon: "crown", label: "Gold Founder role", detail: "Every member gets the gold Founder role in Discord, for life." },
      { kind: "everyone", icon: "door", label: "Founders Lounge", detail: "Every member gets a seat in the private Founders Lounge, for life." },
      { kind: "prize", icon: "gift", winners: 1, label: "1-on-1 with Eixn", detail: "1 member wins a free 1-on-1 coaching session with Eixn." },
    ],
  },
  {
    goal: 50,
    title: "Climbing together",
    rewards: [
      { kind: "everyone", icon: "climb", label: "Climber of the Month", detail: "Each month, the member who climbs the most MMR takes the title and wins a prize." },
      { kind: "prize", icon: "gift", winners: 1, label: "3 months free", detail: "1 member wins 3 free months of 6SLOT." },
    ],
  },
  {
    goal: 75,
    title: "Stronger together",
    rewards: [
      { kind: "everyone", icon: "comeback", label: "Comeback of the Month", detail: "Each month, one member fighting through a rough losing streak wins a prize and a free coaching session with Eixn to turn it around." },
      { kind: "prize", icon: "gift", winners: 4, label: "1-on-1 with Eixn", detail: "4 members each win a free 1-on-1 coaching session with Eixn." },
    ],
  },
  {
    goal: 100,
    title: "The Aegis",
    rewards: [
      { kind: "everyone", glyph: "2×", label: "Live sessions a week", detail: "2 live coaching sessions every week instead of 1, from then on." },
      { kind: "everyone", icon: "tv", label: "Celebration stream", detail: "A live celebration stream, where the Aegis winner is drawn." },
      { kind: "prize", aegis: true, winners: 1, label: "The Aegis replica", detail: "1 member wins the 1:1 Aegis replica, shipped to their door." },
    ],
  },
];

/**
 * The highest milestone already reached. Raise it when a level unlocks (e.g. to 25), so the
 * level stays unlocked on the site even if the member count dips after cancellations.
 */
export const HIGHEST_GOAL_REACHED = 0;

/** Levels after the Aegis, shown as mystery cards until they're revealed at 100 members. */
export const COMING_SOON_LEVELS = 3;

/** The real Aegis replica: shown when someone taps the Aegis on the Battle Pass page. */
export const AEGIS_SPECS: { label: string; value: string }[] = [
  { label: "Scale", value: "1:1 replica of the Aegis" },
  { label: "Diameter", value: "42 cm" },
  { label: "Material", value: "Polystone (heavy resin)" },
  { label: "Weight", value: "About 5 kg, with packaging" },
  { label: "Finish", value: "TI1 edition paint" },
  { label: "Shipping", value: "Free, to an address of your choice" },
];
