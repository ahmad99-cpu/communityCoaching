import { Link } from "react-router-dom";

/**
 * The main "CLAIM MY FOUNDER SPOT" call to action. Always jumps to the pricing
 * section (where checkout lives), from any page.
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
        const pricing = document.getElementById("pricing");
        if (pricing) {
          e.preventDefault();
          pricing.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {children}
    </Link>
  );
}
