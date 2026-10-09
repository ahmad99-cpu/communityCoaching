import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

// Illustrative placeholder figures for layout purposes only — replace with real,
// tracked numbers before launch (SPEC.md §2 social proof stats bar).
const STATS = [
  { key: "membersLabel", target: 1200, suffix: "+" },
  { key: "lessonsLabel", target: 80, suffix: "+" },
  { key: "hoursLabel", target: 300, suffix: "+" },
  { key: "matchesLabel", target: 5000, suffix: "+" },
] as const;

export function StatsBar() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      ref={ref}
      className="grid grid-cols-2 gap-4 border-b border-ink-border py-8 sm:grid-cols-4"
    >
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <StatValue target={stat.target} suffix={stat.suffix} start={inView} />
          <p className="mt-1 text-xs text-paper-muted sm:text-sm">{t(`home.stats.${stat.key}`)}</p>
        </motion.div>
      ))}
    </section>
  );
}

function StatValue({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const value = useCountUp(target, start);
  return (
    <p className="text-2xl font-extrabold tabular-nums text-paper sm:text-3xl">
      {value.toLocaleString()}
      <span className="text-aegis">{suffix}</span>
    </p>
  );
}
