import { Icon } from "@/components/site/Icons";
import { WideContainer } from "@/components/layout/Container";
import { countdownParts, formatSessionLocal, useNextSession } from "@/lib/sessionTime";

/** One countdown unit, e.g. "20" over "days". */
function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex min-w-[2.6rem] flex-col items-center rounded-md bg-navy px-1.5 py-1 leading-none">
      <span className="text-sm font-black tabular-nums text-gold">{String(value).padStart(2, "0")}</span>
      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
    </span>
  );
}

/**
 * Event-style announcement bar above the header (like Tony Robbins' event pages): the next
 * live session, its topic, the time in the visitor's own timezone, and a countdown.
 * Topic and date are set in the dashboard (/adminDashboard → Next session).
 */
export function NextSessionBar() {
  const { start, topic, live, msUntil } = useNextSession();
  const { day, time } = formatSessionLocal(start);
  const { d, h, m } = countdownParts(msUntil);

  const countdownLabel = `Starts in ${d} days, ${h} hours and ${m} minutes`;
  const liveDot = (
    <span aria-hidden className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-red-500" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
    </span>
  );

  return (
    <div className="border-b border-gold/30 bg-[linear-gradient(90deg,rgba(232,181,74,0.08),rgba(232,181,74,0.22)_50%,rgba(232,181,74,0.08))]">
      {/* Phones: two compact lines, so the hero and its button stay on the first screen. */}
      <WideContainer className="py-2 sm:hidden">
        <p className="flex items-center justify-center gap-2 text-xs">
          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0 text-gold" />
          <span className="font-black uppercase tracking-[0.15em] text-gold">Next live</span>
          <span className="truncate font-bold text-text">{topic || "Topic drops soon"}</span>
        </p>
        <p className="mt-0.5 flex items-center justify-center gap-2 text-xs font-semibold text-text">
          <span>
            {day} · {time}
          </span>
          <span className="text-navy-border" aria-hidden>
            |
          </span>
          {live ? (
            <span className="flex items-center gap-1.5 font-black uppercase tracking-wider">
              {liveDot} Live now
            </span>
          ) : (
            <span className="font-black tabular-nums text-gold" aria-label={countdownLabel}>
              {d}d {h}h {m}m
            </span>
          )}
        </p>
      </WideContainer>

      {/* Tablet and desktop: one line with the boxed countdown. */}
      <WideContainer className="hidden items-center justify-center gap-x-8 py-2.5 sm:flex lg:h-14 lg:py-0">
        <div className="flex min-w-0 items-center gap-x-3">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Next live session
          </span>
          <span className="truncate text-base font-bold text-text">{topic || "Topic drops soon"}</span>
          <span className="text-navy-border" aria-hidden>
            |
          </span>
          <span className="whitespace-nowrap text-base font-semibold text-text">
            {day} · {time}
          </span>
        </div>

        {live ? (
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text">
            {liveDot}
            Live now on Discord
          </span>
        ) : (
          <span className="flex items-center gap-1.5" aria-label={countdownLabel}>
            <Unit value={d} label="days" />
            <Unit value={h} label="hrs" />
            <Unit value={m} label="min" />
          </span>
        )}
      </WideContainer>
    </div>
  );
}
