import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";

/**
 * Opens the PayPal payment link in a new tab: the founder link while founder spots are open,
 * the regular link once they're full. With no regular link set, the button is disabled (it never
 * falls back to the founder price).
 */
export function PayButton({ children, className = "" }: { children?: ReactNode; className?: string }) {
  const { foundersSoldOut } = useMemberCounts();
  const href = foundersSoldOut ? site.join.memberLink : site.join.founderLink;

  if (!href) {
    return (
      <button type="button" disabled className={`btn-gold cursor-not-allowed opacity-50 ${className}`}>
        Founder spots are full
      </button>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event="Open PayPal"
      data-umami-event-plan={foundersSoldOut ? "member" : "founder"}
      className={`btn-gold ${className}`}
    >
      {children ?? (foundersSoldOut ? "Join 6SLOT" : "Claim my founder spot")}
    </a>
  );
}

/** What happens after paying, shown under the pay buttons. */
export function AfterPayNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-text-muted ${className}`}>
      After you pay: join our Discord and fill a 2-minute onboarding form. Eixn gives you access within 24 hours.
      By joining you agree to the{" "}
      <Link to="/policies/terms" className="underline underline-offset-2 hover:text-text">
        Terms
      </Link>
      .
    </p>
  );
}
