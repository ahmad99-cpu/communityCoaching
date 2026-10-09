import { Link } from "react-router-dom";

/** 6SLOT wordmark (public/6slot-logo-wordmark-transparent.svg): gold "6", white "SLOT". */
export function Logo({ withTagline = false, className = "" }: { withTagline?: boolean; className?: string }) {
  return (
    <Link to="/" className={`group inline-flex shrink-0 items-center gap-3 ${className}`} aria-label="6SLOT home">
      <img
        src="/6slot-logo-wordmark-transparent.svg"
        alt="6SLOT"
        width={590}
        height={146}
        className="h-7 w-auto shrink-0 sm:h-8"
      />
      {withTagline && (
        <span className="hidden text-xs font-medium text-text-muted sm:inline">Get fully built.</span>
      )}
    </Link>
  );
}
