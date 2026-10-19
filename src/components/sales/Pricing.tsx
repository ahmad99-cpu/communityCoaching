import { useState } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { AfterPayNote, PayButton } from "@/components/site/PayButton";
import { PayPalCheckout } from "@/components/sales/PayPalCheckout";
import { isPayPalConfigured } from "@/lib/paypal";
import { isSupabaseConfigured } from "@/lib/supabaseRest";
import { track } from "@/lib/analytics";
import { Referral } from "@/components/sales/Referral";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";
import { useContent } from "@/lib/content";
import type { PlanCard } from "@/content/types";
import { Icon } from "@/components/site/Icons";

function Check() {
  return (
    <span className="mt-0.5 text-gold" aria-hidden>
      ✓
    </span>
  );
}

/** Founder spots claimed so far, with what happens when they're gone. */
function FounderProgress({ memberPrice }: { memberPrice: number }) {
  const { founderSpotsLeft } = useMemberCounts();
  const cap = site.join.founderCap;
  const claimed = cap - founderSpotsLeft;
  const pct = (claimed / cap) * 100;

  return (
    <div>
      <div className="flex items-end justify-between text-xs font-semibold text-text-muted">
        <span>
          <strong className="text-gold">{claimed}</strong> / {cap} founder spots claimed
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy"
        role="progressbar"
        aria-label="Founder spots claimed"
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-valuenow={claimed}
      >
        <m.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-xs text-text-muted">Goes to ${memberPrice}/month after the first {cap} members.</p>
    </div>
  );
}

/** Feature list (editable in the dashboard), plus the founder perks line while founder spots are open. */
function Features({ plan, showHighlight }: { plan: PlanCard; showHighlight: boolean }) {
  const colon = plan.highlight.indexOf(":");
  return (
    <ul className="space-y-3 text-sm">
      {plan.features.map((f, i) => (
        <li key={i} className="flex gap-3 text-text">
          <Check />
          {f}
        </li>
      ))}
      {showHighlight && plan.highlight && (
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
  );
}

/**
 * One tier, one card. While founder spots are open it sells the founder launch price
 * ($27 struck through, $19 locked in); once they're gone the same card switches to $27.
 * The button opens the matching PayPal payment link (site.join) in a new tab.
 */
function MembershipCard() {
  const { foundersSoldOut } = useMemberCounts();
  const pricing = useContent("pricing");
  const plan = foundersSoldOut ? pricing.member : pricing.founder;

  return (
    <div id="join" className="card relative grid overflow-hidden border-2 border-gold shadow-[0_0_60px_-20px_rgba(232,181,74,0.5)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col p-6 sm:p-8 md:border-r md:border-navy-border">
        {!foundersSoldOut && (
          <span className="self-start rounded-full bg-gold px-3 py-1 text-[11px] font-black uppercase tracking-widest text-navy">
            Founder price
          </span>
        )}
        <h3 className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-text">6SLOT Membership</h3>
        <p className="mt-3">
          {/* The real anchor: $27 is the actual price once founder spots are gone. */}
          {!foundersSoldOut && pricing.member.price > pricing.founder.price && (
            <span className="mr-3 align-[0.6em] text-2xl font-bold text-text-muted line-through decoration-2">
              <span className="sr-only">Regular price </span>${pricing.member.price}
            </span>
          )}
          <span className="text-6xl font-black text-gold">${plan.price}</span>
          <span className="text-text-muted"> / month</span>
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {foundersSoldOut ? "Cancel anytime." : "Founder price, locked in for as long as you stay."}
        </p>

        {!foundersSoldOut && (
          <div className="mt-6">
            <FounderProgress memberPrice={pricing.member.price} />
          </div>
        )}

        <div className="mt-auto pt-8">
          <Checkout label={plan.buttonLabel} />
          <p className="mt-4 flex h-6 items-center justify-center text-sm">
            <FounderSpotsLeft label="founder spots left" />
          </p>
          <AfterPayNote className="mt-3 text-center" />
        </div>
      </div>

      <div className="border-t border-navy-border bg-navy/40 p-6 sm:p-8 md:border-t-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Everything included</p>
        <div className="mt-5">
          <Features plan={pricing.founder} showHighlight={!foundersSoldOut} />
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const pricing = useContent("pricing");

  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Membership</p>
          <h2 className="section-heading mt-3">{pricing.heading}</h2>
          <p className="mt-4 text-text-muted sm:text-lg">{pricing.subheading}</p>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-4xl space-y-4">
          <MembershipCard />
          <Referral />

          <div className="flex items-center justify-center gap-3 rounded-card border border-navy-border bg-navy-raised/60 px-5 py-4 text-center">
            <Icon name="shield" className="h-6 w-6 text-gold" />
            <p className="text-sm font-bold text-text sm:text-base">
              {pricing.guarantee}{" "}
              <Link to="/policies/refund" className="-my-2.5 inline-block py-2.5 text-xs font-semibold text-text-muted underline underline-offset-2 hover:text-text">
                Terms
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-text-muted">{pricing.smallPrint}</p>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * The pay button in the price card. With PayPal + Supabase set up: monthly subscriptions, and
 * PayPal's checkout (a heavy script) only loads once the gold button is clicked, so the page stays
 * fast. Without them: the one-time PayPal Pay Links (PayButton).
 */
function Checkout({ label }: { label: string }) {
  const { foundersSoldOut } = useMemberCounts();
  const [open, setOpen] = useState(false);
  const plan = foundersSoldOut ? "member" : "founder";

  if (!isPayPalConfigured || !isSupabaseConfigured) {
    return <PayButton className="w-full py-4 text-base">{label}</PayButton>;
  }
  if (open) return <PayPalCheckout plan={plan} />;
  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
        track("Open PayPal", { plan });
      }}
      className="btn-gold w-full py-4 text-base"
    >
      {label}
    </button>
  );
}
