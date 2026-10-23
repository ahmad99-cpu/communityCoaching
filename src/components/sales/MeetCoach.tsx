import { Container } from "@/components/layout/Container";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/common/Reveal";
import { site } from "@/config/site";
import { useCountUp } from "@/hooks/useCountUp";

/** Gold highlight for names, same as eixn-dota.com (brief §3.5 design note). */
function G({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-gold">{children}</strong>;
}

/**
 * Counts a stat like "11K" or "500+" up from 0 the first time it scrolls into view; text stats
 * ("Tier 1") stay as they are. Shows the final value straight away for reduced motion.
 */
function StatValue({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const numeric = Boolean(match);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = ref.current;
    if (!el || !numeric || reduce) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [numeric, reduce]);

  const target = match ? Number(match[1]) : 0;
  const counted = useCountUp(target, inView, 1400);
  if (!match || reduce) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {counted}
      {match[2]}
    </span>
  );
}

const STATS = [
  { value: "11K", label: "MMR" },
  { value: "Tier 1", label: "Analyst", note: "3× The International · Riyadh Masters" },
  { value: "500+", label: "Students" },
  { value: "23K", label: "Hours" },
];

export function MeetCoach() {
  return (
    <section className="border-y border-navy-border bg-navy-raised/40 py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">The coach behind 6SLOT</p>
            <h2 className="section-heading mt-3">Meet your coach</h2>
          </div>

          <div className="mt-10 space-y-5 text-base leading-relaxed text-text-muted sm:text-lg">
            <p>
              <G>Jad Hammoud</G>, known as <G>Eixn</G>, played professionally for years and competed at the highest
              level. But the coaching didn't start when <G>Eixn</G> retired. It started long before that.
            </p>
            <p>
              Through his entire playing career, he was coaching. No platform, no audience. Just teammates, friends and
              players in his circle trying to figure their game out.
            </p>
            <p>
              That instinct took over when <G>Eixn</G> found himself helping the young players on the <G>PSG Quest</G>{" "}
              roster. The team went on to reach Tier 1, Top 4 at the <G>Bali Major</G>, Top 6 at the{" "}
              <G>Esports World Cup</G>, and a qualification to <G>The International</G>.
            </p>
            <p>
              Since then, <G>Eixn</G> has helped <G>500+ players</G> climb out of their rank through{" "}
              <a href={site.links.eixnCoaching} target="_blank" rel="noopener noreferrer" data-umami-event="eixn-dota.com: Meet the coach" className="font-semibold text-text underline decoration-gold/50 underline-offset-2 transition hover:text-gold">
                1-on-1 coaching
              </a>
              .{" "}
              <G>6SLOT</G> is how he brings that same approach to more players at once: one topic a week, real games,
              live practice, and a community grinding the same way you are.
            </p>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-card border border-navy-border bg-navy-border sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center bg-navy-raised px-4 py-6 text-center">
              <span className="text-3xl font-black text-text">
                <StatValue value={s.value} />
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-widest text-text-muted">{s.label}</span>
              {s.note && <span className="mt-1.5 text-[11px] italic leading-snug text-text-muted">{s.note}</span>}
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
