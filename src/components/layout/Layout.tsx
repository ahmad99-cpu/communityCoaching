import { useEffect } from "react";
import { Navigate, useLocation, useOutlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_LANGUAGE, dirForLanguage, isSupportedLanguage } from "@/i18n";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

/**
 * Root layout for every /:lang/* route.
 *
 * Per SPEC.md §4.1: RTL is a first-class layout mode, not a CSS mirror applied
 * late. This is where <html dir="rtl|ltr"> and <html lang> actually get set,
 * so every child component can rely on them (and on Tailwind's rtl: variants)
 * rather than each page re-deriving direction itself.
 *
 * <main> is intentionally unconstrained (no max-width/padding) so pages like
 * Home can render full-bleed sections (the cinematic video hero); everything
 * else opts into the constrained width via the Container component instead.
 */
export function Layout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();
  const outlet = useOutlet();

  const validLang = lang && isSupportedLanguage(lang) ? lang : null;

  useEffect(() => {
    if (!validLang) return;
    i18n.changeLanguage(validLang);
    document.documentElement.lang = validLang;
    document.documentElement.dir = dirForLanguage(validLang);
  }, [validLang, i18n]);

  if (!validLang) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink text-paper">
      <Nav />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
