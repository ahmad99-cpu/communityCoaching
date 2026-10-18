import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container, WideContainer } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { AegisEmblem } from "@/components/site/AegisEmblem";
import { Icon, type IconName } from "@/components/site/Icons";
import {
  BATTLE_PASS,
  COMING_SOON_LEVELS,
  HIGHEST_GOAL_REACHED,
  AEGIS_SPECS,
  type BattlePassLevel,
  type BattlePassReward,
} from "@/content/battlePass";
import { useMemberCounts } from "@/lib/memberCounts";
import { usePageTitle } from "@/lib/usePageTitle";

const fmt = (n: number) => n.toLocaleString("en-US");
const FINAL_GOAL = BATTLE_PASS[BATTLE_PASS.length - 1].goal;
/**
 * Live member count. In development, `?members=60` previews any point on the track.
 * Levels already reached (HIGHEST_GOAL_REACHED) stay unlocked even if the count dips.
 */
function useProgress() {
  const { members } = useMemberCounts();
  const [params] = useSearchParams();
  const preview = import.meta.env.DEV ? Number(params.get("members")) : NaN;
  const count = Number.isFinite(preview) && preview >= 0 ? preview : members;
  const reached = Math.max(count, HIGHEST_GOAL_REACHED);
  const nextIndex = BATTLE_PASS.findIndex((l) => reached < l.goal);
  return { count, reached, nextIndex, next: nextIndex === -1 ? null : BATTLE_PASS[nextIndex] };
}

export function BattlePass() {
  usePageTitle("Battle Pass");
  const { count, reached, nextIndex, next } = useProgress();
  const [aegisOpen, setAegisOpen] = useState(false);
  const [openReward, setOpenReward] = useState<{ reward: BattlePassReward; level: number } | null>(null);
  const openAegis = () => setAegisOpen(true);
  const showReward = (reward: BattlePassReward, level: number) =>
    reward.aegis ? openAegis() : setOpenReward({ reward, level });

  return (
    <>
      {/* Header: the pitch on the left, the Aegis (the final reward) on the right */}
      <section className="relative overflow-hidden pt-10 sm:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_70%_at_75%_40%,rgba(232,181,74,0.16),transparent_70%)]"
        />
        <WideContainer className="relative">
          <div className="mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
            <div className="text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">6SLOT Battle Pass · Season 1</p>
              <h1 className="section-heading mt-3 max-w-3xl">
                Every member levels up <span className="text-gold">the whole community.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-lg text-text-muted md:mx-0">
                Every new member fills the bar. Every level, everyone wins.
              </p>
              <XpBar count={count} nextIndex={nextIndex} next={next} />
              <div className="mt-5">
                <CtaButton className="w-full px-8 py-3.5 sm:w-auto" />
              </div>
            </div>

            {/* The Aegis, tap for its specs */}
            <button
              type="button"
              onClick={openAegis}
              aria-label="See the Aegis replica details"
              className="group relative mx-auto block w-[200px] text-center sm:w-[230px]"
            >
              <div aria-hidden className="absolute inset-[12%] rounded-full bg-gold/25 blur-3xl" />
              <AegisEmblem eager className="relative mx-auto aspect-square w-[170px] transition duration-500 group-hover:scale-[1.05] sm:w-[200px]" />
              <p className="relative mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
                Level {BATTLE_PASS.length} · Final reward
              </p>
              <p className="relative font-display text-lg font-bold text-text">The Aegis replica</p>
              <p className="relative inline-flex items-center gap-1 text-xs text-text-muted transition group-hover:text-gold">
                1:1 scale, 42 cm · Tap for details <Icon name="arrow" className="h-3 w-3" />
              </p>
            </button>
          </div>
        </WideContainer>
      </section>

      {/* The track */}
      <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
        <WideContainer>
          <ol className="relative mx-auto grid max-w-xl gap-4 lg:max-w-6xl lg:grid-cols-4 lg:gap-5">
            {/* Line through the level nodes (wide screens) */}
            <li
              aria-hidden
              className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-1 rounded-full bg-navy-border lg:block"
            >
              <div
                className="h-full origin-left rounded-full bg-gradient-to-r from-gold-dark to-gold shadow-[0_0_14px_rgba(232,181,74,0.6)] transition-transform duration-[1400ms] ease-out"
                style={{ transform: `scaleX(${trackFill(reached)})` }}
              />
            </li>
            {BATTLE_PASS.map((level, i) => (
              <LevelCard
                key={level.goal}
                level={level}
                index={i}
                count={count}
                reached={reached}
                isNext={i === nextIndex}
                onReward={(r) => showReward(r, i + 1)}
              />
            ))}
          </ol>
          <SeasonContinues />
        </WideContainer>
      </section>

      {aegisOpen && <AegisDetails onClose={() => setAegisOpen(false)} />}
      {openReward && (
        <RewardDetails reward={openReward.reward} level={openReward.level} onClose={() => setOpenReward(null)} />
      )}
      <HowItWorks />
      <Close />
    </>
  );
}

/** The member count, and how many more until the next level. */
function XpBar({
  count,
  nextIndex,
  next,
}: {
  count: number;
  nextIndex: number;
  next: BattlePassLevel | null;
}) {
  return (
    <div className="mx-auto mt-5 max-w-xl rounded-card border border-gold/30 bg-navy-raised/70 px-5 py-3.5 text-left md:mx-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {count > 0 ? (
          <p>
            <span className="text-3xl font-black text-text">{fmt(count)}</span>
            <span className="ml-1.5 text-xs font-bold uppercase tracking-widest text-text-muted">
              / {fmt(FINAL_GOAL)} members
            </span>
          </p>
        ) : (
          <p className="text-lg font-extrabold text-text">Season 1 starts with you.</p>
        )}
        <p className="text-sm text-text-muted">
          {next ? (
            <>
              <strong className="text-gold">{fmt(next.goal - count)} more</strong> to Level {nextIndex + 1}
            </>
          ) : (
            <strong className="text-gold">Every level unlocked</strong>
          )}
        </p>
      </div>
    </div>
  );
}

/** Share of the line filled: from the first node to the last, through each level. */
function trackFill(reached: number) {
  const n = BATTLE_PASS.length;
  if (reached < BATTLE_PASS[0].goal) return 0;
  let pos = 0;
  for (let i = 0; i < n - 1; i++) {
    const from = BATTLE_PASS[i].goal;
    const to = BATTLE_PASS[i + 1].goal;
    pos += Math.min(1, Math.max(0, (reached - from) / (to - from)));
  }
  return pos / (n - 1);
}

/** One level: a numbered node on the line, and a compact card under it. */
function LevelCard({
  level,
  index,
  count,
  reached,
  isNext,
  onReward,
}: {
  level: BattlePassLevel;
  index: number;
  count: number;
  reached: number;
  isNext: boolean;
  onReward: (reward: BattlePassReward) => void;
}) {
  const unlocked = reached >= level.goal;
  const isLast = index === BATTLE_PASS.length - 1;

  return (
    <li className="relative flex flex-col pl-14 lg:pl-0">
      {/* Phones: a vertical rail down to the next level */}
      {!isLast && <span aria-hidden className="absolute -bottom-4 left-[19px] top-10 w-0.5 bg-navy-border lg:hidden" />}

      {/* Level node */}
      <span
        className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black lg:relative lg:mx-auto ${
          unlocked
            ? "border-gold bg-gold text-navy shadow-[0_0_18px_rgba(232,181,74,0.55)]"
            : isNext
              ? "border-gold bg-navy text-gold"
              : "border-navy-border bg-navy text-text-muted"
        }`}
      >
        {isNext && (
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-gold" />
        )}
        {unlocked ? <Icon name="check" className="h-4 w-4" /> : index + 1}
      </span>

      <Reveal delay={index * 0.05} className="flex flex-1 flex-col lg:mt-4">
        <article
          className={`flex flex-1 flex-col rounded-card border p-4 ${
            isLast
              ? "border-gold/60 bg-[linear-gradient(180deg,rgba(232,181,74,0.12),rgba(232,181,74,0.02))] shadow-[0_0_40px_-14px_rgba(232,181,74,0.5)]"
              : unlocked || isNext
                ? "border-gold/50 bg-navy-raised"
                : "border-navy-border bg-navy-raised/60"
          }`}
        >
          {/* Goal + status */}
          <div className="flex items-center justify-between gap-2">
            <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em] text-text-muted">
              {fmt(level.goal)} members
            </p>
            <StatusPill unlocked={unlocked} isNext={isNext} />
          </div>

          <h3 className="mt-3 text-center text-lg font-extrabold leading-tight text-text">{level.title}</h3>

          {isNext && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-border">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((count - (index ? BATTLE_PASS[index - 1].goal : 0)) / (level.goal - (index ? BATTLE_PASS[index - 1].goal : 0))) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-center text-xs text-text-muted">
                <strong className="text-gold">{fmt(level.goal - count)}</strong> to go
              </p>
            </div>
          )}

          {/* Rewards: tap a tile for the details. Same tile size on every card, centered when there are only two */}
          <ul className="mt-auto flex justify-center gap-2 pt-4 lg:gap-1.5">
            {level.rewards.map((r) => (
              <li key={r.label} className="w-[calc((100%-1rem)/3)] lg:w-[calc((100%-0.75rem)/3)]">
                <RewardTile reward={r} unlocked={unlocked} onClick={() => onReward(r)} />
              </li>
            ))}
          </ul>
        </article>
      </Reveal>
    </li>
  );
}

/** After the Aegis: the levels still to come, as locked nodes, so the season clearly goes on. */
function SeasonContinues() {
  const levels = Array.from({ length: COMING_SOON_LEVELS }, (_, i) => BATTLE_PASS.length + i + 1);
  return (
    <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 rounded-card border border-dashed border-navy-border bg-navy-raised/40 px-6 py-5 text-center sm:flex-row sm:text-left lg:max-w-6xl">
      <div className="flex shrink-0 items-center gap-2">
        {levels.map((n) => (
          <span
            key={n}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-navy-border bg-navy text-sm font-black text-text-muted"
          >
            {n}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-text">The season doesn't stop at the Aegis.</p>
        <p className="mt-0.5 text-sm text-text-muted">Revealed live at {fmt(FINAL_GOAL)} members.</p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Coming soon
      </span>
    </div>
  );
}

function StatusPill({ unlocked, isNext }: { unlocked: boolean; isNext: boolean }) {
  if (unlocked)
    return (
      <span className="whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-navy">
        Unlocked
      </span>
    );
  if (isNext)
    return (
      <span className="whitespace-nowrap rounded-full border border-gold/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gold">
        Up next
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-text-muted">
      <Icon name="lock" className="h-3 w-3" />
      Locked
    </span>
  );
}

/* ---------------------------------------------------------------- How it works + close */

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "gift",
    title: "Entered automatically",
    body: "Every active member is in every draw.",
  },
  {
    icon: "tv",
    title: "Celebrated live",
    body: "Every unlock is a live draw in Discord.",
  },
  {
    icon: "unlock",
    title: "Levels stay unlocked",
    body: "The bar only moves forward.",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-navy-border py-14 sm:py-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-gold/40 bg-navy text-gold">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-text">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-text-muted">
          Full details in the{" "}
          <Link
            to="/policies/giveaway"
            className="-my-2.5 inline-block py-2.5 underline decoration-text-muted/60 underline-offset-2 hover:text-text"
          >
            Giveaway Rules
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}

function Close() {
  return (
    <section className="border-t border-navy-border py-16 text-center sm:py-20">
      <Container>
        <h2 className="section-heading">
          Every new member <span className="text-gold">moves the bar.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          Join, bring your stack, and unlock the next level together.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <CtaButton className="w-full px-10 py-4 text-base sm:w-auto" />
          <FounderSpotsLeft className="text-sm" />
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- Reward tiles */

/** A reward's picture: gold tag on top (who gets it), the icon, and ×N when several members win. */
function RewardArt({ reward, locked = false }: { reward: BattlePassReward; locked?: boolean }) {
  const prize = reward.kind === "prize";
  const lit = !locked && !prize; // an unlocked reward for everyone glows like a prize
  return (
    <span
      className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border ${
        prize
          ? "border-gold/70 bg-[radial-gradient(circle_at_50%_45%,rgba(232,181,74,0.32),rgba(232,181,74,0.05)_72%)] shadow-[0_0_26px_-10px_rgba(232,181,74,0.75)]"
          : lit
            ? "border-gold/70 bg-navy bg-[radial-gradient(circle_at_50%_45%,rgba(232,181,74,0.24),transparent_72%)] shadow-[0_0_22px_-8px_rgba(232,181,74,0.7)]"
            : "border-gold/25 bg-navy bg-[radial-gradient(circle_at_50%_45%,rgba(232,181,74,0.13),transparent_70%)]"
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 py-[3px] text-center text-[8px] font-black uppercase leading-none tracking-[0.12em] ${
          prize ? "bg-gold text-navy" : "bg-gold/15 text-gold"
        }`}
      >
        {prize ? "Prize" : "For all"}
      </span>
      {reward.aegis ? (
        <AegisEmblem className="mt-2 h-[66%] w-[66%]" />
      ) : reward.glyph ? (
        <span className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-none text-gold">
          {reward.glyph}
        </span>
      ) : reward.icon ? (
        <Icon name={reward.icon} className="mt-2 h-[38%] w-[38%] text-gold" />
      ) : null}
      {reward.winners && reward.winners > 1 && (
        <span className="absolute bottom-1 right-1 rounded-full border border-gold bg-navy px-1.5 text-[11px] font-black leading-[18px] text-gold">
          ×{reward.winners}
        </span>
      )}
      {locked && (
        <span className="absolute bottom-1 left-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-navy/90 text-text-muted">
          <Icon name="lock" className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}

/** A tappable reward: the picture plus a 2-4 word label. */
function RewardTile({
  reward,
  unlocked,
  onClick,
}: {
  reward: BattlePassReward;
  unlocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${reward.label}: see details`}
      className="group flex w-full flex-col items-center text-center"
    >
      <span className="block w-full transition duration-300 group-hover:-translate-y-1">
        <RewardArt reward={reward} locked={!unlocked} />
      </span>
      <span className="mt-1.5 text-[11px] font-bold leading-tight text-text transition group-hover:text-gold">
        {reward.label}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- Dialogs */

/** Modal shell: closes on Esc, the X, or a click outside; locks the page scroll while open. */
function Dialog({
  labelledBy,
  onClose,
  className,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full overflow-hidden rounded-card border border-gold/40 bg-navy-raised p-6 shadow-[0_0_80px_-20px_rgba(232,181,74,0.5)] sm:p-8 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-navy hover:text-text"
        >
          <span aria-hidden className="text-2xl leading-none">
            ×
          </span>
        </button>
        {children}
      </div>
    </div>
  );
}

/** Opens when a reward tile is tapped: the full sentence behind the short label. */
function RewardDetails({
  reward,
  level,
  onClose,
}: {
  reward: BattlePassReward;
  level: number;
  onClose: () => void;
}) {
  return (
    <Dialog labelledBy="reward-title" onClose={onClose} className="max-w-sm text-center">
      <div className="mx-auto w-32">
        <RewardArt reward={reward} />
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
        Level {level} · {fmt(BATTLE_PASS[level - 1].goal)} members
      </p>
      <h2 id="reward-title" className="mt-1.5 font-display text-2xl font-bold text-text">
        {reward.label}
      </h2>
      <p className="mt-3 leading-relaxed text-text-muted">{reward.detail}</p>
    </Dialog>
  );
}

/** Opens when someone taps the Aegis: the real replica's specs. */
function AegisDetails({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      labelledBy="aegis-title"
      onClose={onClose}
      className="grid max-w-3xl items-center gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="relative mx-auto w-full max-w-[260px]">
        <div aria-hidden className="absolute inset-[10%] rounded-full bg-gold/20 blur-3xl" />
        <AegisEmblem className="relative aspect-square w-full" />
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">
          Level {BATTLE_PASS.length} · {fmt(FINAL_GOAL)} members
        </p>
        <h2 id="aegis-title" className="mt-2 font-display text-3xl font-bold text-text">
          The Aegis replica
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          The trophy every Dota player dreams of lifting, at full size. When 6SLOT reaches {fmt(FINAL_GOAL)} members,
          one member takes it home, drawn live on stream.
        </p>
        <dl className="mt-5 divide-y divide-navy-border rounded-control border border-navy-border">
          {AEGIS_SPECS.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <dt className="text-text-muted">{s.label}</dt>
              <dd className="text-right font-semibold text-text">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Dialog>
  );
}
