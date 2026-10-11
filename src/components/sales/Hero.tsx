import { useRef } from "react";
import { Link } from "react-router-dom";
import { WideContainer } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { Icon } from "@/components/site/Icons";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import eixnPortrait from "@/assets/eixn-portrait.webp";
import eixnPortrait720 from "@/assets/eixn-portrait-720.webp";
import eixnPortrait480 from "@/assets/eixn-portrait-480.webp";

// Hero entrance runs in plain CSS (.hero-in in index.css), so the headline and portrait
// animate on first paint without waiting for JavaScript animation code.
const fade = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  useHeroParallax(sectionRef);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Soft gold glow (centred on mobile, behind the portrait on desktop) + grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(232,181,74,0.13),transparent_70%)] lg:bg-[radial-gradient(ellipse_40%_60%_at_78%_40%,rgba(232,181,74,0.12),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#8FA0B5_1px,transparent_1px),linear-gradient(90deg,#8FA0B5_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      {/* Near full width on desktop so the copy sits left and the portrait right, with no empty gutters. */}
      <WideContainer className="relative grid lg:min-h-[min(calc(100svh-7.5rem),1080px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-[clamp(2rem,4vw,5rem)]">
        {/* Portrait (same cutout and motion as eixn-dota.com). Mobile: on top, with the headline
            overlapping its faded bottom. Desktop: right column, anchored to the bottom edge. */}
        <div className="relative mx-auto w-full max-w-[290px] pt-8 sm:max-w-[340px] lg:order-last lg:-mr-[clamp(2.5rem,6vw,7.5rem)] lg:flex lg:w-auto lg:max-w-none lg:items-end lg:pt-6">
          <div className="hero-portrait group relative w-full lg:w-auto">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(232,181,74,0.4)_0%,rgba(232,181,74,0.16)_32%,transparent_58%)] opacity-75 blur-[42px] transition-opacity duration-500 group-hover:opacity-95"
            />
            <div className="hero-portrait-frame relative">
              <img
                src={eixnPortrait}
                srcSet={`${eixnPortrait480} 480w, ${eixnPortrait720} 720w, ${eixnPortrait} 960w`}
                sizes="(min-width: 1024px) 66vh, (min-width: 640px) 340px, 290px"
                alt="Eixn, Dota 2 coach and Tier 1 analyst"
                width={960}
                height={1370}
                {...{ fetchpriority: "high" }} // lowercase: React 18 doesn't know fetchPriority yet
                className="hero-portrait-img relative block h-auto w-full lg:h-[min(calc(100svh-9.5rem),1000px)] lg:w-auto lg:max-w-none [mask-image:linear-gradient(to_bottom,black_72%,transparent_96%)]"
              />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 -mt-20 pb-20 text-center sm:-mt-24 sm:pb-24 lg:mt-0 lg:max-w-[760px] lg:self-center lg:py-20 lg:text-left">
          <h1
            {...fade(0)}
            className="hero-in mx-auto max-w-3xl text-4xl font-black uppercase leading-[1.04] tracking-tight sm:text-6xl lg:mx-0 lg:max-w-none lg:text-[clamp(3rem,4.3vw,5.25rem)]"
          >
            Stuck at the same rank? <span className="text-gold">Fix it one topic at a time.</span>
          </h1>

          <p {...fade(0.08)} className="hero-in mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg lg:mx-0 xl:max-w-2xl xl:text-xl">
            One topic a week, learned together as a group. Eixn breaks it down live using members&apos; replays and
            examples he prepares for each topic, then everyone puts it into practice before the session ends. And every
            so often, a pro player drops in. We&apos;re not saying who yet.
          </p>

          <div
            {...fade(0.16)}
            className="hero-in mt-8 flex flex-col items-center gap-x-6 gap-y-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <CtaButton className="w-full px-10 py-4 text-base sm:w-auto" />
            <FounderSpotsLeft className="text-sm" />
          </div>
          {/* Friction removers only (Graziosi/Hormozi): the price comes after the value stack, in Pricing. */}
          <ul
            {...fade(0.22)}
            className="hero-in mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-muted lg:justify-start"
          >
            <li className="flex items-center gap-2">
              <Icon name="calendar" className="h-4 w-4 text-gold" />
              Live every week on Discord
            </li>
            <li className="flex items-center gap-2">
              <Icon name="shield" className="h-4 w-4 text-gold" />
              <span>
                First-session money-back guarantee{" "}
                <Link to="/policies/refund" className="-my-2.5 inline-block py-2.5 text-xs underline decoration-text-muted/60 underline-offset-2 hover:text-text">
                  (terms)
                </Link>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-gold" />
              Cancel anytime
            </li>
          </ul>

          {/* Second path for visitors not ready to buy (lead magnet): clearly visible, but outlined so the
              gold "Claim" button stays the main action. */}
          <div {...fade(0.3)} className="hero-in mt-8 flex justify-center lg:justify-start">
            <Link
              to="/how-built-are-you"
              className="group flex w-full max-w-xl items-center gap-4 rounded-card border border-gold/40 bg-navy-raised/70 p-4 text-left transition hover:border-gold hover:bg-navy-raised sm:p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-gold/40 bg-navy text-gold">
                <Icon name="hexagon" className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-text sm:text-lg">Not sure where you stand?</span>
                <span className="mt-0.5 block text-sm text-text-muted">
                  Take the free 2-minute <strong className="font-semibold text-text">How Built Are You?</strong> test and
                  see which of your 6 slots is holding your MMR back.
                </span>
              </span>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition group-hover:translate-x-1 group-hover:bg-gold group-hover:text-navy"
              >
                <Icon name="arrow" className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </WideContainer>

      {/* Blend the bottom edge (where the portrait is cut off) into the next section. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-b from-transparent to-navy lg:block" />
    </section>
  );
}
