import type { IconName } from "@/components/site/Icons";

/**
 * The 6SLOT Battle Pass: a level unlocks at each member milestone. Every level has a reward for
 * every member plus prizes drawn for winners. Draft rewards, still to be finalised with Eixn.
 */
export interface BattlePassLevel {
  /** Active members needed to unlock the level. */
  goal: number;
  title: string;
  icon: IconName;
  /** Name of a monthly award this level starts, shown above `everyone`. */
  award?: string;
  /** What every member gets (optional when the level's free tool is the shared reward). */
  everyone?: string;
  /** A free tool this level unlocks for every Dota player, credited to 6SLOT members. */
  tool?: { name: string; body: string };
  /** Rewards still secret: the card shows a "?" until they're revealed. */
  mystery?: boolean;
  /** Prizes drawn among members, one line each. */
  winners: string[];
}

export const BATTLE_PASS: BattlePassLevel[] = [
  {
    goal: 25,
    title: "Founders full",
    icon: "star",
    everyone: "Gold Founder role and badge in Discord, for life.",
    tool: { name: "Hero Tier List", body: "Eixn's tier list for the current patch, updated every patch." },
    winners: ["1 free 1-on-1 coaching session with Eixn"],
  },
  {
    goal: 50,
    title: "The first squad",
    icon: "users",
    everyone: "A bonus live session that month, on top of the weekly one.",
    tool: { name: "Patch Summary", body: "The changes that matter after every patch, with Eixn's take." },
    winners: ["3 free months of 6SLOT"],
  },
  {
    goal: 100,
    title: "Triple digits",
    icon: "trophy",
    award: "Climber of the Month",
    everyone: "Each month, the member who climbs the most MMR takes the title and wins a prize.",
    tool: { name: "Counter Picker", body: "Add the enemy heroes, see what to pick for your position." },
    winners: ["4 free 1-on-1 coaching sessions with Eixn"],
  },
  {
    goal: 250,
    title: "Stronger together",
    icon: "crosshair",
    award: "Comeback of the Month",
    everyone: "Each month, one member fighting through a rough losing streak gets a free coaching session with Eixn to turn it around.",
    winners: ["6 free months of 6SLOT"],
  },
  {
    goal: 500,
    title: "Double sessions",
    icon: "mic",
    everyone: "Two live coaching sessions every week instead of one.",
    winners: ["A 1-on-1 coaching program with Eixn"],
  },
  {
    goal: 1000,
    title: "The Aegis",
    icon: "shield",
    everyone: "A live celebration stream where the Aegis is drawn.",
    winners: ["The Aegis replica"],
  },
];

/**
 * The highest milestone already reached. Raise it when a level unlocks (e.g. to 25), so the
 * level stays unlocked on the site even if the member count dips after cancellations.
 */
export const HIGHEST_GOAL_REACHED = 0;
