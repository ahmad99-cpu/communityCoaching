import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { site } from "@/config/site";

export function FinalCta() {
  return (
    <section className="pb-24">
      <Container>
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-card border border-gold/40 bg-navy-raised px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(232,181,74,0.16),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              Your next slot starts <span className="text-gold">this week.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-muted sm:text-lg">
              One topic. Your replays. Live drills. Join before the founder spots are gone.
            </p>
            <CtaButton className="mt-8 w-full px-10 py-4 text-base sm:w-auto" />
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-text-muted">
              <span>${site.prices.founder}/month locked forever</span>
              <span aria-hidden>·</span>
              <span>Try your first session risk-free</span>
              <span aria-hidden>·</span>
              <FounderSpotsLeft label="spots left" />
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
