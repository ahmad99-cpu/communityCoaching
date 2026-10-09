import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";

/** Blacked-out Aegis silhouette with a "?" until the next prize is revealed. */
function AegisSilhouette() {
  return (
    <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden>
      <path
        d="M60 6 C78 18 98 20 112 18 C112 62 102 104 60 134 C18 104 8 62 8 18 C22 20 42 18 60 6 Z"
        fill="#05090F"
        stroke="#24324A"
        strokeWidth="2"
      />
      <path d="M60 22 L60 118 M30 44 Q60 60 90 44" stroke="#111B28" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text x="60" y="88" textAnchor="middle" fontSize="54" fontWeight="900" fill="#8FA0B5" fontFamily="Montserrat, sans-serif">
        ?
      </text>
    </svg>
  );
}

export function Giveaway() {
  const { goal, prize, prizeValue, next } = site.giveaway;
  const { members } = useMemberCounts();
  const count = Math.min(members, goal);
  const remaining = Math.max(0, goal - members);
  const pct = (count / goal) * 100;

  return (
    <section className="py-8">
      <Container>
        <Reveal className="mx-auto grid max-w-4xl gap-4 md:grid-cols-[1.7fr_1fr]">
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              <span aria-hidden>🎁</span> Founders giveaway
            </p>
            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">
              {prize} <span className="font-semibold text-text-muted">(${prizeValue} value)</span>
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Unlocks at <strong className="text-text">{goal} members</strong>
            </p>

            <div className="mt-6">
              <div className="flex items-end justify-between text-sm">
                <span className="text-text-muted">Members</span>
                <span className="text-lg font-black text-gold">
                  {count} <span className="text-text-muted">/ {goal}</span>
                </span>
              </div>
              <div
                className="mt-2 h-3 overflow-hidden rounded-full bg-navy"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-valuenow={count}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-3 text-sm italic text-text-muted">
                {remaining > 0
                  ? `${remaining} more member${remaining === 1 ? "" : "s"} and one founder wins it.`
                  : "Unlocked! The winner will be announced in Discord."}
              </p>
            </div>
          </div>

          <div className="card flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Next giveaway <span aria-hidden>🔒</span>
            </p>
            {next ? (
              <>
                <p className="mt-4 text-lg font-extrabold">{next.prize}</p>
                <p className="mt-1 text-sm text-text-muted">Unlocks at {next.goal} members</p>
              </>
            ) : (
              <>
                <div className="mt-3">
                  <AegisSilhouette />
                </div>
                <p className="mt-2 text-sm italic text-text-muted">Revealed soon.</p>
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
