import { CinematicHero } from "@/components/home/CinematicHero";
import { StatsBar } from "@/components/home/StatsBar";
import { RosterHighlight } from "@/components/home/RosterHighlight";
import { LatestContent } from "@/components/home/LatestContent";
import { CtaSection } from "@/components/home/CtaSection";
import { Container } from "@/components/layout/Container";

/**
 * Real home page per SPEC.md §7: cinematic video hero, stats bar, roster
 * highlight, latest content, CTA. Every other nav item still renders
 * PagePlaceholder — build those out page by page the same way.
 *
 * CinematicHero is full-bleed (renders outside Container on purpose — see
 * Container.tsx's note on Layout's unconstrained <main>); everything below
 * it opts back into the constrained width.
 */
export function Home() {
  return (
    <>
      <CinematicHero />
      <Container>
        <StatsBar />
        <RosterHighlight />
        <LatestContent />
        <CtaSection />
      </Container>
    </>
  );
}
