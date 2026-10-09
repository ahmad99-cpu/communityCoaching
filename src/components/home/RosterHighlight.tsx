import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal } from "@/components/common/Reveal";

// Secondary coaches per SPEC.md §3.1 — see the note in CinematicHero.tsx;
// identities/rights for GH, Omar, and Ammar still need confirmation before
// any real marketing push.
const SECONDARY_COACHES = [
  { key: "gh", name: "GH" },
  { key: "omar", name: "Omar" },
  { key: "ammar", name: "Ammar" },
] as const;

export function RosterHighlight() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <section className="py-16">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-aegis">
          {t("home.roster.eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-paper sm:text-3xl">{t("home.roster.title")}</h2>
        <p className="mt-3 text-paper-muted">{t("home.roster.subtitle")}</p>
      </Reveal>

      {/* Eixn — main coach, featured card (SPEC.md §3.1, §8: Eixn-forward,
          roster-backed design, mirroring Dotaflix's Astini treatment). */}
      <Reveal delay={0.1}>
        <motion.div
          whileHover={{ y: -3 }}
          className="mt-8 flex flex-col gap-6 rounded-card border border-crimson/40 bg-ink-raised p-6 transition-colors hover:border-crimson/70 sm:flex-row sm:items-center"
        >
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink-border text-xl font-bold text-paper">
            E
          </span>
          <div className="flex-1">
            <span className="inline-block rounded-control bg-aegis/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-aegis">
              {t("home.roster.mainCoachBadge")}
            </span>
            <p className="mt-1.5 text-lg font-bold text-paper">Jad &quot;Eixn&quot; Hammoud</p>
            <p className="mt-1 text-sm text-paper-muted">{t("home.roster.eixnBio")}</p>
          </div>
          <Link
            to={`/${lang}/coaches`}
            className="shrink-0 rounded-control bg-crimson px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-crimson-light"
          >
            {t("home.roster.viewEixnProfile")}
          </Link>
        </motion.div>
      </Reveal>

      {/* Secondary coaches — supplementary group sessions (SPEC.md §3.2). */}
      <div className="mt-10">
        <Reveal delay={0.15}>
          <p className="text-sm font-semibold text-paper">{t("home.roster.secondaryLabel")}</p>
          <p className="mt-1 text-sm text-paper-muted">{t("home.roster.secondarySubtitle")}</p>
        </Reveal>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SECONDARY_COACHES.map((coach, i) => (
            <Reveal key={coach.key} delay={0.2 + i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-card border border-ink-border bg-ink-raised p-5 transition-colors hover:border-crimson/60"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-border text-base font-bold text-paper">
                  {coach.name.charAt(0)}
                </span>
                <p className="mt-4 text-base font-semibold text-paper">{coach.name}</p>
                <p className="mt-1 text-sm text-paper-muted">{t(`home.roster.roles.${coach.key}`)}</p>
                <Link
                  to={`/${lang}/coaches`}
                  className="mt-4 inline-block text-sm font-medium text-crimson hover:text-crimson-light"
                >
                  {t("home.roster.viewProfile")} →
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.1} className="mt-8">
        <Link
          to={`/${lang}/coaches`}
          className="text-sm font-semibold text-paper underline decoration-ink-border underline-offset-4 hover:decoration-crimson"
        >
          {t("home.roster.viewAll")}
        </Link>
      </Reveal>
    </section>
  );
}
