import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Reveal } from "@/components/common/Reveal";

const PLATFORM_LINKS = ["coaches", "learn", "pricing"] as const;
const COMMUNITY_LINKS = ["community", "league", "matches"] as const;

export function Footer() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <footer className="border-t border-ink-border">
      <Reveal className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-paper">{t("brand.name")}</p>
            <p className="mt-2 max-w-xs text-sm text-paper-muted">{t("home.footer.tagline")}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper-muted">
              {t("home.footer.platform")}
            </p>
            <ul className="mt-3 space-y-2">
              {PLATFORM_LINKS.map((key) => (
                <li key={key}>
                  <Link to={`/${lang}/${key}`} className="text-sm text-paper-muted transition-colors hover:text-crimson">
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-paper-muted">
              {t("home.footer.community")}
            </p>
            <ul className="mt-3 space-y-2">
              {COMMUNITY_LINKS.map((key) => (
                <li key={key}>
                  <Link to={`/${lang}/${key}`} className="text-sm text-paper-muted transition-colors hover:text-crimson">
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-border pt-6 text-xs text-paper-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("home.footer.workingTitle")}</p>
          <p>
            © {new Date().getFullYear()} {t("brand.name")} — {t("home.footer.rights")}
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
