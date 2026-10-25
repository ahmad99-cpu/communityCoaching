import { site } from "@/config/site";

/**
 * Visitor numbers with Umami (cloud.umami.is): page views, plus the clicks that matter for sales.
 * No cookies, so no cookie banner, and the script is about 2KB. It only loads on the live domain,
 * so testing locally never adds fake visits.
 *
 * Clicks are tracked with data attributes, e.g. <a data-umami-event="Open PayPal">. For things that
 * aren't clicks (a test finished, a form sent), call track() instead.
 */

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

export function loadAnalytics() {
  const id = site.analytics.umamiWebsiteId;
  const domains: readonly string[] = site.analytics.domains;
  if (!id || !domains.includes(window.location.hostname)) return;
  const script = document.createElement("script");
  script.src = "https://cloud.umami.is/script.js";
  script.defer = true;
  script.dataset.websiteId = id;
  script.dataset.domains = domains.join(",");
  // Pages like the Counter Picker keep their state in "?…" and update it on every pick; without
  // this, Umami counted each update as a new page view (tens of thousands of fake views a month).
  script.dataset.excludeSearch = "true";
  document.head.appendChild(script);
}

/** Records one event, e.g. track("Wheel test finished"). Does nothing until analytics is set up. */
export function track(event: string, data?: Record<string, string | number>) {
  try {
    window.umami?.track(event, data);
  } catch {
    /* blocked by an ad blocker: fine */
  }
}
