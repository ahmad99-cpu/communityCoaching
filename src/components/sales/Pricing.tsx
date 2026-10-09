import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { PayPalCheckout } from "@/components/sales/PayPalCheckout";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";

const FOUNDER_FEATURES = [
  "Weekly 2 to 3 hour live sessions",
  "Your replays broken down live",
  "Live drills every session",
  "Homework & progress rewards",
  "Start Here kit",
  "The Session Vault",
  "Members-only Discord & stack partners",
  "Special events: guest pros, watch parties, giveaways",
  "10% off sessions with Eixn",
];

function Check() {
  return (
    <span className="mt-0.5 text-gold" aria-hidden>
      ✓
    </span>
  );
}

/** Founder spots claimed so far: the Member plan opens when this bar fills. */
function MemberUnlock() {
  const { founderSpotsLeft, foundersSoldOut } = useMemberCounts();
  const claimed = site.founderSpots - founderSpotsLeft;
  const pct = (claimed / site.founderSpots) * 100;

  return (
    <div className="rounded-control border border-dashed border-navy-border bg-navy/60 p-5">
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden>
          {foundersSoldOut ? "🔓" : "🔒"}
        </span>
        <p className="text-sm font-bold text-text">
          {foundersSoldOut
            ? "Founder spots are gone. Member plan is open."
            : `Unlocks in ${founderSpotsLeft} founder spot${founderSpotsLeft === 1 ? "" : "s"}`}
        </p>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-navy-raised"
        role="progressbar"
        aria-label="Founder spots claimed"
        aria-valuemin={0}
        aria-valuemax={site.founderSpots}
        aria-valuenow={claimed}
      >
        <motion.div
          className="h-full rounded-full bg-text-muted/60"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-xs text-text-muted">
        {claimed} / {site.founderSpots} founder spots claimed
      </p>
      {!foundersSoldOut && (
        <p className="mt-4 border-t border-navy-border pt-4 text-xs leading-relaxed text-text-muted">
          Join now as a founder and you'll keep ${site.prices.founder} instead of ${site.prices.member}, forever.
        </p>
      )}
    </div>
  );
}

function Checkout({ open, plan }: { open: boolean; plan: "founder" | "member" }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="pt-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
              Pay with card or PayPal
            </p>
            <PayPalCheckout plan={plan} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Pricing() {
  const [open, setOpen] = useState<"founder" | "member" | null>(null);
  const { foundersSoldOut } = useMemberCounts();

  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Claim your spot</h2>
          <p className="mt-4 text-text-muted sm:text-lg">
            Every member gets the full 6SLOT experience. Founders just pay less, forever.
          </p>
        </Reveal>

        {/* Cards stretch to equal height; each card is a flex column with its button area pinned to the bottom. */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* FOUNDER */}
          <Reveal
            className={`card relative flex h-full flex-col p-6 sm:p-8 ${foundersSoldOut ? "opacity-60" : "border-2 border-gold shadow-[0_0_60px_-20px_rgba(232,181,74,0.5)]"}`}
          >
            <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[11px] font-black uppercase tracking-widest text-navy">
              {foundersSoldOut ? "Sold out" : "🔥 Limited"}
            </span>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text">Founder</h3>
            <p className="mt-4">
              <span className="text-5xl font-black text-text">${site.prices.founder}</span>
              <span className="text-text-muted"> / month</span>
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Locked in forever. First {site.founderSpots} members only.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm">
              {FOUNDER_FEATURES.map((f) => (
                <li key={f} className="flex gap-3 text-text">
                  <Check />
                  {f}
                </li>
              ))}
              <li className="flex gap-3 text-text">
                <Check />
                <span>
                  <strong className="text-gold">Founder perks:</strong> gold Founder role and a vote on every month's
                  topics
                </span>
              </li>
            </ul>

            <div className="mt-auto pt-8">
              {foundersSoldOut ? (
                <button className="btn-gold w-full" disabled>
                  All founder spots claimed
                </button>
              ) : (
                <>
                  <button
                    className="btn-gold w-full"
                    aria-expanded={open === "founder"}
                    onClick={() => setOpen(open === "founder" ? null : "founder")}
                  >
                    Claim my founder spot
                  </button>
                  <Checkout open={open === "founder"} plan="founder" />
                </>
              )}
              <p className="mt-4 flex h-6 items-center justify-center text-sm">
                <FounderSpotsLeft label="spots left" />
              </p>
            </div>
          </Reveal>

          {/* MEMBER */}
          <Reveal
            delay={0.08}
            className={`card flex h-full flex-col border-2 p-6 sm:p-8 ${foundersSoldOut ? "border-gold" : ""}`}
          >
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text">Member</h3>
            <p className="mt-4">
              <span className="text-5xl font-black text-text">${site.prices.member}</span>
              <span className="text-text-muted"> / month</span>
            </p>
            <p className="mt-2 text-sm text-text-muted">Available once founder spots are gone.</p>

            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex gap-3 text-text">
                <Check />
                Everything in Founder (except founder perks)
              </li>
            </ul>

            {/* Fills the space next to the longer Founder list with the live unlock status. */}
            <div className="mt-8 flex flex-1 flex-col justify-center">
              <MemberUnlock />
            </div>

            <div className="mt-auto pt-8">
              {foundersSoldOut ? (
                <>
                  <button
                    className="btn-gold w-full"
                    aria-expanded={open === "member"}
                    onClick={() => setOpen(open === "member" ? null : "member")}
                  >
                    Join 6SLOT
                  </button>
                  <Checkout open={open === "member"} plan="member" />
                </>
              ) : (
                <button className="btn-ghost w-full cursor-not-allowed opacity-60" disabled>
                  Unlocks after {site.founderSpots} founders
                </button>
              )}
              <p className="mt-4 flex h-6 items-center justify-center text-sm text-text-muted">
                {foundersSoldOut ? "Open to everyone" : `Opens after the ${site.founderSpots}th founder`}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-6 max-w-4xl space-y-4">
          <div className="card flex gap-4 p-5 sm:p-6">
            <span className="text-2xl" aria-hidden>💡</span>
            <p className="text-sm leading-relaxed text-text-muted sm:text-base">
              <strong className="text-text">A single 1-on-1 session with Eixn costs ${site.prices.oneOnOne}.</strong> As
              a founder, you get 4 live sessions a month, 2 to 3 hours each, plus everything above, for $
              {site.prices.founder}.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-card border border-navy-border bg-navy-raised/60 px-5 py-4 text-center">
            <span className="text-xl" aria-hidden>🛡️</span>
            <p className="text-sm font-bold text-text sm:text-base">
              Try your first session. Not for you? Full refund, no questions asked.
            </p>
          </div>

          <p className="text-center text-xs text-text-muted">
            Cancel anytime. Founders who cancel lose their ${site.prices.founder} price permanently.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
