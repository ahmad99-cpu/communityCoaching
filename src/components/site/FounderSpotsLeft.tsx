import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";

/** "🔥 [X] of 20 founder spots left" — live from Supabase (see src/lib/memberCounts.tsx). */
export function FounderSpotsLeft({ label = "founder spots left", className = "" }: { label?: string; className?: string }) {
  const { founderSpotsLeft } = useMemberCounts();

  if (founderSpotsLeft === 0) {
    return <span className={`font-semibold text-text-muted ${className}`}>Founder spots are gone</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-gold ${className}`}>
      <span aria-hidden>🔥</span>
      <span>
        {founderSpotsLeft} of {site.founderSpots} {label}
      </span>
    </span>
  );
}
