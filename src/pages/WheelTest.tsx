import { usePageTitle } from "@/lib/usePageTitle";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { Icon, type IconName } from "@/components/site/Icons";
import { LeadCapture } from "@/components/tools/LeadCapture";
import { AnswerPicker } from "@/components/tools/AnswerPicker";
import { ANSWER_SCORES, WHEEL_ANSWERS } from "@/components/tools/wheelAnswers";
import { RadarChart } from "@/components/tools/RadarChart";
import { RollingCar } from "@/components/tools/RollingCar";
import { isBrokenDown } from "@/components/tools/carGeometry";
import { Celebrate } from "@/components/tools/Celebrate";
import { ShareWheel } from "@/components/tools/ShareWheel";
import { SLOT_INSIGHTS } from "@/components/tools/slotInsights";
import { formatSessionLocal, useNextSession } from "@/lib/sessionTime";
import {
  flattenStatements,
  fmt,
  loadWheelHistory,
  saveWheelHistory,
  scoreWheel,
  type WheelHistoryEntry,
  type WheelResult,
} from "@/components/tools/wheelData";
import { useContent } from "@/lib/content";
import { saveLead } from "@/lib/leads";
import { decodeWheel, encodeWheel, loadLastWheel, saveLastWheel, wheelPath, type LastWheel } from "@/components/tools/wheelLink";

type Step = "intro" | "questions" | "lead" | "result";

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25 },
};

/**
 * Opening line for each slot, in a coach's voice (like the prompts in Tony Robbins' Growth Plan),
 * by slot position. The second question of a slot says "One more on …" instead.
 */
const SLOT_PROMPTS = [
  "Let's start before the horn: your role and your draft.",
  "Now the first ten minutes, where every game starts.",
  "Next: your farm and your items.",
  "Where you are on the map, and why you're there.",
  "The fight breaks out. What do you do?",
  "Last one, and the honest one: what's going on in your head.",
];

/** Example wheel on the intro: a player with a weak Laning slot. */
const EXAMPLE_SLOTS = [7, 3.5, 6, 8, 5.5, 6.5];

/**
 * Dev only: /how-built-are-you?preview jumps straight to a sample result, so the result page
 * can be reviewed without answering 12 questions. Stripped from production builds.
 */
const PREVIEW = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
// ?preview=0,3,0,3,... loads those 12 answers instead of the sample.
const PREVIEW_PARAM = PREVIEW ? new URLSearchParams(window.location.search).get("preview") ?? "" : "";
const PREVIEW_ANSWERS = /^(\d+,){11}\d+$/.test(PREVIEW_PARAM)
  ? PREVIEW_PARAM.split(",").map(Number)
  : [6, 5, 7, 5, 3, 3, 9, 8, 6, 5, 7, 7];

/**
 * "How built are you?" — modelled on Tony Robbins' Business Mastery Growth Plan:
 * see what you'll walk away with → answer one question at a time → "whose build is this?" →
 * a celebration and a personal Player Brief you can share.
 */
export function WheelTest() {
  usePageTitle("How Built Are You?");
  const { slots: wheelSlots } = useContent("wheel_test");
  const statements = useMemo(() => flattenStatements(wheelSlots), [wheelSlots]);
  // A personal result link (?w=…&n=…) opens straight on that result, on any device.
  const [linked] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const answers = decodeWheel(params.get("w"));
    return answers ? { answers, name: params.get("n") ?? "" } : null;
  });
  const [step, setStep] = useState<Step>(PREVIEW || linked ? "result" : "intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(linked?.answers ?? (PREVIEW ? PREVIEW_ANSWERS : []));
  const [previous, setPrevious] = useState<WheelHistoryEntry | null>(null);
  const [playerName, setPlayerName] = useState(linked?.name ?? (PREVIEW ? "EixnFan" : ""));
  const [last] = useState<LastWheel | null>(() => (linked ? null : loadLastWheel()));

  const result = useMemo(
    () => (answers.length === statements.length ? scoreWheel(answers) : null),
    [answers, statements.length],
  );
  const slotNames = useMemo(() => wheelSlots.map((s) => s.name), [wheelSlots]);

  function pick(score: number) {
    const next = [...answers];
    next[index] = score;
    setAnswers(next);
    // Short pause so the selection is visible before moving on.
    window.setTimeout(() => {
      if (index < statements.length - 1) setIndex(index + 1);
      else setStep("lead");
    }, 220);
  }

  async function submitLead(discord: string) {
    if (!result) return;
    setPlayerName(discord.trim());
    const history = loadWheelHistory();
    setPrevious(history.length ? history[history.length - 1] : null);
    saveWheelHistory(result.slots);
    const code = encodeWheel(answers);
    saveLastWheel(code, discord.trim());
    // The address bar becomes their personal link: refresh, bookmark or share it to come back.
    window.history.replaceState(null, "", wheelPath(code, discord.trim()));
    await saveLead("wheel_test", discord, {
      slots: Object.fromEntries(wheelSlots.map((s, i) => [s.name, result.slots[i]])),
      total: result.total,
      weakest: result.weakestIndex >= 0 ? wheelSlots[result.weakestIndex].name : "none (even wheel)",
    });
    setStep("result");
    window.scrollTo(0, 0);
  }

  function restart() {
    window.history.replaceState(null, "", "/how-built-are-you");
    setAnswers([]);
    setIndex(0);
    setStep("questions");
    window.scrollTo(0, 0);
  }

  /** "Welcome back": open the last wheel taken on this device, without retaking the test. */
  function reopen(lastWheel: LastWheel) {
    const saved = decodeWheel(lastWheel.code);
    if (!saved) return;
    setAnswers(saved);
    setPlayerName(lastWheel.name);
    setStep("result");
    window.history.replaceState(null, "", wheelPath(lastWheel.code, lastWheel.name));
    window.scrollTo(0, 0);
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-6xl">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <m.div key="intro" {...slide}>
              <Intro slotNames={slotNames} onStart={() => setStep("questions")} last={last} onReopen={reopen} />
            </m.div>
          )}

          {step === "questions" && (
            <m.div key={`q-${index}`} {...slide} className="mx-auto max-w-2xl">
              <SlotTracker slotNames={slotNames} index={index} total={statements.length} />

              <div className="card mt-8 p-6 sm:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                  Slot {statements[index].slotIndex + 1} · {statements[index].slotName}
                </p>
                <p className="mt-3 text-sm italic text-text-muted">
                  {index > 0 && statements[index - 1].slotIndex === statements[index].slotIndex
                    ? `One more on ${statements[index].slotName.toLowerCase()}.`
                    : SLOT_PROMPTS[statements[index].slotIndex]}
                </p>
                <h2 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">&ldquo;{statements[index].text}&rdquo;</h2>
                <p className="mt-8 text-sm text-text-muted">Which sounds most like you? Pick the closest fit.</p>
                <div className="mt-4">
                  <AnswerPicker
                    answers={
                      WHEEL_ANSWERS[statements[index].slotIndex][
                        index - statements.findIndex((st) => st.slotIndex === statements[index].slotIndex)
                      ]
                    }
                    scores={ANSWER_SCORES}
                    value={answers[index]}
                    onPick={pick}
                  />
                </div>
              </div>

              {index > 0 && (
                <button className="mt-5 text-sm font-semibold text-text-muted hover:text-text" onClick={() => setIndex(index - 1)}>
                  ← Back
                </button>
              )}

              <p className="mt-5 text-center text-xs text-text-muted">
                No wrong answers. The more honest you are, the more useful your wheel.
              </p>
            </m.div>
          )}

          {step === "lead" && (
            <m.div key="lead" {...slide}>
              <LeadCapture
                onSubmit={submitLead}
                eyebrow="Your wheel is ready"
                title="Whose build is this?"
                body="Your Discord username goes on your build card. Eixn may also message you with a tip for your biggest gap."
                button="Reveal my build"
              />
            </m.div>
          )}

          {step === "result" && result && (
            <m.div key="result" {...slide} className="relative">
              <WheelResultView
                name={playerName}
                slotNames={slotNames}
                slotResources={wheelSlots.map((s) => s.resources ?? [])}
                result={result}
                previous={previous}
                link={wheelPath(encodeWheel(answers), playerName)}
                onRestart={restart}
              />
            </m.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}

/** Small gold all-caps label used to title every block, so the page reads as one system. */
function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-black uppercase tracking-[0.2em] text-gold ${className}`}>{children}</p>;
}

const WALK_AWAY: [IconName, string, string][] = [
  ["hexagon", "Your starting wheel", "All six slots of your game, scored."],
  ["crosshair", "Your siege cart", "It rolls on your wheel. Flat spots and the wave leaves you behind."],
  ["clipboard", "Your Player Brief", "What carries your games, and the gap holding your MMR back."],
  ["play", "A card to share", "Post your build in Discord, as an image or a moving GIF."],
];

/** Intro: the reward first (what you walk away with), with a live example cart beside it. */
function Intro({
  slotNames,
  onStart,
  last,
  onReopen,
}: {
  slotNames: string[];
  onStart: () => void;
  last: LastWheel | null;
  onReopen: (last: LastWheel) => void;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
      <div className="text-center lg:text-left">
        <Eyebrow>Free · 2 minutes · 12 questions</Eyebrow>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">How built are you?</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-muted lg:mx-0">
          Rate 12 honest statements about your game and get your starting wheel: which slot carries you, and which
          one keeps your MMR stuck.
        </p>

        <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2 lg:mx-0">
          {WALK_AWAY.map(([icon, title, body]) => (
            <li key={title} className="flex gap-3 rounded-control border border-navy-border bg-navy-raised/60 p-4">
              <Icon name={icon} className="mt-0.5 h-5 w-5 text-gold" />
              <span>
                <span className="block text-sm font-bold text-text">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        {last ? (
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <button className="btn-gold w-full px-10 py-4 text-base sm:w-auto" onClick={() => onReopen(last)}>
              See my last wheel
            </button>
            <button className="btn-ghost w-full px-8 py-4 text-base sm:w-auto" onClick={onStart}>
              Retake the test
            </button>
          </div>
        ) : (
          <button className="btn-gold mt-9 w-full px-12 py-4 text-base sm:w-auto" onClick={onStart}>
            Build my wheel
          </button>
        )}
        {last && (
          <p className="mt-3 text-sm text-text-muted">
            Welcome back{last.name ? `, ${last.name}` : ""}. Your last wheel is from{" "}
            {new Date(last.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}. Retake it once a
            month to see how your slots grow.
          </p>
        )}
      </div>

      <div className="card p-5 sm:p-8">
        <Eyebrow className="text-center">Example build</Eyebrow>
        <div className="mt-2">
          <RollingCar slots={EXAMPLE_SLOTS} />
        </div>
        <p className="mt-2 text-center text-sm text-text-muted">This player&apos;s Laning is flat: the cart bumps and the wave runs away from it.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slotNames.map((name, i) => (
            <span key={name} className="rounded-full border border-navy-border bg-navy px-3 py-1 text-xs font-semibold text-text">
              <span className="font-black text-gold">{i + 1}</span> {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Six segments (one per slot, two questions each) that fill in gold as you go. */
function SlotTracker({ slotNames, index, total }: { slotNames: string[]; index: number; total: number }) {
  const perSlot = total / slotNames.length;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
        <span>Building your wheel</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5" aria-hidden>
        {slotNames.map((name, s) => {
          const done = Math.min(Math.max(index - s * perSlot, 0), perSlot) / perSlot;
          return (
            <div key={name} className="h-1.5 overflow-hidden rounded-full bg-navy-raised">
              <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${done * 100}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The result as a Player Brief (like Tony's "here's what to walk in with"): celebration,
 * the siege cart on stage, the wheel next to the brief, then sharing and joining.
 */
function WheelResultView({
  name,
  slotNames,
  slotResources,
  result,
  previous,
  link,
  onRestart,
}: {
  name: string;
  slotNames: string[];
  slotResources: { title: string; url: string }[][];
  result: WheelResult;
  previous: WheelHistoryEntry | null;
  /** Their personal result link (path), to save and come back to. */
  link: string;
  onRestart: () => void;
}) {
  const { slots, total, weakestIndex } = result;
  const strongestIndex = slots.indexOf(Math.max(...slots));
  // An even wheel (all six slots equal) has no single biggest gap.
  const weak = weakestIndex >= 0 ? SLOT_INSIGHTS[weakestIndex] : null;
  const fullyBuilt = slots.every((v) => v >= 10);
  const strong = SLOT_INSIGHTS[strongestIndex];
  const shareData = useMemo(
    () => ({ name, slotNames, slots, total, weakestIndex }),
    [name, slotNames, slots, total, weakestIndex],
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* Celebration */}
      <div className="relative text-center">
        <Celebrate />
        <Eyebrow>{previous ? "Welcome back" : "Congratulations · This is your starting point"}</Eyebrow>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
          <span className="break-all text-gold">{name}</span>&apos;s build
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted sm:text-lg">
          {previous
            ? "Here's how your wheel changed since last time. The faint outline is where you were."
            : "Every player has a shape. Yours shows where your games are won, and where your MMR keeps leaking."}
        </p>
      </div>

      {/* Stage: the siege cart */}
      <div className="card mt-10 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Your siege cart</Eyebrow>
            <p className="mt-2 text-5xl font-black tracking-tight">
              {fmt(total)}
              <span className="text-2xl text-text-muted">/60 built</span>
            </p>
          </div>
          <p className="rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-sm font-bold text-text">
            {fullyBuilt ? (
              <span className="text-gold">Fully built. No gaps.</span>
            ) : !weak ? (
              <>
                Even wheel: <span className="text-gold">{fmt(slots[0])}/10 in every slot</span>
              </>
            ) : (
              <>
                Biggest gap: <span className="text-gold">{slotNames[weakestIndex]}</span>
              </>
            )}
          </p>
        </div>
        <div className="mt-4">
          <RollingCar slots={slots} />
        </div>
        <p className="mt-2 text-center text-sm text-text-muted">
          {isBrokenDown(slots) ? (
            <>
              Your cart broke down before the first wave, and your creeps are trying to fix it. Build one slot and it
              starts rolling.
            </>
          ) : (
            <>
              Your cart rolls on your wheel, and the creep wave won&apos;t wait. Every flat spot slows you down. A fully
              built wheel keeps up with the wave.
            </>
          )}
        </p>
      </div>

      {/* Wheel + Player Brief */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col p-6 sm:p-8">
          <Eyebrow>Your wheel</Eyebrow>
          <div className="mt-2 flex flex-1 items-center">
            <RadarChart names={slotNames} slots={slots} previous={previous?.slots} weakestIndex={weakestIndex} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-gold/60 ring-2 ring-gold" /> You now
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0 w-5 border-t-2 border-dashed border-gold" /> Fully built
            </span>
            {previous && (
              <span className="flex items-center gap-2">
                <span className="h-0 w-5 border-t-2 border-dotted border-text-muted" /> Last time (
                {new Date(previous.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })})
              </span>
            )}
          </div>
        </div>

        <div className="card p-6 text-left sm:p-8">
          <Eyebrow>Your Player Brief</Eyebrow>
          <dl className="mt-5 divide-y divide-navy-border">
            <BriefRow label="What's working">
              {!weak && slots[0] >= 5 ? (
                <>
                  <p className="font-extrabold text-text">
                    Every slot, evenly <span className="font-bold text-text-muted">· {fmt(slots[0])}/10</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">
                    {fullyBuilt
                      ? "Every part of your game holds up. That's rare at any rank."
                      : "A balanced player: no slot is letting you down. Now it's about raising all six together."}
                  </p>
                </>
              ) : slots[strongestIndex] >= 5 ? (
                <>
                  <p className="font-extrabold text-text">
                    {slotNames[strongestIndex]}{" "}
                    <span className="font-bold text-text-muted">· {fmt(slots[strongestIndex])}/10</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{strong.strength}</p>
                </>
              ) : (
                <>
                  <p className="font-extrabold text-text">Nothing is carrying you yet</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">
                    That&apos;s the good news: there&apos;s no single wall holding you back. Every slot you build lifts your
                    whole game, and you&apos;ll feel it fast.
                  </p>
                </>
              )}
            </BriefRow>
            {weak ? (
              <BriefRow label="Your biggest gap" gold>
                <p className="font-extrabold text-text">
                  {slotNames[weakestIndex]} <span className="font-bold text-text-muted">· {fmt(slots[weakestIndex])}/10</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{weak.cost}</p>
              </BriefRow>
            ) : fullyBuilt ? (
              <BriefRow label="Your biggest gap" gold>
                <p className="font-extrabold text-text">None. Every slot is built.</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  Keep it that way: the weekly sessions go deeper than the basics, and the meta keeps moving.
                </p>
              </BriefRow>
            ) : (
              <BriefRow label="Where to start" gold>
                <p className="font-extrabold text-text">Every slot, evenly</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  Your wheel is even, so no single slot is the problem. Build one slot at a time: every live session
                  takes one apart, and each one you build makes the whole wheel rounder.
                </p>
              </BriefRow>
            )}
            {weak?.firstFix && (
              <BriefRow label="Quick win for your next game">
                <p className="text-sm leading-relaxed text-text">{weak.firstFix}</p>
              </BriefRow>
            )}
            {weak?.question && (
              <BriefRow label="Carry this question into every game">
                <p className="border-l-2 border-gold pl-3 text-base font-semibold italic leading-relaxed text-text">
                  &ldquo;{weak.question}&rdquo;
                </p>
              </BriefRow>
            )}
            <BriefRow label="Your six slots">
              <ul className="space-y-2.5">
                {slotNames.map((name, i) => {
                  const weakest = i === weakestIndex;
                  return (
                    <li key={name} className="grid grid-cols-[minmax(0,1fr)_96px_44px] items-center gap-3 text-sm">
                      <span className={`truncate font-semibold ${weakest ? "text-gold" : "text-text"}`}>{name}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-navy" aria-hidden>
                        <span
                          className={`block h-full rounded-full ${weakest ? "bg-gold" : "bg-text-muted/60"}`}
                          style={{ width: `${(slots[i] / 10) * 100}%` }}
                        />
                      </span>
                      <span className="text-right font-bold tabular-nums text-text-muted">{fmt(slots[i])}/10</span>
                    </li>
                  );
                })}
              </ul>
            </BriefRow>
          </dl>
        </div>
      </div>

      <LearnSlots slotNames={slotNames} resources={slotResources} slots={slots} weakestIndex={weakestIndex} />

      <SaveWheel link={link} name={name} />

      {/* Share */}
      <div className="card mt-4 p-6 sm:p-8">
        <Eyebrow className="mb-5">Share your build</Eyebrow>
        <ShareWheel data={shareData} />
      </div>

      <JoinBridge gap={weakestIndex >= 0 ? slotNames[weakestIndex] : null} />

      <p className="mt-8 text-center">
        <button className="text-sm font-semibold text-text-muted hover:text-text" onClick={onRestart}>
          Retake the test
        </button>
      </p>
    </div>
  );
}

/**
 * "Learn this slot": videos, posts and replays for each slot (set in the dashboard), weakest slot
 * first, then the rest from lowest to highest score. Hidden until at least one link exists.
 */
function LearnSlots({
  slotNames,
  resources,
  slots,
  weakestIndex,
}: {
  slotNames: string[];
  resources: { title: string; url: string }[][];
  slots: number[];
  weakestIndex: number;
}) {
  const order = slotNames
    .map((_, i) => i)
    .filter((i) => resources[i]?.some((r) => r.url.trim()))
    .sort((a, b) => (a === weakestIndex ? -1 : b === weakestIndex ? 1 : slots[a] - slots[b]));
  if (!order.length) return null;
  return (
    <div className="card mt-4 p-6 sm:p-8">
      <Eyebrow>Learn this slot</Eyebrow>
      <p className="mt-2 text-sm text-text-muted">Eixn&apos;s videos and breakdowns for each slot, starting with your biggest gap.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {order.map((i) => (
          <div key={i} className={`rounded-control border p-4 ${i === weakestIndex ? "border-gold/60 bg-gold/5" : "border-navy-border"}`}>
            <p className={`font-extrabold ${i === weakestIndex ? "text-gold" : "text-text"}`}>
              {slotNames[i]} <span className="font-bold text-text-muted">· {fmt(slots[i])}/10</span>
            </p>
            <ul className="mt-2 space-y-1.5">
              {resources[i]
                .filter((r) => r.url.trim())
                .map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-text underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
                    >
                      <Icon name="play" className="h-4 w-4 shrink-0 text-gold" />
                      {r.title.trim() || r.url}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Save my wheel": their personal link, to come back to on any device without retaking the test. */
function SaveWheel({ link, name }: { link: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const full = `${window.location.origin}${link}`;
  const canShare = typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => setCopied(false), [link]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
    } catch {
      // Clipboard blocked: the link is in the address bar too.
    }
  }

  return (
    <div className="card mt-4 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="min-w-0 flex-1">
        <Eyebrow>Save your wheel</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          This is your personal link. Open it on any device to see this result again, no account and no retake needed.
        </p>
        <p className="mt-2 truncate rounded-control border border-navy-border bg-navy px-3 py-2 font-mono text-xs text-text">{full}</p>
        <p className="mt-3 flex gap-2 text-xs leading-relaxed text-text-muted">
          <Icon name="message" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          <span>
            <strong className="text-text">Tip:</strong> post your link in{" "}
            <strong className="text-text">#introductions</strong> on the 6SLOT Discord. It&apos;s there whenever you
            switch phones or computers, and next month you can compare your new wheel with it.
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <button className="btn-gold px-6 py-3" onClick={copy}>
          {copied ? "Link copied" : "Copy my link"}
        </button>
        {canShare && (
          <button
            className="btn-ghost px-6 py-3"
            onClick={() => navigator.share({ url: full, text: `${name ? `${name}'s` : "My"} 6SLOT wheel` }).catch(() => {})}
          >
            Send to myself
          </button>
        )}
      </div>
    </div>
  );
}

function BriefRow({ label, gold, children }: { label: string; gold?: boolean; children: ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <dt className={`text-[11px] font-black uppercase tracking-[0.18em] ${gold ? "text-gold" : "text-text-muted"}`}>{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

/** Bridge from the diagnosis to the offer: the next live session and why the group fixes the gap. */
function JoinBridge({ gap }: { gap: string | null }) {
  const { start, topic } = useNextSession();
  const { day, time } = formatSessionLocal(start);

  return (
    <div className="card mt-4 border-gold/40 p-6 text-center sm:p-10">
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Your wheel won&apos;t round itself.</h2>
      <p className="mx-auto mt-3 max-w-xl leading-relaxed text-text-muted">
        6SLOT takes one slot apart every week, live with the group.{" "}
        {gap ? (
          <>
            Bring your <strong className="text-text">{gap}</strong> and fix it with players stuck on the same thing.
          </>
        ) : (
          "Build it slot by slot, with players climbing the same way."
        )}
      </p>
      <p className="mt-5 text-sm font-semibold text-text">
        Next live session{topic ? `: ${topic}` : ""} · {day} · {time}
      </p>
      <CtaButton className="mt-6 w-full px-10 py-4 text-base sm:w-auto" />
    </div>
  );
}
