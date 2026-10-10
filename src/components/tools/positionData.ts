import type { Position, PositionQuestion } from "@/content/types";

/**
 * Position test scoring (brief §6). Questions, answers and results are editable
 * content (admin dashboard → "Position Test"); defaults in src/content/defaults.ts.
 *
 * Each answer gives points to one or more positions (1 = Carry … 5 = Hard Support).
 * The position with the most points wins; ties go to the lower position number.
 */
export function scorePositions(questions: PositionQuestion[], answerIndexes: number[]): Position {
  const totals: Record<Position, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  answerIndexes.forEach((a, q) => {
    const points = questions[q]?.answers[a]?.points ?? {};
    for (const [pos, pts] of Object.entries(points)) totals[Number(pos) as Position] += pts ?? 0;
  });
  return ([1, 2, 3, 4, 5] as Position[]).reduce((best, p) => (totals[p] > totals[best] ? p : best), 1);
}
