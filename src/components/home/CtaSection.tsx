import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal } from "@/components/common/Reveal";

export function CtaSection() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <Reveal className="my-8">
      <section className="relative overflow-hidden rounded-card border border-ink-border bg-gradient-to-r from-ink-raised to-ink px-6 py-10 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-crimson/10 via-transparent to-aegis/10" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-paper sm:text-3xl">{t("home.cta.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-paper-muted">{t("home.cta.subtitle")}</p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-block"
          >
            <Link
              to={`/${lang}/pricing`}
              className="inline-block rounded-control bg-crimson px-6 py-2.5 text-sm font-semibold text-paper shadow-lg shadow-crimson/20 transition-colors hover:bg-crimson-light"
            >
              {t("home.cta.button")}
            </Link>
          </motion.div>
        </div>
      </section>
    </Reveal>
  );
}
