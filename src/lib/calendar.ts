/** "Add to calendar" links for the weekly live session: Google, Outlook and an .ics file (Apple and others). */
export interface CalendarEvent {
  title: string;
  details: string;
  location: string;
  start: Date;
  end: Date;
  /** Repeat every week (Google and .ics; Outlook web links can't carry a repeat rule). */
  weekly?: boolean;
}

/** 20261031T120000Z */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl(e: CalendarEvent) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    details: e.details,
    location: e.location,
  });
  if (e.weekly) p.set("recur", "RRULE:FREQ=WEEKLY");
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function outlookCalendarUrl(e: CalendarEvent) {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: e.start.toISOString(),
    enddt: e.end.toISOString(),
    body: e.details,
    location: e.location,
  });
  return `https://outlook.live.com/calendar/0/action/compose?${p}`;
}

/** Downloads an .ics file: opens in Apple Calendar on iPhone/Mac, and in most other calendar apps. */
export function downloadIcs(e: CalendarEvent, filename = "6slot-session.ics") {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//6SLOT//Live session//EN",
    "BEGIN:VEVENT",
    `UID:6slot-${stamp(e.start)}@6slot`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    ...(e.weekly ? ["RRULE:FREQ=WEEKLY"] : []),
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.details)}`,
    `LOCATION:${esc(e.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:6SLOT live session in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
