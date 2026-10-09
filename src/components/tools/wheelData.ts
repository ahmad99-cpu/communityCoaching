/** The six slots and 12 statements of the "How Built Are You?" wheel test (brief §5). */
export const SLOTS = [
  {
    name: "Role & Drafting",
    statements: [
      "I know how to play my main role, and a secondary role when I don't get my main",
      "My hero pool is big enough to play any game, including picking counters",
    ],
  },
  {
    name: "Laning",
    statements: [
      "I know how to win or go even in a hard matchup",
      "I understand resource management, pulling, and lane equilibrium",
    ],
  },
  {
    name: "Farming & Itemization",
    statements: [
      "I change my build based on the enemy heroes, not a guide",
      "I hit my item timings on time, not delayed",
    ],
  },
  {
    name: "Map Movement & Positioning",
    statements: [
      "I'm never walking around the map doing nothing, I always know where I should be next",
      "I'm always in the right place on the map based on the game time and the next objective",
    ],
  },
  {
    name: "Teamfights & Objectives",
    statements: [
      "I know my job in a fight and hit the right targets",
      "I know when to take Roshan, push a tower, or back off",
    ],
  },
  {
    name: "Mindset & Decisions",
    statements: [
      "I stay calm and keep communicating after mistakes or bad teammates",
      "I can explain why I lost a game, beyond blaming my team",
    ],
  },
] as const;

/** Flat list of statements in order, each tagged with its slot index. */
export const STATEMENTS = SLOTS.flatMap((slot, slotIndex) =>
  slot.statements.map((text) => ({ text, slotIndex, slotName: slot.name })),
);

export interface WheelResult {
  /** Six slot scores, 0–10 (average of the slot's two statements). */
  slots: number[];
  /** Sum of the six slots, 0–60. */
  total: number;
  weakestIndex: number;
}

export function scoreWheel(answers: number[]): WheelResult {
  const slots = SLOTS.map((_, i) => (answers[i * 2] + answers[i * 2 + 1]) / 2);
  const total = slots.reduce((a, b) => a + b, 0);
  const weakestIndex = slots.indexOf(Math.min(...slots));
  return { slots, total, weakestIndex };
}

/** "6", "6.5" — no trailing ".0". */
export function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// --- History, so a monthly retake can show last month's wheel as a faint outline ---

const HISTORY_KEY = "6slot:wheel-history";

export interface WheelHistoryEntry {
  date: string;
  slots: number[];
}

export function loadWheelHistory(): WheelHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as WheelHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveWheelHistory(slots: number[]) {
  try {
    const history = [...loadWheelHistory(), { date: new Date().toISOString(), slots }].slice(-24);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage unavailable — retake comparison just won't show.
  }
}
