/**
 * Tap answers (Tony Robbins' "pick the closest fit"): one full-width button per answer, gold when
 * selected. `scores[i]` is what answer i is worth on the 0–10 wheel.
 */
export function AnswerPicker({
  answers,
  scores,
  value,
  onPick,
}: {
  answers: readonly string[];
  scores: readonly number[];
  value: number | undefined;
  onPick: (score: number) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {answers.map((text, i) => {
        const selected = value === scores[i];
        return (
          <button
            key={text}
            type="button"
            onClick={() => onPick(scores[i])}
            aria-pressed={selected}
            className={`rounded-control border px-5 py-4 text-left text-sm font-bold transition sm:text-base ${
              selected ? "border-gold bg-gold text-navy" : "border-navy-border bg-navy text-text hover:border-text-muted"
            }`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
