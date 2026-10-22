import { Link } from "react-router-dom";

/** What happens after paying, shown under the checkout in the price card. */
export function AfterPayNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-text-muted ${className}`}>
      After paying: a 1-minute form, then our Discord. Access within 24 hours.{" "}
      <Link to="/policies/terms" className="underline underline-offset-2 hover:text-text">
        Terms apply
      </Link>
      .
    </p>
  );
}
