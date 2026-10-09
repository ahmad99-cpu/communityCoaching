import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-ink-border bg-ink/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <NavLink to={`/${lang}`} end className="text-lg font-bold text-paper transition-colors hover:text-crimson">
          {t("brand.name")}
        </NavLink>

        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const to = item.to === "" ? `/${lang}` : `/${lang}/${item.to}`;
            const isActive = item.to === "" ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <NavLink
                key={item.key}
                to={to}
                end={item.to === ""}
                className={
                  "relative rounded-control px-3 py-1.5 text-sm font-medium transition-colors " +
                  (isActive ? "text-paper" : "text-paper-muted hover:bg-ink-raised hover:text-paper")
                }
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-0 rounded-control bg-ink-raised"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t(`nav.${item.key}`)}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline-bar"
                    className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-crimson"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        <LanguageToggle />
      </div>
    </motion.header>
  );
}
