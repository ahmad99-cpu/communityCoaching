import { Link, useLocation } from "react-router-dom";
import { useMemberCounts } from "@/lib/memberCounts";
import { scrollToJoin } from "@/lib/scrollToJoin";
import { memberChannel, useMembership } from "@/lib/membership";

/**
 * The main "CLAIM MY FOUNDER SPOT" call to action. Always jumps to the membership card first
 * (price, what's included, guarantee), from any page; the card's button opens PayPal.
 */
export function CtaButton({
  children,
  className = "",
  memberLabel = "Open the Discord",
}: {
  children?: React.ReactNode;
  className?: string;
  /** What the button says for members (it opens the Discord); short in tight spots like the header. */
  memberLabel?: string;
}) {
  const { foundersSoldOut } = useMemberCounts();
  const { pathname } = useLocation();
  const member = useMembership();
  // Already a member on this device: the call to action is the Discord, not a second checkout.
  if (member) {
    return (
      <a href={memberChannel(member)} target="_blank" rel="noopener noreferrer" className={`btn-gold ${className}`}>
        {memberLabel}
      </a>
    );
  }
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
