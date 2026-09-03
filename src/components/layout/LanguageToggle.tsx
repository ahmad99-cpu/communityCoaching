import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

/**
 * Persistent language toggle — per SPEC.md §7, this is a toggle a user can hit
 * on any page (not an IP-based redirect), and switching should preserve which
 * page they're on, just swap the /:lang/ segment.
 */
export function LanguageToggle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  function switchTo(next: SupportedLanguage) {
    if (next === lang) return;
    const rest = location.pathname.replace(/^\/[^/]+/, "");
    navigate(`/${next}${rest}${location.search}`);
  }

  return (
    <div
      className="flex items-center gap-1 rounded-control border border-ink-border p-1"
      role="group"
      aria-label={t("common.language")}
    >
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={code === lang}
          className={
            "rounded-[6px] px-2.5 py-1 text-sm font-medium uppercase transition-colors " +
            (code === lang
              ? "bg-radiant text-ink"
              : "text-paper-muted hover:text-paper")
          }
        >
          {code}
        </button>
      ))}
    </div>
  );
}
