import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { site } from "@/config/site";
import { formatFirstSessionLocal, formatFirstSessionUtc, visitorIsOnUtc } from "@/lib/sessionTime";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const local = formatFirstSessionLocal();
  const utc = formatFirstSessionUtc();
  const onUtc = visitorIsOnUtc();

  return (
    <section className="relative overflow-hidden">
      {/* Soft gold glow + hex grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(232,181,74,0.13),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#8FA0B5_1px,transparent_1px),linear-gradient(90deg,#8FA0B5_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <Container className="relative pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
        <motion.p {...fade(0)} className="text-xs font-bold uppercase tracking-[0.2em] text-gold sm:text-sm">
          Tier 1 Analyst · The International ×3 &amp; Riyadh Masters
        </motion.p>

        <motion.h1
          {...fade(0.08)}
          className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Stuck at the same rank? <span className="text-gold">Fix it one topic at a time.</span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
          Every week, one topic. Submit your replays, and Eixn breaks them down live. You drill it, leave with
          homework, and actually understand it. Plus special guests along the way.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-9 flex flex-col items-center gap-4">
          <CtaButton className="w-full px-10 py-4 text-base sm:w-auto" />
          <p className="text-sm text-text-muted">
            ${site.prices.founder}/month locked forever · Try your first session risk-free · Cancel anytime
          </p>
        </motion.div>

        <motion.div {...fade(0.32)} className="card mx-auto mt-10 max-w-xl px-6 py-5">
          <p className="text-sm font-bold text-text sm:text-base">
            First session: {onUtc ? `${utc.day} · ${utc.time}` : `${local.day} · ${local.time}`}
            {!onUtc && <span className="ml-2 font-medium text-text-muted">(your time)</span>}
          </p>
          {!onUtc && <p className="mt-1 text-xs text-text-muted">{utc.day} · {utc.time}</p>}
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Every Saturday, 2 to 3 hours. Times can shift based on a weekly member survey, and every session is
            recorded.
          </p>
        </motion.div>

        <motion.div
          {...fade(0.4)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-text"
        >
          <span>500+ players coached</span>
          <span className="text-navy-border" aria-hidden>|</span>
          <span>11,000 MMR</span>
          <span className="text-navy-border" aria-hidden>|</span>
          <FounderSpotsLeft />
        </motion.div>

        <motion.p {...fade(0.48)} className="mt-8 text-sm text-text-muted">
          <em>Not sure where you stand?</em>{" "}
          <Link to="/how-built-are-you" className="font-bold text-text underline decoration-gold/60 underline-offset-4 hover:decoration-gold">
            Check how built you are (2 min) →
          </Link>
        </motion.p>
      </Container>
    </section>
  );
}
