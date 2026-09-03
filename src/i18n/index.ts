import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

// Every supported language, in one place — add here first when a new language
// is ever added, everything else (routing, nav, <html dir>) reads from this.
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(["ar"]);

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function dirForLanguage(lang: SupportedLanguage): "rtl" | "ltr" {
  return RTL_LANGUAGES.has(lang) ? "rtl" : "ltr";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
