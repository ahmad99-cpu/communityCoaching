import { Link } from "react-router-dom";
import { scrollToJoin } from "@/lib/scrollToJoin";

/**
 * The main "CLAIM MY FOUNDER SPOT" call to action. Always jumps to the membership card
 * (where checkout lives), from any page.
 */
export function CtaButton({
  children = "Claim my founder spot",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to="/#pricing"
      className={`btn-gold ${className}`}
      onClick={(e) => {
        // Already on the sales page: scroll directly, so repeat clicks still work
        // even when the URL hash is already #pricing.
        if (scrollToJoin()) e.preventDefault();
      }}
    >
      {children}
    </Link>
  );
}
