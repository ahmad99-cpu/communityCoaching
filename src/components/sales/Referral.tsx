import { Icon } from "@/components/site/Icons";

/**
 * "Bring your stack": a slim strip attached under the membership card (part of the offer, not
 * its own section). Members bring a friend to a live session once a month, and get a free month
 * when a friend joins.
 */
export function Referral() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-gold/30 bg-[linear-gradient(90deg,rgba(232,181,74,0.10),rgba(232,181,74,0.02))] p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-navy text-gold">
          <Icon name="users" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-extrabold text-text">Bring your stack</p>
          <p className="text-xs text-text-muted">Dota is better with friends.</p>
        </div>
      </div>
      <div className="grid flex-1 gap-3 text-sm sm:grid-cols-2 sm:border-l sm:border-gold/20 sm:pl-6">
        <p className="text-text-muted">
          <strong className="text-text">Bring a friend once a month</strong> to a live session, free.
        </p>
        <p className="text-text-muted">
          <strong className="text-text">They join, you get a month free.</strong> Your next month is on us.
        </p>
      </div>
    </div>
  );
}
