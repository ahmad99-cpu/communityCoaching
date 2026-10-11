import { WideContainer } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { useContent } from "@/lib/content";
import eixnSmile from "@/assets/eixn-smile.webp";
import eixnSmile640 from "@/assets/eixn-smile-640.webp";
import eixnSmile1024 from "@/assets/eixn-smile-1024.webp";

/**
 * The ending: a personal note from Eixn (Tony Robbins closes with a letter from Tony) with the
 * "two choices" close (Hormozi), then the button. A different photo from the hero on purpose:
 * the hero shows authority, the ending shows the person.
 */
export function FinalCta() {
  const founderPrice = useContent("pricing").founder.price;
  return (
    <section className="relative overflow-hidden border-t border-navy-border py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_25%_50%,rgba(232,181,74,0.12),transparent_70%)]"
      />
      <WideContainer className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Reveal className="relative mx-auto w-full max-w-lg">
          <div aria-hidden className="absolute -inset-3 rounded-[22px] bg-gold/10 blur-2xl" />
          <img
            src={eixnSmile}
            srcSet={`${eixnSmile640} 640w, ${eixnSmile1024} 1024w, ${eixnSmile} 1404w`}
            sizes="(min-width: 1024px) 512px, 90vw"
            alt="Eixn smiling on stage"
            width={1404}
            height={1146}
            loading="lazy"
            className="relative block h-auto w-full rounded-card border border-gold/30 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]"
          />
        </Reveal>

        <Reveal delay={0.08} className="text-center lg:text-left">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">A note from Eixn</p>
          <h2 className="section-heading mt-3">
            Your next topic starts <span className="text-gold">this week.</span>
          </h2>
          <div className="mx-auto mt-6 max-w-xl space-y-4 leading-relaxed text-text-muted lg:mx-0">
            <p>
              After 500+ 1-on-1 sessions, I noticed something: most players struggle with the same things. The same
              lanes, the same fights, the same decisions. You don&apos;t need an hour alone with a coach to fix those.
              You need the right topic, a coach who&apos;s been at the top, and players working on it with you.
            </p>
            <p>
              That&apos;s 6SLOT. Pro-level coaching from someone who&apos;s competed and analyzed at the highest level,
              from The International to a Tier 1 roster. One topic a week, real games, practiced together, for less
              than a single 1-on-1 session a month.
            </p>
            <p>
              You have two choices. Keep queueing alone and guessing. Or join a group that learns, grinds and climbs
              together.
            </p>
            <p className="text-text">I&apos;ll see you in the session.</p>
          </div>
          <p className="mt-4 font-display text-2xl font-bold text-gold">Eixn</p>

          <CtaButton className="mt-8 w-full px-10 py-4 text-base sm:w-auto" />
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-text-muted lg:justify-start">
            <span>${founderPrice}/month founder price</span>
            <span aria-hidden>·</span>
            <span>First-session money-back guarantee</span>
            <span aria-hidden>·</span>
            <FounderSpotsLeft label="founder spots left" />
          </p>
        </Reveal>
      </WideContainer>
    </section>
  );
}
