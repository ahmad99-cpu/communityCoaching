import { useEffect, useState } from "react";
import { useContent } from "@/lib/content";
import { site } from "@/config/site";

const HOUR = 60 * 60 * 1000;
const WEEK = 7 * 24 * HOUR;
/** Sessions run 3+ hours; for 4 hours after the start the card says "Live now". */
export const SESSION_LENGTH = 4 * HOUR;

/**
 * Formats a session in the visitor's own timezone with its short name,
 * e.g. { day: "Sat, Oct 31", time: "8:00 AM EDT" } in New York or "11:00 PM AEDT" in Sydney.
 */
export function formatSessionLocal(date: Date) {
  const day = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date);
  return { day, time };
}

/** Whole days, hours and minutes until `ms` from now (rounded up to the next minute). */
export function countdownParts(ms: number) {
  const totalMin = Math.max(Math.ceil(ms / 60000), 0);
  return { d: Math.floor(totalMin / 1440), h: Math.floor((totalMin % 1440) / 60), m: totalMin % 60 };
}

/** The first start of a weekly slot (site.sessions.weekly) at or after `from`. */
function nextWeekly(from: number, slot: { day: number; hour: number; minute: number }) {
  const d = new Date(from);
  const daysAhead = (slot.day - d.getUTCDay() + 7) % 7;
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysAhead, slot.hour, slot.minute);
  return t < from ? t + WEEK : t;
}

/** The session starts at or after `from`, soonest first: `from`'s own date (if any) plus the weekly slots. */
function startsFrom(from: number, extra?: number) {
  const starts = site.sessions.weekly.flatMap((slot) => {
    const t = nextWeekly(from, slot);
    return [t, t + WEEK];
  });
  if (extra !== undefined) starts.push(extra);
  return [...new Set(starts)].sort((a, b) => a - b);
}

/**
 * The next session: the soonest weekly slot (site.sessions.weekly) or the date set in the dashboard
 * (/adminDashboard → Next session), whichever comes first. The dashboard date is the first session
 * of the week: earlier slots are skipped, and its topic covers that session plus the rest of the
 * week's slots. Once the week is over and nobody set a new topic, it shows "Topic drops soon", so
 * visitors never see a past date or a stale topic. Re-checks every 30 seconds for the countdown.
 */
export function useNextSession() {
  const { startsAt, topic } = useContent("next_session");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const set = new Date(startsAt).getTime();
  const valid = !Number.isNaN(set);
  // A session still counts (as "Live now") until SESSION_LENGTH after it starts.
  const from = Math.max(now - SESSION_LENGTH + 1, valid ? set : -Infinity);
  const start = startsFrom(from, valid && set >= from ? set : undefined)[0];
  const topicUntil = valid ? startsFrom(set, set)[site.sessions.weekly.length] : -Infinity;
  const currentTopic = start < topicUntil ? topic.trim() : "";

  return {
    start: new Date(start),
    topic: currentTopic,
    live: now >= start,
    msUntil: start - now,
  };
}
