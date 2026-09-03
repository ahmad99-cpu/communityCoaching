import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, dirForLanguage, isSupportedLanguage } from "@/i18n";
import { Nav } from "./Nav";

/**
 * Root layout for every /:lang/* route.
 *
 * Per SPEC.md §4.1: RTL is a first-class layout mode, not a CSS mirror applied
 * late. This is where <html dir="rtl|ltr"> and <html lang> actually get set,
 * so every child component can rely on them (and on Tailwind's rtl: variants)
 * rather than each page re-deriving direction itself.
 */
export function Layout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

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
    <div className="min-h-screen bg-ink text-paper">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
