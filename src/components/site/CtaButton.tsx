import { Link, useLocation } from "react-router-dom";
import { useMemberCounts } from "@/lib/memberCounts";
import { scrollToJoin } from "@/lib/scrollToJoin";

/**
 * The main "CLAIM MY FOUNDER SPOT" call to action. Always jumps to the membership card first
 * (price, what's included, guarantee), from any page; the card's button opens PayPal.
 */
export function CtaButton({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  const { foundersSoldOut } = useMemberCounts();
  const { pathname } = useLocation();
  return (
    <Link
      to="/#pricing"
      data-umami-event="Claim spot click"
      data-umami-event-page={pathname}
      className={`btn-gold ${className}`}
      onClick={(e) => {
        // Already on the sales page: scroll directly, so repeat clicks still work
        // even when the URL hash is already #pricing.
        if (scrollToJoin()) e.preventDefault();
      }}
    >
      {children ?? (foundersSoldOut ? "Join 6SLOT" : "Claim my founder spot")}
    </Link>
  );
}
