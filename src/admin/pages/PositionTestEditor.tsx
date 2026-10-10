import type { Position, PositionQuestion } from "@/content/types";
import { Field, PageHeader, Panel, SaveBar, SmallButton, StringList, TextArea, TextInput, inputClass, moveItem, useSectionDraft } from "@/admin/ui";

const POSITIONS: { pos: Position; short: string }[] = [
  { pos: 1, short: "Pos 1" },
  { pos: 2, short: "Pos 2" },
  { pos: 3, short: "Pos 3" },
  { pos: 4, short: "Pos 4" },
  { pos: 5, short: "Pos 5" },
];

function QuestionCard({
  q,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  q: PositionQuestion;
  index: number;
  total: number;
  onChange: (q: PositionQuestion) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}) {
  const setAnswer = (i: number, patch: Partial<PositionQuestion["answers"][number]>) =>
    onChange({ ...q, answers: q.answers.map((a, j) => (j === i ? { ...a, ...patch } : a)) });

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Question {index + 1}</span>
        <div className="flex gap-1.5">
          <SmallButton onClick={() => onMove(-1)} disabled={index === 0} title="Move up">↑</SmallButton>
          <SmallButton onClick={() => onMove(1)} disabled={index === total - 1} title="Move down">↓</SmallButton>
          <SmallButton tone="danger" onClick={() => window.confirm("Delete this question?") && onDelete()}>Delete</SmallButton>
        </div>
      </div>

      <div className="mt-3">
        <Field label="Question">
          <TextInput value={q.question} onChange={(question) => onChange({ ...q, question })} />
        </Field>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-text-muted">Answers · points per position</p>
      <div className="mt-2 space-y-2">
        {q.answers.map((a, i) => (
          <div key={i} className="rounded-control border border-navy-border bg-navy/60 p-3">
            <div className="flex gap-2">
              <input className={inputClass} value={a.text} placeholder="Answer text" onChange={(e) => setAnswer(i, { text: e.target.value })} />
              <SmallButton tone="danger" onClick={() => onChange({ ...q, answers: q.answers.filter((_, j) => j !== i) })} title="Remove answer">
                ✕
              </SmallButton>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {POSITIONS.map(({ pos, short }) => (
                <label key={pos} className="text-center">
                  <span className="text-[11px] font-bold text-text-muted">{short}</span>
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} mt-1 !px-2 text-center`}
                    value={a.points[pos] ?? 0}
                    onChange={(e) => {
                      const n = Number(e.target.value) || 0;
                      const points = { ...a.points };
                      if (n > 0) points[pos] = n;
                      else delete points[pos];
                      setAnswer(i, { points });
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        <SmallButton onClick={() => onChange({ ...q, answers: [...q.answers, { text: "", points: {} }] })}>+ Add answer</SmallButton>
      </div>
    </div>
  );
}

export function PositionTestEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("position_test");
  const setQuestions = (questions: PositionQuestion[]) => update({ ...draft, questions });

  return (
    <div>
      <PageHeader
        title="Position Test"
        description="Each answer gives points to positions. The position with the most points at the end is the player's result."
      />

      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-text">Questions</h2>
      <div className="space-y-3">
        {draft.questions.map((q, i) => (
          <QuestionCard
            key={i}
            q={q}
            index={i}
            total={draft.questions.length}
            onChange={(next) => setQuestions(draft.questions.map((x, j) => (j === i ? next : x)))}
            onMove={(d) => setQuestions(moveItem(draft.questions, i, d))}
            onDelete={() => setQuestions(draft.questions.filter((_, j) => j !== i))}
          />
        ))}
        <SmallButton
          tone="gold"
          onClick={() => setQuestions([...draft.questions, { question: "", answers: [{ text: "", points: {} }, { text: "", points: {} }] }])}
        >
          + Add question
        </SmallButton>
      </div>

      <h2 className="mb-3 mt-10 text-sm font-black uppercase tracking-[0.2em] text-text">Results</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {POSITIONS.map(({ pos }) => {
          const r = draft.results[pos];
          const setResult = (patch: Partial<typeof r>) =>
            update({ ...draft, results: { ...draft.results, [pos]: { ...r, ...patch } } });
          return (
            <Panel key={pos} title={`Position ${pos}`}>
              <Field label="Result title"><TextInput value={r.name} onChange={(name) => setResult({ name })} /></Field>
              <Field label="Why it fits"><TextArea value={r.why} onChange={(why) => setResult({ why })} /></Field>
              <Field label="Heroes to try">
                <StringList items={r.heroes} onChange={(heroes) => setResult({ heroes })} addLabel="Add hero" />
              </Field>
            </Panel>
          );
        })}
      </div>

      <SaveBar
        dirty={dirty}
        status={status}
        onDiscard={discard}
        onReset={reset}
        onSave={() =>
          save((p) => {
            if (p.questions.length === 0) return "Add at least one question.";
            for (const [i, q] of p.questions.entries()) {
              if (!q.question.trim()) return `Question ${i + 1} is empty.`;
              if (q.answers.length < 2) return `Question ${i + 1} needs at least 2 answers.`;
              if (q.answers.some((a) => !a.text.trim())) return `Question ${i + 1} has an empty answer.`;
              if (q.answers.some((a) => Object.keys(a.points).length === 0))
                return `Question ${i + 1}: every answer needs points for at least one position.`;
            }
            for (const { pos } of POSITIONS) if (!p.results[pos].name.trim()) return `Position ${pos} result needs a title.`;
            return null;
          })
        }
      />
    </div>
  );
}
