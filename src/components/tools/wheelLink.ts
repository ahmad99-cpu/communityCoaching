import { ANSWER_SCORES } from "@/components/tools/wheelAnswers";

/**
 * A personal link to a wheel result, so players can come back to it on any device without an
 * account or retaking the test: the 12 answers ride in the link itself (each answer is one of
 * 4 choices, so 12 of them pack into a few characters), plus the player's name.
 *   6slot.gg/how-built-are-you?w=a3k9x&n=EixnFan
 */

const VERSION = "a";
const COUNT = 12;

/** Answers (scores from ANSWER_SCORES) → short code, e.g. "a3k9x". */
export function encodeWheel(answers: number[]): string {
  let n = 0;
  for (const score of answers) n = n * 4 + Math.max(0, ANSWER_SCORES.indexOf(score as (typeof ANSWER_SCORES)[number]));
  return VERSION + n.toString(36);
}

/** Short code → answers (scores), or null if the code isn't a valid wheel. */
export function decodeWheel(code: string | null): number[] | null {
  if (!code || !/^a[0-9a-z]{1,6}$/.test(code)) return null;
  let n = parseInt(code.slice(1), 36);
  if (!Number.isFinite(n) || n < 0 || n >= 4 ** COUNT) return null;
  const answers: number[] = [];
  for (let i = 0; i < COUNT; i++) {
    answers.unshift(ANSWER_SCORES[n % 4]);
    n = Math.floor(n / 4);
  }
  return answers;
}

/** The path + query of a wheel link (relative), e.g. "/how-built-are-you?w=a3k9x&n=EixnFan". */
export function wheelPath(code: string, name: string) {
  const params = new URLSearchParams({ w: code });
  if (name) params.set("n", name);
  return `/how-built-are-you?${params}`;
}

// --- The last wheel taken on this device, for "Welcome back: see your last wheel" ---

const LAST_KEY = "6slot:wheel-last";

export interface LastWheel {
  code: string;
  name: string;
  date: string;
}

export function saveLastWheel(code: string, name: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ code, name, date: new Date().toISOString() } satisfies LastWheel));
  } catch {
    // Storage unavailable: the personal link still works.
  }
}

export function loadLastWheel(): LastWheel | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    const last = raw ? (JSON.parse(raw) as LastWheel) : null;
    return last && decodeWheel(last.code) ? last : null;
  } catch {
    return null;
  }
}
