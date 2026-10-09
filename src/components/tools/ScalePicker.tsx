/** 0 (never) → 10 (always) answer buttons. */
export function ScalePicker({ value, onPick }: { value: number | undefined; onPick: (n: number) => void }) {
  return (
    <div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            aria-pressed={value === n}
            className={`h-12 rounded-control border text-base font-bold transition ${
              value === n
                ? "border-gold bg-gold text-navy"
                : "border-navy-border bg-navy text-text hover:border-text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-text-muted">
        <span>0 · Never</span>
        <span>Always · 10</span>
      </div>
    </div>
  );
}
