import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CtaButton } from "@/components/site/CtaButton";
import { LeadCapture } from "@/components/tools/LeadCapture";
import { POSITION_QUESTIONS, POSITION_RESULTS, scorePositions, type Position } from "@/components/tools/positionData";
import { saveLead } from "@/lib/leads";
import { site } from "@/config/site";

type Step = "intro" | "questions" | "lead" | "result";

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25 },
};

export function PositionTest() {
  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [position, setPosition] = useState<Position | null>(null);

  const q = POSITION_QUESTIONS[index];

  function pick(a: number) {
    const next = [...answers];
    next[index] = a;
    setAnswers(next);
    window.setTimeout(() => {
      if (index < POSITION_QUESTIONS.length - 1) setIndex(index + 1);
      else setStep("lead");
    }, 180);
  }

  async function submitLead(discord: string) {
    const best = scorePositions(answers);
    setPosition(best);
    await saveLead("position_test", discord, { position: best, answers });
    setStep("result");
    window.scrollTo(0, 0);
  }

  const result = position ? POSITION_RESULTS[position] : null;

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" {...slide} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Free · optional</p>
              <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">Position test</h1>
              <p className="mt-5 text-lg text-text-muted">
                {POSITION_QUESTIONS.length} questions about how you think in game. No right answers. Find the position that
                fits you best.
              </p>
              <button className="btn-gold mt-9 px-12 py-4 text-base" onClick={() => setStep("questions")}>
                Start
              </button>
              <p className="mx-auto mt-10 max-w-md text-sm italic text-text-muted">
                Where the questions come from: built from years of coaching all five positions.
              </p>
            </motion.div>
          )}

          {step === "questions" && (
            <motion.div key={`q-${index}`} {...slide} className="mx-auto max-w-2xl">
              <div className="flex justify-end text-xs font-bold uppercase tracking-widest text-text-muted">
                {index + 1} / {POSITION_QUESTIONS.length}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-raised">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-300"
                  style={{ width: `${(index / POSITION_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="card mt-8 p-6 sm:p-10">
                <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">{q.question}</h2>
                <div className="mt-6 space-y-2.5">
                  {q.answers.map((a, i) => (
                    <button
                      key={a.text}
                      onClick={() => pick(i)}
                      aria-pressed={answers[index] === i}
                      className={`w-full rounded-control border px-5 py-4 text-left text-sm font-semibold transition sm:text-base ${
                        answers[index] === i
                          ? "border-gold bg-gold text-navy"
                          : "border-navy-border bg-navy text-text hover:border-text-muted"
                      }`}
                    >
                      {a.text}
                    </button>
                  ))}
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
            <motion.div key="result" {...slide} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your best position</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{result.name}</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">{result.why}</p>

              <div className="card mt-8 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Heroes to try</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {result.heroes.map((h) => (
                    <span key={h} className="rounded-full border border-navy-border bg-navy px-4 py-2 text-sm font-semibold">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
                <div className="card flex flex-col p-6">
                  <p className="font-bold">Learn every slot of your position, one topic a week.</p>
                  <p className="mt-2 flex-1 text-sm text-text-muted">Weekly live group coaching with Eixn.</p>
                  <CtaButton className="mt-5 w-full">Join 6SLOT</CtaButton>
                </div>
                <div className="card flex flex-col p-6">
                  <p className="font-bold">Want Eixn to find what's costing you games?</p>
                  <p className="mt-2 flex-1 text-sm text-text-muted">1-on-1: The Real Problem Diagnostic.</p>
                  <a href={site.links.realProblemDiagnostic} target="_blank" rel="noreferrer" className="btn-ghost mt-5 w-full">
                    See the diagnostic
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
