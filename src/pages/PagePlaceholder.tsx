import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

/**
 * Every route is this placeholder for now — real content comes page by page.
 * See SPEC.md §7 for what each page is meant to contain, and §9 (Roadmap) for
 * what's actually in scope for launch vs. later.
 */
export function PagePlaceholder({ pageKey }: { pageKey: string }) {
  const { t } = useTranslation();

  return (
    <Container className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        <span className="inline-block rounded-control border border-ink-border px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-paper-muted">
          {t("common.comingSoon")}
        </span>
        <h1 className="mt-4 text-3xl font-bold text-paper">
          {t(`pages.${pageKey}.title`)}
        </h1>
        <p className="mt-3 text-paper-muted">{t(`pages.${pageKey}.description`)}</p>
      </motion.div>
    </Container>
  );
}
