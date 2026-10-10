import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { PayPalCheckout } from "@/components/sales/PayPalCheckout";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";
import { useContent } from "@/lib/content";
import type { PlanCard } from "@/content/types";

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
  const pricing = useContent("pricing");
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
          Join now as a founder and you'll keep ${pricing.founder.price} instead of ${pricing.member.price}, forever.
        </p>
      )}
    </div>
  );
}

/** Card name, price, subtitle and feature list — all editable from the admin dashboard. */
function PlanDetails({ plan }: { plan: PlanCard }) {
  const colon = plan.highlight.indexOf(":");
  return (
    <>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text">{plan.name}</h3>
      <p className="mt-4">
        <span className="text-5xl font-black text-text">${plan.price}</span>
        <span className="text-text-muted"> / month</span>
      </p>
      {plan.subtitle && <p className="mt-2 text-sm text-text-muted">{plan.subtitle}</p>}

      <ul className="mt-6 space-y-2.5 text-sm">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-3 text-text">
            <Check />
            {f}
          </li>
        ))}
        {plan.highlight && (
          <li className="flex gap-3 text-text">
            <Check />
            {colon > 0 ? (
              <span>
                <strong className="text-gold">{plan.highlight.slice(0, colon + 1)}</strong>
                {plan.highlight.slice(colon + 1)}
              </span>
            ) : (
              <strong className="text-gold">{plan.highlight}</strong>
            )}
          </li>
        )}
      </ul>
    </>
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
  const pricing = useContent("pricing");

  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">{pricing.heading}</h2>
          <p className="mt-4 text-text-muted sm:text-lg">{pricing.subheading}</p>
        </Reveal>

        {/* Cards stretch to equal height; each card is a flex column with its button area pinned to the bottom. */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* FOUNDER */}
          <Reveal
            className={`card relative flex h-full flex-col p-6 sm:p-8 ${foundersSoldOut ? "opacity-60" : "border-2 border-gold shadow-[0_0_60px_-20px_rgba(232,181,74,0.5)]"}`}
          >
            {(foundersSoldOut || pricing.founder.badge) && (
              <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[11px] font-black uppercase tracking-widest text-navy">
                {foundersSoldOut ? "Sold out" : pricing.founder.badge}
              </span>
            )}
            <PlanDetails plan={pricing.founder} />

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
                    {pricing.founder.buttonLabel}
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
            className={`card relative flex h-full flex-col border-2 p-6 sm:p-8 ${foundersSoldOut ? "border-gold" : ""}`}
          >
            {pricing.member.badge && (
              <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[11px] font-black uppercase tracking-widest text-navy">
                {pricing.member.badge}
              </span>
            )}
            <PlanDetails plan={pricing.member} />

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
                    {pricing.member.buttonLabel}
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
              <strong className="text-text">{pricing.valueBoxTitle}</strong> {pricing.valueBox}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-card border border-navy-border bg-navy-raised/60 px-5 py-4 text-center">
            <span className="text-xl" aria-hidden>🛡️</span>
            <p className="text-sm font-bold text-text sm:text-base">
              {pricing.guarantee}
            </p>
          </div>

          <p className="text-center text-xs text-text-muted">
            {pricing.smallPrint}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
