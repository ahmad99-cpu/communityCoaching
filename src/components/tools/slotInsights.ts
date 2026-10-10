/**
 * The Player Brief on the wheel test result, by slot position (0–5, same order as the wheel:
 * Role & Drafting, Laning, Farming & Itemization, Map Movement & Positioning, Teamfights &
 * Objectives, Mindset & Decisions). Slot names are editable in the dashboard; this coaching
 * copy lives here.
 */
export interface SlotInsight {
  /** Said about your strongest slot. */
  strength: string;
  /** What a weak slot costs you in games. */
  cost: string;
  /**
   * Optional quick win: one concrete thing to try in the next game. Shown in the Player Brief
   * only when filled in (to be written by Eixn).
   */
  firstFix?: string;
  /**
   * Optional "question to carry in" (from Tony Robbins' Growth Plan): one question to keep asking
   * yourself in-game. Shown in the Player Brief only when filled in (to be written by Eixn).
   */
  question?: string;
}

export const SLOT_INSIGHTS: SlotInsight[] = [
  {
    strength: "You understand what your team needs from your pick. That's a real edge most players at your rank don't have.",
    cost: "Games are half-lost before the horn: picks that don't fit your role, your lineup or the matchup.",
  },
  {
    strength: "You come out of lane in good shape, which gives you room to play the rest of the game on your terms.",
    cost: "A lost lane snowballs: less farm, later items, and you spend the whole game playing from behind.",
  },
  {
    strength: "You farm efficiently and build with a purpose. Your items usually show up when the game needs them.",
    cost: "You fall behind the farm curve, or build items that don't answer what the enemy is doing.",
  },
  {
    strength: "You're usually in the right place at the right time, and that awareness carries every other slot.",
    cost: "You show up late to fights, die out of position, or get caught walking alone.",
  },
  {
    strength: "You know when to fight and what to take after. That's what actually closes games.",
    cost: "Fights happen without you, or you win a fight and walk away with nothing to show for it.",
  },
  {
    strength: "You stay level-headed under pressure, which makes everything you learn stick faster.",
    cost: "Tilt and autopilot cost you games you should win. One bad decision turns into five.",
  },
];
