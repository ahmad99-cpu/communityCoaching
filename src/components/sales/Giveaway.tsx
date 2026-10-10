import { m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { useMemberCounts } from "@/lib/memberCounts";
import { useContent } from "@/lib/content";
import { PRIZE_CATEGORY_LABELS, type GiveawayContent, type GiveawayItem, type Prize } from "@/content/types";
import { prizeTitle } from "@/content/prize";
import { Icon } from "@/components/site/Icons";

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

/** Prize image area: the uploaded photo, or a large category icon when there's none. */
function PrizeImage({ prize }: { prize: Prize }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-navy-border bg-[radial-gradient(circle_at_50%_40%,rgba(232,181,74,0.16),transparent_65%)] bg-navy">
      {prize.imageUrl ? (
        <img src={prize.imageUrl} alt={prizeTitle(prize)} loading="lazy" className="h-full w-full object-contain p-4" />
      ) : (
        <Icon name={prize.category === "coaching" ? "mic" : "gift"} className="h-16 w-16 text-gold/70" />
      )}
    </div>
  );
}

function Pill({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${
        gold ? "border-gold/60 bg-gold/10 text-gold" : "border-navy-border bg-navy text-text-muted"
      }`}
    >
      {children}
    </span>
  );
}

/** One prize card (like a store/giveaway grid): image, status, title, value and progress to its member goal. */
function PrizeCard({ item, members }: { item: GiveawayItem; members: number }) {
  const { goal, prize, winner } = item;
  const count = Math.min(members, goal);
  const remaining = Math.max(0, goal - members);
  const pct = goal > 0 ? (count / goal) * 100 : 0;
  const unlocked = remaining === 0;

  return (
    <article
      className={`card flex h-full flex-col overflow-hidden ${winner ? "animate-winner-glow border-gold/70" : ""}`}
    >
      <PrizeImage prize={prize} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {winner ? (
            <Pill gold>
              <Icon name="trophy" className="h-3.5 w-3.5" /> Winner drawn
            </Pill>
          ) : unlocked ? (
            <Pill gold>Unlocked</Pill>
          ) : (
            <Pill gold>Unlocks at {goal} members</Pill>
          )}
          {prize.category !== "coaching" && prize.category !== "other" && <Pill>{PRIZE_CATEGORY_LABELS[prize.category]}</Pill>}
        </div>

        <h3 className="mt-3 text-lg font-extrabold leading-snug">{prizeTitle(prize)}</h3>
        {prize.value > 0 && <p className="mt-1 text-sm text-text-muted">${prize.value} value</p>}

        <div className="mt-auto pt-5">
          {winner ? (
            <p className="text-sm text-text">
              Won by <strong className="break-all text-gold">{winner.name}</strong>
            </p>
          ) : (
            <>
              <div className="flex items-end justify-between text-xs font-semibold text-text-muted">
                <span>Members</span>
                <span>
                  <strong className="text-gold">{count}</strong> / {goal}
                </span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy"
                role="progressbar"
                aria-label={`${prizeTitle(prize)}: members so far`}
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-valuenow={count}
              >
                <m.div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {unlocked
                  ? "Unlocked. The winner is announced in Discord."
                  : `${remaining} more member${remaining === 1 ? "" : "s"} and one member wins it.`}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/** The next prize: a mystery Aegis until it's revealed from the dashboard. */
function NextCard({ next }: { next: GiveawayContent["next"] }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden border-dashed">
      {next.revealed ? (
        <PrizeImage prize={next.prize} />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center border-b border-navy-border bg-navy">
          <AegisSilhouette />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <Pill>
            <Icon name="lock" className="h-3.5 w-3.5" /> Next unlock
          </Pill>
        </div>
        <h3 className="mt-3 text-lg font-extrabold leading-snug">{next.revealed ? prizeTitle(next.prize) : "Revealed soon"}</h3>
        <p className="mt-1 text-sm text-text-muted">
          {next.revealed ? `Unlocks at ${next.goal} members` : `Unlocks at ${next.goal} members. Stay tuned.`}
        </p>
      </div>
    </article>
  );
}

/** Columns and width by card count (prizes + the next-unlock card), so rows never end half empty. */
const GRID: Record<number, string> = {
  1: "max-w-sm sm:grid-cols-1",
  2: "max-w-3xl",
  3: "max-w-5xl lg:grid-cols-3",
  4: "max-w-6xl lg:grid-cols-4",
};

/**
 * Members-only giveaways, shown as a prize grid just before Pricing (a bonus on top of the
 * offer, Hormozi-style). Each prize unlocks at a member goal; the next one stays a mystery.
 */
export function Giveaway() {
  const { items, next } = useContent("giveaway");
  const { members } = useMemberCounts();

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Members-only giveaways</p>
          <h2 className="section-heading mt-3">Prizes that unlock as we grow</h2>
          <p className="mt-4 text-text-muted sm:text-lg">
            Every member is entered automatically. Each time 6SLOT hits a new member goal, a new prize unlocks: coaching,
            Dota 2 items and team merch.
          </p>
        </Reveal>

        <div className={`mx-auto mt-12 grid gap-4 sm:grid-cols-2 ${GRID[Math.min(items.length + 1, 4)]}`}>
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06} className="h-full">
              <PrizeCard item={item} members={members} />
            </Reveal>
          ))}
          <Reveal delay={items.length * 0.06} className="h-full">
            <NextCard next={next} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
