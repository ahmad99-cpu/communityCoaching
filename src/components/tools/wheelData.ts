import type { WheelSlot } from "@/content/types";

/**
 * Wheel test scoring (brief §5). The slots and statements themselves are editable
 * content (admin dashboard → "How Built Are You?"); defaults in src/content/defaults.ts.
 */

/** Flat list of the 12 statements in order, each tagged with its slot index. */
export function flattenStatements(slots: WheelSlot[]) {
  return slots.flatMap((slot, slotIndex) => slot.statements.map((text) => ({ text, slotIndex, slotName: slot.name })));
}

export interface WheelResult {
  /** Six slot scores, 0–10 (average of the slot's two statements). */
  slots: number[];
  /** Sum of the six slots, 0–60. */
  total: number;
  /** The lowest slot, or -1 when all six are equal (an even wheel has no single biggest gap). */
  weakestIndex: number;
}

export function scoreWheel(answers: number[]): WheelResult {
  const slots = [0, 1, 2, 3, 4, 5].map((i) => (answers[i * 2] + answers[i * 2 + 1]) / 2);
  const total = slots.reduce((a, b) => a + b, 0);
  const even = slots.every((s) => s === slots[0]);
  const weakestIndex = even ? -1 : slots.indexOf(Math.min(...slots));
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
