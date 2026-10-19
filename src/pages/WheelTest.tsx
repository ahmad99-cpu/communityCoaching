import { usePageTitle } from "@/lib/usePageTitle";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { Icon, type IconName } from "@/components/site/Icons";
import { LeadCapture } from "@/components/tools/LeadCapture";
import { AnswerPicker } from "@/components/tools/AnswerPicker";
import { ANSWER_SCORES, WHEEL_ANSWERS } from "@/components/tools/wheelAnswers";
import { RadarChart } from "@/components/tools/RadarChart";
import { RollingCar } from "@/components/tools/RollingCar";
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
const PREVIEW_ANSWERS = [6, 5, 7, 5, 3, 3, 9, 8, 6, 5, 7, 7];

/**
 * "How built are you?" — modelled on Tony Robbins' Business Mastery Growth Plan:
 * see what you'll walk away with → answer one question at a time → "whose build is this?" →
 * a celebration and a personal Player Brief you can share.
 */
export function WheelTest() {
  usePageTitle("How Built Are You?");
  const { slots: wheelSlots } = useContent("wheel_test");
  const statements = useMemo(() => flattenStatements(wheelSlots), [wheelSlots]);
  const [step, setStep] = useState<Step>(PREVIEW ? "result" : "intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(PREVIEW ? PREVIEW_ANSWERS : []);
  const [previous, setPrevious] = useState<WheelHistoryEntry | null>(null);
  const [playerName, setPlayerName] = useState(PREVIEW ? "EixnFan" : "");

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
    await saveLead("wheel_test", discord, {
      slots: Object.fromEntries(wheelSlots.map((s, i) => [s.name, result.slots[i]])),
      total: result.total,
      weakest: wheelSlots[result.weakestIndex].name,
    });
    setStep("result");
    window.scrollTo(0, 0);
  }

  function restart() {
    setAnswers([]);
    setIndex(0);
    setStep("questions");
    window.scrollTo(0, 0);
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-6xl">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <m.div key="intro" {...slide}>
              <Intro slotNames={slotNames} onStart={() => setStep("questions")} />
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
              <WheelResultView name={playerName} slotNames={slotNames} result={result} previous={previous} onRestart={restart} />
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
function Intro({ slotNames, onStart }: { slotNames: string[]; onStart: () => void }) {
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

        <button className="btn-gold mt-9 w-full px-12 py-4 text-base sm:w-auto" onClick={onStart}>
          Build my wheel
        </button>
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
  result,
  previous,
  onRestart,
}: {
  name: string;
  slotNames: string[];
  result: WheelResult;
  previous: WheelHistoryEntry | null;
  onRestart: () => void;
}) {
  const { slots, total, weakestIndex } = result;
  const strongestIndex = slots.indexOf(Math.max(...slots));
  const weak = SLOT_INSIGHTS[weakestIndex];
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
            Biggest gap: <span className="text-gold">{slotNames[weakestIndex]}</span>
          </p>
        </div>
        <div className="mt-4">
          <RollingCar slots={slots} />
        </div>
        <p className="mt-2 text-center text-sm text-text-muted">
          Your cart rolls on your wheel, and the creep wave won&apos;t wait. Every flat spot slows you down. A fully built
          wheel keeps up with the wave.
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
              <p className="font-extrabold text-text">
                {slotNames[strongestIndex]} <span className="font-bold text-text-muted">· {fmt(slots[strongestIndex])}/10</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">{strong.strength}</p>
            </BriefRow>
            <BriefRow label="Your biggest gap" gold>
              <p className="font-extrabold text-text">
                {slotNames[weakestIndex]} <span className="font-bold text-text-muted">· {fmt(slots[weakestIndex])}/10</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">{weak.cost}</p>
            </BriefRow>
            {weak.firstFix && (
              <BriefRow label="Quick win for your next game">
                <p className="text-sm leading-relaxed text-text">{weak.firstFix}</p>
              </BriefRow>
            )}
            {weak.question && (
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

      {/* Share */}
      <div className="card mt-4 p-6 sm:p-8">
        <Eyebrow className="mb-5">Share your build</Eyebrow>
        <ShareWheel data={shareData} />
      </div>

      <JoinBridge gap={slotNames[weakestIndex]} />

      <p className="mt-8 text-center">
        <button className="text-sm font-semibold text-text-muted hover:text-text" onClick={onRestart}>
          Retake the test
        </button>
      </p>
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
function JoinBridge({ gap }: { gap: string }) {
  const { start, topic } = useNextSession();
  const { day, time } = formatSessionLocal(start);

  return (
    <div className="card mt-4 border-gold/40 p-6 text-center sm:p-10">
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Your wheel won&apos;t round itself.</h2>
      <p className="mx-auto mt-3 max-w-xl leading-relaxed text-text-muted">
        6SLOT takes one slot apart every week, live with the group. Bring your <strong className="text-text">{gap}</strong> and
        fix it with players stuck on the same thing.
      </p>
      <p className="mt-5 text-sm font-semibold text-text">
        Next live session{topic ? `: ${topic}` : ""} · {day} · {time}
      </p>
      <CtaButton className="mt-6 w-full px-10 py-4 text-base sm:w-auto" />
    </div>
  );
}
