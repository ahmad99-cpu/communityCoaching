import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { useMemberCounts } from "@/lib/memberCounts";
import { useContent } from "@/lib/content";
import { PRIZE_CATEGORY_LABELS, type GiveawayItem, type Prize } from "@/content/types";
import { prizeTitle } from "@/content/prize";

/** Blacked-out Aegis silhouette with a "?" until the next prize is revealed. */
function AegisSilhouette() {
  return (
    <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden>
      <path
        d="M60 6 C78 18 98 20 112 18 C112 62 102 104 60 134 C18 104 8 62 8 18 C22 20 42 18 60 6 Z"
        fill="#05090F"
        stroke="#24324A"
        strokeWidth="2"
      />
      <path d="M60 22 L60 118 M30 44 Q60 60 90 44" stroke="#111B28" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text x="60" y="88" textAnchor="middle" fontSize="54" fontWeight="900" fill="#8FA0B5" fontFamily="Montserrat, sans-serif">
        ?
      </text>
    </svg>
  );
}

function CategoryChip({ prize }: { prize: Prize }) {
  if (prize.category === "coaching" || prize.category === "other") return null;
  return (
    <span className="inline-block rounded-full border border-navy-border bg-navy px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-text-muted">
      {PRIZE_CATEGORY_LABELS[prize.category]}
    </span>
  );
}

/** One giveaway: prize, image and its own progress bar toward its member goal. */
function GiveawaySlide({ item, members, active }: { item: GiveawayItem; members: number; active: boolean }) {
  const { goal, prize } = item;
  const count = Math.min(members, goal);
  const remaining = Math.max(0, goal - members);
  const pct = goal > 0 ? (count / goal) * 100 : 0;

  const body = (
    <div>
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <CategoryChip prize={prize} />
          <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
            {prizeTitle(prize)}{" "}
            {prize.value > 0 && <span className="font-semibold text-text-muted">(${prize.value} value)</span>}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Unlocks at <strong className="text-text">{goal} members</strong>
          </p>
        </div>
        {prize.imageUrl && (
          <img
            src={prize.imageUrl}
            alt={prizeTitle(prize)}
            className="h-24 w-24 shrink-0 rounded-control border border-navy-border bg-navy object-contain p-1 sm:h-28 sm:w-28"
          />
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between text-sm">
          <span className="text-text-muted">Members</span>
          <span className="text-lg font-black text-gold">
            {count} <span className="text-text-muted">/ {goal}</span>
          </span>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-navy"
          role="progressbar"
          aria-label={`${prizeTitle(prize)} progress`}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={count}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
            initial={{ width: 0 }}
            // Fills when this slide is on screen, so every slide gets its fill animation.
            animate={{ width: active ? `${pct}%` : 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-3 text-sm italic text-text-muted">
          {item.winner
            ? "🎉 Winner drawn! Congratulations!"
            : remaining > 0
              ? `${remaining} more member${remaining === 1 ? "" : "s"} and one founder wins it.`
              : "Unlocked! The winner will be announced in Discord."}
        </p>
      </div>
    </div>
  );

  return item.winner ? <WinnerReveal winner={item.winner} prize={prize}>{body}</WinnerReveal> : body;
}

/**
 * Wraps a giveaway that has a published winner: hovering (or tapping on phones, or
 * keyboard focus) blurs the prize and reveals the winner's name on top of it.
 */
function WinnerReveal({
  winner,
  prize,
  children,
}: {
  winner: NonNullable<GiveawayItem["winner"]>;
  prize: Prize;
  children: React.ReactNode;
}) {
  const [tapped, setTapped] = useState(false);
  const drawn = new Date(winner.drawnAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const shown = tapped ? "!opacity-100 !scale-100" : "";

  return (
    <div
      className="group/winner relative cursor-pointer rounded-control outline-none focus-visible:ring-2 focus-visible:ring-gold"
      tabIndex={0}
      role="button"
      aria-pressed={tapped}
      aria-label={`Winner of ${prizeTitle(prize)}: ${winner.name}`}
      onClick={() => setTapped((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setTapped((v) => !v);
        }
      }}
    >
      <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gold">
        🏆 Winner drawn
        <span className="font-semibold normal-case tracking-normal text-gold/80">
          · <span className="[@media(hover:none)]:hidden">hover</span>
          <span className="hidden [@media(hover:none)]:inline">tap</span> to reveal
        </span>
      </p>

      <div
        className={`transition duration-500 group-hover/winner:opacity-25 group-hover/winner:blur-md group-focus-visible/winner:opacity-25 group-focus-visible/winner:blur-md ${
          tapped ? "opacity-25 blur-md" : ""
        }`}
      >
        {children}
      </div>

      <div
        className={`pointer-events-none absolute inset-0 flex scale-95 flex-col items-center justify-center px-4 text-center opacity-0 transition duration-500 group-hover/winner:scale-100 group-hover/winner:opacity-100 group-focus-visible/winner:scale-100 group-focus-visible/winner:opacity-100 ${shown}`}
        aria-hidden
      >
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">🏆 Winner 🏆</p>
        <p className="mt-2 break-all text-3xl font-black text-gold [text-shadow:0_0_24px_rgba(232,181,74,0.6)] sm:text-4xl">
          {winner.name}
        </p>
        <p className="mt-2 text-sm text-text">
          wins <strong>{prizeTitle(prize)}</strong>
        </p>
        <p className="mt-0.5 text-xs text-text-muted">Drawn {drawn}</p>
      </div>
    </div>
  );
}

const AUTOPLAY_MS = 6000;

/**
 * Current giveaways. One = a plain card; two or more = a carousel (arrows, dots,
 * swipe, auto-advance that pauses on hover/focus and is off for reduced motion).
 * All slides share one grid cell, so the card keeps the height of the tallest slide
 * and doesn't jump between slides.
 */
function GiveawayCarousel({ items }: { items: GiveawayItem[] }) {
  const { members } = useMemberCounts();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const draggedRef = useRef(false);
  const many = items.length > 1;
  const current = Math.min(index, items.length - 1);

  const go = useCallback(
    (to: number, dir: 1 | -1) => {
      setDirection(dir);
      setIndex((to + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (!many || paused || reduceMotion || !inView) return;
    const id = window.setTimeout(() => go(current + 1, 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [many, paused, reduceMotion, inView, current, go]);

  const shining = Boolean(items[current]?.winner);

  return (
    <div className={`relative h-full rounded-card ${shining ? "animate-winner-glow p-[2px]" : ""}`}>
      {shining && (
        // Rotating gold light that shows through the 2px gap as a moving border.
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-card" aria-hidden>
          <div className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2">
            <div className="h-full w-full animate-winner-border bg-[conic-gradient(from_0deg,#E8B54A,#7A5A1C_25%,#F2CB74_50%,#7A5A1C_75%,#E8B54A)]" />
          </div>
        </div>
      )}
    <motion.div
      className={`relative h-full overflow-hidden p-6 sm:p-8 ${shining ? "rounded-[12px] bg-navy-raised" : "card"}`}
      onViewportEnter={() => setInView(true)}
      onViewportLeave={() => setInView(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role={many ? "region" : undefined}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? "Founders giveaways" : undefined}
    >
      {shining && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
          <div className="absolute inset-y-0 left-0 w-1/3 animate-winner-shine bg-gradient-to-r from-transparent via-gold-light/20 to-transparent" />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
          <span aria-hidden>🎁</span> Founders giveaway{many ? "s" : ""}
        </p>
        {many && (
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs font-bold text-text-muted" aria-live="polite">
              {current + 1} / {items.length}
            </span>
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(current + dir, dir)}
                aria-label={dir === -1 ? "Previous giveaway" : "Next giveaway"}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-border text-text-muted transition hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                {dir === -1 ? "←" : "→"}
              </button>
            ))}
          </div>
        )}
      </div>

      <motion.div
        className="mt-4 grid"
        drag={many ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onClickCapture={(e) => {
          if (draggedRef.current) {
            e.stopPropagation();
            draggedRef.current = false;
          }
        }}
        onDragEnd={(_, info) => {
          window.setTimeout(() => (draggedRef.current = false), 0);
          if (info.offset.x < -50) go(current + 1, 1);
          else if (info.offset.x > 50) go(current - 1, -1);
        }}
        style={{ touchAction: "pan-y" }}
      >
        {items.map((item, i) => {
          const active = i === current;
          // Incoming slide enters from the side we're moving toward; outgoing leaves the other way.
          const offset = reduceMotion ? 0 : 40 * direction;
          return (
            <motion.div
              key={item.id}
              className="[grid-area:1/1]"
              aria-hidden={!active}
              aria-roledescription={many ? "slide" : undefined}
              initial={false}
              animate={{ opacity: active ? 1 : 0, x: active ? 0 : -offset }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: active ? "auto" : "none", visibility: active ? "visible" : "hidden" }}
            >
              <GiveawaySlide item={item} members={members} active={active && inView} />
            </motion.div>
          );
        })}
      </motion.div>

      {many && (
        <div className="mt-5 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(i, i > current ? 1 : -1)}
              aria-label={`Show giveaway ${i + 1}: ${prizeTitle(item.prize)}`}
              aria-current={i === current}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-gold" : "w-2 bg-navy-border hover:bg-text-muted"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
    </div>
  );
}

export function Giveaway() {
  const { items, next } = useContent("giveaway");

  return (
    <section className="py-8">
      <Container>
        <Reveal className="mx-auto grid max-w-4xl gap-4 md:grid-cols-[1.7fr_1fr]">
          <GiveawayCarousel items={items} />

          <div className="card flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Next giveaway <span aria-hidden>{next.revealed ? "🎁" : "🔒"}</span>
            </p>
            {next.revealed ? (
              <>
                {next.prize.imageUrl && (
                  <img
                    src={next.prize.imageUrl}
                    alt={prizeTitle(next.prize)}
                    className="mt-4 h-24 w-24 rounded-control border border-navy-border bg-navy object-contain p-1"
                  />
                )}
                <div className="mt-3">
                  <CategoryChip prize={next.prize} />
                </div>
                <p className="mt-2 text-lg font-extrabold">{prizeTitle(next.prize)}</p>
                <p className="mt-1 text-sm text-text-muted">Unlocks at {next.goal} members</p>
              </>
            ) : (
              <>
                <div className="mt-3">
                  <AegisSilhouette />
                </div>
                <p className="mt-2 text-sm italic text-text-muted">Revealed soon.</p>
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
