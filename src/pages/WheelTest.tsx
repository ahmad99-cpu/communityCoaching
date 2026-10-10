import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { LeadCapture } from "@/components/tools/LeadCapture";
import { ScalePicker } from "@/components/tools/ScalePicker";
import { RadarChart } from "@/components/tools/RadarChart";
import { RollingCar } from "@/components/tools/RollingCar";
import {
  flattenStatements,
  fmt,
  loadWheelHistory,
  saveWheelHistory,
  scoreWheel,
  type WheelHistoryEntry,
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

export function WheelTest() {
  const { slots: wheelSlots } = useContent("wheel_test");
  const statements = useMemo(() => flattenStatements(wheelSlots), [wheelSlots]);
  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [previous, setPrevious] = useState<WheelHistoryEntry | null>(null);

  const result = useMemo(
    () => (answers.length === statements.length ? scoreWheel(answers) : null),
    [answers, statements.length],
  );

  function pick(n: number) {
    const next = [...answers];
    next[index] = n;
    setAnswers(next);
    // Short pause so the selection is visible before moving on.
    window.setTimeout(() => {
      if (index < statements.length - 1) setIndex(index + 1);
      else setStep("lead");
    }, 180);
  }

  async function submitLead(discord: string) {
    if (!result) return;
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
  }

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" {...slide} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Free · 2 minutes</p>
              <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">How built are you?</h1>
              <p className="mt-5 text-lg text-text-muted">
                12 quick questions. Find out which slot is holding your MMR back.
              </p>
              <button className="btn-gold mt-9 px-12 py-4 text-base" onClick={() => setStep("questions")}>
                Start
              </button>
              <div className="mt-12 grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-3">
                {wheelSlots.map((s, i) => (
                  <div key={s.name} className="card px-4 py-3">
                    <span className="font-black text-gold">{i + 1}</span>{" "}
                    <span className="font-semibold text-text">{s.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "questions" && (
            <motion.div key={`q-${index}`} {...slide} className="mx-auto max-w-2xl">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                <span>
                  Slot {statements[index].slotIndex + 1} · {statements[index].slotName}
                </span>
                <span>
                  {index + 1} / {statements.length}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-raised">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-300"
                  style={{ width: `${(index / statements.length) * 100}%` }}
                />
              </div>

              <div className="card mt-8 p-6 sm:p-10">
                <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">"{statements[index].text}"</h2>
                <p className="mt-2 text-sm text-text-muted">How true is this for you?</p>
                <div className="mt-8">
                  <ScalePicker value={answers[index]} onPick={pick} />
                </div>
              </div>

              {index > 0 && (
                <button
                  className="mt-5 text-sm font-semibold text-text-muted hover:text-text"
                  onClick={() => setIndex(index - 1)}
                >
                  ← Back
                </button>
              )}
            </motion.div>
          )}

          {step === "lead" && (
            <motion.div key="lead" {...slide}>
              <LeadCapture onSubmit={submitLead} />
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" {...slide} className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your wheel</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {fmt(result.total)}
                <span className="text-text-muted">/60</span> built
              </h1>

              <div className="mt-6">
                <RadarChart names={wheelSlots.map((s) => s.name)} slots={result.slots} previous={previous?.slots} weakestIndex={result.weakestIndex} />
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-text-muted">
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

              <div className="card mt-10 overflow-hidden px-2 pb-2 pt-6">
                <RollingCar slots={result.slots} />
              </div>

              <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-text-muted">
                You're <strong className="text-text">{fmt(result.total)}/60</strong> built,{" "}
                <strong className="text-text">{fmt(60 - result.total)}</strong> points from fully built. Biggest gap:{" "}
                <strong className="text-gold">{wheelSlots[result.weakestIndex].name}</strong> (+
                {fmt(10 - result.slots[result.weakestIndex])}). A wheel with a flat spot doesn't roll. That's where your
                MMR keeps getting stuck.
              </p>

              <div className="card mt-10 p-8">
                <p className="text-lg font-bold">6SLOT covers one slot every week, starting October 31.</p>
                <CtaButton className="mt-6 w-full px-10 py-4 text-base sm:w-auto" />
              </div>

              <button className="mt-8 text-sm font-semibold text-text-muted hover:text-text" onClick={restart}>
                Retake the test
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
