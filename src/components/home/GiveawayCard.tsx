import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Placeholder giveaway prizes for layout purposes only — swap for the real
// monthly prize (name/rarity/art) before launch. Giveaways are a confirmed
// Member/Pro subscriber perk (SPEC.md §2 "Giveaways as a subscriber perk",
// §5.3 tier table). Rarity colors approximate Dota 2's own item-rarity tags.
const GIVEAWAY_ITEMS = [
  { name: "Arcana Bundle", rarity: "Arcana", color: "#E0524D" },
  { name: "Immortal Treasure", rarity: "Immortal", color: "#E4AE33" },
  { name: "Legendary Set", rarity: "Legendary", color: "#C147E9" },
] as const;

/**
 * Hero-side giveaway card — becomes a self-advancing carousel once there are
 * 2+ prizes, per the request to showcase multiple skins. A single prize just
 * renders statically with no dots/auto-advance.
 */
export function GiveawayCard() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = GIVEAWAY_ITEMS.length > 1;

  useEffect(() => {
    if (!hasMultiple || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % GIVEAWAY_ITEMS.length);
    }, 3800);
    return () => clearInterval(id);
  }, [hasMultiple, paused]);

  const item = GIVEAWAY_ITEMS[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-card border border-ink-border bg-ink/60 p-6 backdrop-blur-md"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-aegis/40 bg-aegis/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-aegis">
        <span className="h-1.5 w-1.5 rounded-full bg-aegis" />
        {t("home.giveaway.eyebrow")}
      </span>

      <p className="mt-3 text-lg font-bold text-paper">{t("home.giveaway.title")}</p>
      <p className="mt-1 text-sm text-paper-muted">{t("home.giveaway.subtitle")}</p>

      <div
        className="relative mt-5 h-40 overflow-hidden rounded-control border"
        style={{ borderColor: `${item.color}55` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: `radial-gradient(circle at 50% 30%, ${item.color}33, transparent 70%)` }}
          >
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke={item.color} strokeWidth="1.5">
              <path
                d="M20 7h-3.17A3 3 0 0 0 12 4a3 3 0 0 0-4.83 3H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z"
                strokeLinejoin="round"
              />
              <path d="M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M12 7v13" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-semibold text-paper">{item.name}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: item.color, backgroundColor: `${item.color}1f` }}
            >
              {item.rarity}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {hasMultiple && (
        <div
          className="mt-3 flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label={t("home.giveaway.title")}
        >
          {GIVEAWAY_ITEMS.map((giveawayItem, i) => (
            <button
              key={giveawayItem.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={giveawayItem.name}
              onClick={() => setIndex(i)}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === index ? "w-[18px] bg-crimson" : "w-1.5 bg-ink-border")
              }
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-border pt-4">
        <p className="text-xs text-paper-muted">{t("home.giveaway.membersNote")}</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
          <Link
            to={`/${lang}/pricing`}
            className="inline-block whitespace-nowrap rounded-control bg-crimson px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-crimson-light"
          >
            {t("home.giveaway.cta")}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
