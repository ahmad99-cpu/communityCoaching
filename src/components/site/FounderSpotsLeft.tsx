import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";

/** "[X] of 25 founder spots left" with a live dot (counts: src/lib/memberCounts.tsx). At 25: "Founder spots are full". */
export function FounderSpotsLeft({ label = "founder spots left", className = "" }: { label?: string; className?: string }) {
  const { founderSpotsLeft } = useMemberCounts();

  if (founderSpotsLeft === 0) {
    return <span className={`font-semibold text-text-muted ${className}`}>Founder spots are full</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-gold ${className}`}>
      <span aria-hidden className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-gold" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      <span>
        {founderSpotsLeft} of {site.join.founderCap} {label}
      </span>
    </span>
  );
}
