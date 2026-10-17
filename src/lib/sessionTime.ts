import { useEffect, useState } from "react";
import { useContent } from "@/lib/content";

const HOUR = 60 * 60 * 1000;
const WEEK = 7 * 24 * HOUR;
/** Sessions run 2 to 3 hours; until then the card says "Live now". */
export const SESSION_LENGTH = 3 * HOUR;

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

/**
 * The next session as set in the dashboard (/admin → Next session). Fail-safe: if that
 * session is over and nobody updated it, it rolls forward week by week (sessions are
 * weekly) and drops the old topic, so visitors never see a past date or a stale topic.
 * Re-checks every 30 seconds for the countdown.
 */
export function useNextSession() {
  const { startsAt, topic } = useContent("next_session");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  let start = new Date(startsAt).getTime();
  let currentTopic = topic.trim();
  if (Number.isNaN(start)) start = now;
  if (now >= start + SESSION_LENGTH) {
    const weeksLate = Math.ceil((now - start - SESSION_LENGTH + 1) / WEEK);
    start += weeksLate * WEEK;
    currentTopic = "";
  }

  return {
    start: new Date(start),
    topic: currentTopic,
    live: now >= start,
    msUntil: start - now,
  };
}
