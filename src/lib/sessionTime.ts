import { site } from "@/config/site";

/**
 * Formats the first session in the visitor's own timezone (brief §3.2 dev note),
 * e.g. "Saturday, October 31 · 3:00 PM". Falls back to UTC on the server/prerender.
 */
export function formatFirstSessionLocal() {
  const date = new Date(site.firstSessionUtc);
  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return { day, time };
}

export function formatFirstSessionUtc() {
  const date = new Date(site.firstSessionUtc);
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
  return { day, time: `${time} UTC` };
}

/** True when the visitor's timezone is effectively UTC, so the "your time" line would be redundant. */
export function visitorIsOnUtc() {
  return new Date(site.firstSessionUtc).getTimezoneOffset() === 0;
}
