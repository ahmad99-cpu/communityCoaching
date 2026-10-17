import { m } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Container, WideContainer } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { CtaButton } from "@/components/site/CtaButton";
import { FounderSpotsLeft } from "@/components/site/FounderSpotsLeft";
import { AegisEmblem } from "@/components/site/AegisEmblem";
import { Icon } from "@/components/site/Icons";
import { BATTLE_PASS, HIGHEST_GOAL_REACHED, type BattlePassLevel } from "@/content/battlePass";
import { useMemberCounts } from "@/lib/memberCounts";
import aegis from "@/assets/aegis-replica.webp";

const fmt = (n: number) => n.toLocaleString("en-US");
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Live member count. In development, `?members=120` previews any point on the track.
 * Levels already reached (HIGHEST_GOAL_REACHED) stay unlocked even if the count dips.
 */
function useProgress() {
  const { members } = useMemberCounts();
  const [params] = useSearchParams();
  const preview = import.meta.env.DEV ? Number(params.get("members")) : NaN;
  const count = Number.isFinite(preview) && preview >= 0 ? preview : members;
  const reached = Math.max(count, HIGHEST_GOAL_REACHED);
  const nextIndex = BATTLE_PASS.findIndex((l) => reached < l.goal);
  return {
    count,
    reached,
    nextIndex,
    next: nextIndex === -1 ? null : BATTLE_PASS[nextIndex],
  };
}

/** How far (0 to 1) the bar is from level i to level i + 1. */
function segmentFill(i: number, reached: number) {
  const from = BATTLE_PASS[i].goal;
  const to = BATTLE_PASS[i + 1]?.goal ?? from;
  if (to === from) return 0;
  return Math.min(1, Math.max(0, (reached - from) / (to - from)));
}

/** Share of the whole horizontal track that is filled (nodes sit at the centre of 6 columns). */
function trackFill(reached: number) {
  const n = BATTLE_PASS.length;
  const first = BATTLE_PASS[0].goal;
  if (reached < first) return 0;
  let pos = 0;
  for (let i = 0; i < n - 1; i++) pos += segmentFill(i, reached);
  return pos / (n - 1);
}

export function BattlePass() {
  const { count, reached, nextIndex, next } = useProgress();
  const toNext = next ? next.goal - count : 0;

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden pt-16 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(232,181,74,0.14),transparent_70%)]"
        />
        <Container className="relative text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">6SLOT Battle Pass</p>
          <h1 className="section-heading mx-auto mt-3 max-w-3xl">
            Every member levels up <span className="text-gold">the whole community.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-text-muted sm:text-lg">
            Each time 6SLOT hits a member milestone, a new level unlocks: a reward for every member, prizes drawn for
            the winners, and free tools for every Dota player. The final level is a real Aegis replica.
          </p>

          <div className="mx-auto mt-8 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-card border border-gold/30 bg-navy-raised/70 px-6 py-4">
            <p className="text-left">
              <span className="block text-3xl font-black text-text">{fmt(count)}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Members</span>
            </p>
            <span aria-hidden className="hidden h-10 w-px bg-navy-border sm:block" />
            <p className="text-left text-sm text-text-muted">
              {next ? (
                <>
                  <strong className="text-gold">{fmt(toNext)} more</strong> to unlock
                  <br />
                  <strong className="text-text">
                    Level {nextIndex + 1}: {next.title}
                  </strong>
                </>
              ) : (
                <strong className="text-gold">Every level unlocked</strong>
              )}
            </p>
          </div>
        </Container>
      </section>

      {/* The track */}
      <section className="py-14 sm:py-16">
        <WideContainer>
          <ol className="relative mx-auto grid max-w-2xl gap-5 xl:max-w-none xl:grid-cols-6 xl:gap-4">
            {/* Horizontal bar behind the level nodes (wide screens) */}
            <div
              aria-hidden
              className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-5 hidden h-1 rounded-full bg-navy-border xl:block"
            >
              <m.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-gold/70 to-gold shadow-[0_0_14px_rgba(232,181,74,0.6)]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: trackFill(reached) }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
              />
            </div>
            {BATTLE_PASS.map((level, i) => (
              <LevelCard
                key={level.goal}
                level={level}
                index={i}
                count={count}
                reached={reached}
                isNext={i === nextIndex}
              />
            ))}
          </ol>
        </WideContainer>
      </section>

      <GrandPrize count={count} />

      {/* How it works */}
      <section className="border-t border-navy-border py-16 sm:py-20">
        <Container>
          <Reveal className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">How it works</p>
            <h2 className="section-heading mt-3">No codes. No forms. Just be a member.</h2>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              {
                icon: "gift" as const,
                title: "Entered automatically",
                body: "Every active member is entered into a level's draw the moment it unlocks.",
              },
              {
                icon: "tv" as const,
                title: "Drawn live",
                body: "Winners are drawn live on stream and announced in the members' Discord.",
              },
              {
                icon: "unlock" as const,
                title: "Levels stay unlocked",
                body: "Once a level unlocks, it's unlocked for good. The bar only moves forward.",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-control border border-gold/40 bg-navy text-gold">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-extrabold text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{s.body}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-text-muted">
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

      {/* Close */}
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
    </>
  );
}

function LevelCard({
  level,
  index,
  count,
  reached,
  isNext,
}: {
  level: BattlePassLevel;
  index: number;
  count: number;
  reached: number;
  isNext: boolean;
}) {
  const unlocked = reached >= level.goal;
  const isLast = index === BATTLE_PASS.length - 1;
  const fill = segmentFill(index, reached);

  return (
    <li className="relative pl-14 xl:pl-0">
      {/* Vertical rail to the next level (narrow screens) */}
      {!isLast && (
        <span aria-hidden className="absolute -bottom-5 left-[19px] top-10 w-0.5 bg-navy-border xl:hidden">
          <m.span
            className="block h-full origin-top bg-gold"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: fill }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </span>
      )}

      {/* Level node */}
      <span
        className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black xl:relative xl:mx-auto ${
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

      <Reveal delay={index * 0.05} className="h-full xl:mt-5">
        <div
          className={`flex h-full flex-col rounded-card border p-5 transition ${
            isLast
              ? "border-gold/60 bg-[linear-gradient(180deg,rgba(232,181,74,0.14),rgba(232,181,74,0.03))] shadow-[0_0_40px_-12px_rgba(232,181,74,0.5)]"
              : unlocked
                ? "border-gold/60 bg-navy-raised"
                : isNext
                  ? "border-gold/40 bg-navy-raised"
                  : "border-navy-border bg-navy-raised/50"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
              Level {index + 1}
            </p>
            <StatusPill unlocked={unlocked} isNext={isNext} toGo={level.goal - count} />
          </div>

          <p
            className={`mt-3 text-3xl font-black leading-none ${unlocked || isNext || isLast ? "text-text" : "text-text/70"}`}
          >
            {fmt(level.goal)}
            <span className="ml-1.5 text-xs font-bold uppercase tracking-widest text-text-muted">members</span>
          </p>
          <h3 className="mt-2 flex items-center gap-2 font-extrabold text-gold">
            <Icon name={level.icon} className="h-4 w-4" />
            {level.title}
          </h3>

          {isLast && <AegisEmblem className="mx-auto mt-5 h-28 w-28" />}

          {level.mystery && (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-control border border-dashed border-gold/40 bg-navy/60 px-3 py-6 text-center">
              <span className="font-display text-4xl font-bold text-gold">?</span>
              <p className="mt-2 text-sm font-bold text-text">Rewards revealed soon</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Something big for everyone, and prizes for the winners.
              </p>
            </div>
          )}
          {(level.everyone || level.tool) && (
            <div className="mt-4 border-t border-navy-border pt-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold/80">Everyone gets</p>
              {level.award && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold text-gold">
                  <Icon name="trophy" className="h-3.5 w-3.5" />
                  {level.award}
                </p>
              )}
              {level.everyone && <p className="mt-1.5 text-sm leading-relaxed text-text">{level.everyone}</p>}
              {/* The level's free tool: one quiet line, the description on hover. */}
              {level.tool && (
                <p title={level.tool.body} className="mt-2 flex items-center gap-1.5 text-sm text-text-muted">
                  <Icon name="unlock" className="h-3.5 w-3.5 text-gold" />
                  <span>
                    <strong className="font-bold text-text">{level.tool.name}</strong>{" "}
                    <span className="whitespace-nowrap">free tool</span>
                  </span>
                </p>
              )}
            </div>
          )}
          {level.winners.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold/80">Drawn winners</p>
              <ul className="mt-1.5 space-y-1.5 text-sm text-text-muted">
                {level.winners.map((w) => (
                  <li key={w} className="flex gap-2">
                    <Icon name="gift" className="mt-0.5 h-3.5 w-3.5 text-gold/70" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Reveal>
    </li>
  );
}

function StatusPill({ unlocked, isNext, toGo }: { unlocked: boolean; isNext: boolean; toGo: number }) {
  if (unlocked)
    return (
      <span className="whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-navy">
        Unlocked
      </span>
    );
  if (isNext)
    return (
      <span className="whitespace-nowrap rounded-full border border-gold/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-gold">
        {fmt(toGo)} to go
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
      <Icon name="lock" className="h-3 w-3" />
      Locked
    </span>
  );
}

/** The final level gets its own spotlight: the real Aegis replica, with a moving light sweep. */
function GrandPrize({ count }: { count: number }) {
  const goal = BATTLE_PASS[BATTLE_PASS.length - 1].goal;
  const pct = Math.min(100, (count / goal) * 100);

  return (
    <section className="relative overflow-hidden border-t border-navy-border py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_30%_50%,rgba(232,181,74,0.16),transparent_70%)]"
      />
      <Container className="relative grid items-center gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14">
        <Reveal className="relative mx-auto w-full max-w-[340px]">
          <div aria-hidden className="absolute -inset-6 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-card border border-gold/50 animate-winner-glow">
            <img
              src={aegis}
              alt="The Aegis replica, the final Battle Pass prize"
              width={360}
              height={436}
              loading="lazy"
              className="block h-auto w-full"
            />
            <span
              aria-hidden
              className="animate-winner-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="text-center md:text-left">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Level 6 · {fmt(goal)} members</p>
          <h2 className="section-heading mt-3">
            The <span className="text-gold">Aegis.</span>
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-text-muted md:mx-0 mx-auto">
            The trophy every Dota player dreams of lifting. When 6SLOT reaches {fmt(goal)} members, one member takes
            this Aegis replica home, drawn live on stream.
          </p>

          <div className="mx-auto mt-8 max-w-md md:mx-0">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-text">Road to the Aegis</span>
              <span className="text-text-muted">
                <strong className="text-gold">{fmt(count)}</strong> / {fmt(goal)}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-navy-border">
              <m.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-gold/70 to-gold"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: pct / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
