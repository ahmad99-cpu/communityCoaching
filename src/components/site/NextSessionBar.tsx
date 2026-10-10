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
 * Topic and date are set in the dashboard (/admin → Next session).
 */
export function NextSessionBar() {
  const { start, topic, live, msUntil } = useNextSession();
  const { day, time } = formatSessionLocal(start);
  const { d, h, m } = countdownParts(msUntil);

  return (
    <div className="border-b border-gold/30 bg-[linear-gradient(90deg,rgba(232,181,74,0.08),rgba(232,181,74,0.22)_50%,rgba(232,181,74,0.08))]">
      <WideContainer className="flex flex-col items-center justify-center gap-x-8 gap-y-2 py-2.5 text-center sm:flex-row lg:h-14 lg:py-0">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Next live session
          </span>
          <span className="truncate text-sm font-bold text-text sm:text-base">{topic || "Topic drops soon"}</span>
          <span className="hidden text-navy-border sm:inline" aria-hidden>
            |
          </span>
          <span className="text-sm font-semibold text-text sm:text-base">
            {day} · {time}
          </span>
        </div>

        {live ? (
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text">
            <span aria-hidden className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-red-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            Live now on Discord
          </span>
        ) : (
          <span className="flex items-center gap-1.5" aria-label={`Starts in ${d} days, ${h} hours and ${m} minutes`}>
            <Unit value={d} label="days" />
            <Unit value={h} label="hrs" />
            <Unit value={m} label="min" />
          </span>
        )}
      </WideContainer>
    </div>
  );
}
