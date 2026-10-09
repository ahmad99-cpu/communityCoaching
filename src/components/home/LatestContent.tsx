import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal } from "@/components/common/Reveal";

// Placeholder sample lessons for layout purposes — real data comes from the
// lesson library once it exists (SPEC.md §7 "Learn").
const LESSONS = ["lesson1", "lesson2", "lesson3"] as const;

export function LatestContent() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <section className="py-16">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wide text-aegis">
            {t("home.content.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-paper sm:text-3xl">{t("home.content.title")}</h2>
          <p className="mt-3 text-paper-muted">{t("home.content.subtitle")}</p>
        </div>
        <Link
          to={`/${lang}/learn`}
          className="text-sm font-semibold text-paper underline decoration-ink-border underline-offset-4 hover:decoration-crimson"
        >
          {t("home.content.viewAll")} →
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lessonKey, i) => (
          <Reveal key={lessonKey} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className="h-full rounded-card border border-ink-border bg-ink-raised p-5 transition-colors hover:border-crimson/50"
            >
              <div className="group flex aspect-video items-center justify-center rounded-control bg-ink text-paper-muted">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-crimson transition-transform group-hover:scale-110"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-paper-muted">
                {t(`home.content.lessons.${lessonKey}.tag`)}
              </p>
              <p className="mt-1 text-base font-semibold text-paper">
                {t(`home.content.lessons.${lessonKey}.title`)}
              </p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
