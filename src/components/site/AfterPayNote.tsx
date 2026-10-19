import { Link } from "react-router-dom";

/** What happens after paying, shown under the checkout in the price card. */
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
