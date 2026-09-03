import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";

// Nav items per SPEC.md §7 (Site structure). Keep this list and the routes in
// App.tsx in sync — adding a page means adding it in both places.
const NAV_ITEMS = [
  { to: "", key: "home" },
  { to: "coaches", key: "coaches" },
  { to: "learn", key: "learn" },
  { to: "matches", key: "matches" },
  { to: "scene", key: "scene" },
  { to: "league", key: "league" },
  { to: "community", key: "community" },
  { to: "coaching", key: "coaching" },
  { to: "pricing", key: "pricing" },
  { to: "wrapped", key: "wrapped" },
] as const;

export function Nav() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <header className="border-b border-ink-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <NavLink to={`/${lang}`} end className="text-lg font-bold text-paper">
          {t("brand.name")}
        </NavLink>

        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to === "" ? `/${lang}` : `/${lang}/${item.to}`}
              end={item.to === ""}
              className={({ isActive }) =>
                "rounded-control px-3 py-1.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-ink-raised text-radiant"
                  : "text-paper-muted hover:bg-ink-raised hover:text-paper")
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <LanguageToggle />
      </div>
    </header>
  );
}
