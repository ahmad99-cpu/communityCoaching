/**
 * Position test content (brief §6). EDIT THIS FILE to change questions, answers
 * or results — the page reads everything from here.
 *
 * ⚠️ DRAFT CONTENT — placeholder questions/results so the page works end to end.
 * Replace with Jad's final copy before launch.
 *
 * How scoring works: each answer gives points to one or more positions
 * (1 = Carry, 2 = Mid, 3 = Offlane, 4 = Support, 5 = Hard Support).
 * The position with the most points wins.
 */

export type Position = 1 | 2 | 3 | 4 | 5;

export interface PositionQuestion {
  question: string;
  answers: { text: string; points: Partial<Record<Position, number>> }[];
}

export const POSITION_QUESTIONS: PositionQuestion[] = [
  {
    question: "Your team is losing badly at 25 minutes. What's your first thought?",
    answers: [
      { text: "Stay patient, farm safely, my items will win it late", points: { 1: 2 } },
      { text: "Find a pickoff and swing the game myself", points: { 2: 2 } },
      { text: "Create space so our cores can breathe", points: { 3: 2 } },
      { text: "Get vision up and set up a smoke for the team", points: { 4: 1, 5: 2 } },
    ],
  },
  {
    question: "Which feels best?",
    answers: [
      { text: "A perfect farming pattern with zero wasted seconds", points: { 1: 2 } },
      { text: "Winning a 1v1 through pure mechanics", points: { 2: 2 } },
      { text: "Surviving a 3-man dive and still getting away", points: { 3: 2 } },
      { text: "A save that turns a fight around", points: { 5: 2, 4: 1 } },
    ],
  },
  {
    question: "How do you feel about having very little gold for most of the game?",
    answers: [
      { text: "I hate it, I need my items", points: { 1: 2, 2: 1 } },
      { text: "Fine, as long as I'm impactful", points: { 3: 1, 4: 2 } },
      { text: "I don't mind at all, I'm there for the team", points: { 5: 2 } },
    ],
  },
  {
    question: "In lane, you prefer to…",
    answers: [
      { text: "Last hit in peace and get my core items", points: { 1: 2 } },
      { text: "Be alone and dominate my opponent", points: { 2: 2 } },
      { text: "Pressure the enemy carry and make their life hard", points: { 3: 2 } },
      { text: "Pull, harass, and protect my core", points: { 5: 2 } },
      { text: "Roam and look for kills around the map", points: { 4: 2 } },
    ],
  },
  {
    question: "How do you handle pressure from teammates?",
    answers: [
      { text: "I block it out and focus on my own game", points: { 1: 2 } },
      { text: "I take the lead and tell people what to do", points: { 2: 1, 4: 1 } },
      { text: "I adapt and fill whatever the team needs", points: { 3: 1, 5: 2 } },
    ],
  },
  {
    question: "Which stat do you check first after a game?",
    answers: [
      { text: "Net worth and last hits", points: { 1: 2 } },
      { text: "Kills and damage", points: { 2: 2 } },
      { text: "Stuns and tower damage", points: { 3: 2 } },
      { text: "Wards placed and assists", points: { 4: 1, 5: 2 } },
    ],
  },
  {
    question: "Your favourite moment of the game is…",
    answers: [
      { text: "The late game, when I'm the strongest hero on the map", points: { 1: 2 } },
      { text: "The mid game, when I can take over", points: { 2: 2 } },
      { text: "The first big teamfight", points: { 3: 1, 4: 1 } },
      { text: "The early game, when every rune and pull matters", points: { 5: 1, 4: 1 } },
    ],
  },
  {
    question: "How do you like to make decisions?",
    answers: [
      { text: "Slowly and safely, minimise risk", points: { 1: 2, 5: 1 } },
      { text: "Fast and on instinct", points: { 2: 2, 4: 1 } },
      { text: "Calculated aggression", points: { 3: 2 } },
    ],
  },
  {
    question: "Which hero type do you naturally gravitate to?",
    answers: [
      { text: "Hard-scaling right-clickers", points: { 1: 2 } },
      { text: "Tempo heroes and spell burst", points: { 2: 2 } },
      { text: "Tanky initiators", points: { 3: 2 } },
      { text: "Rotating gankers", points: { 4: 2 } },
      { text: "Saves, heals and lane protection", points: { 5: 2 } },
    ],
  },
  {
    question: "When you die, it's usually because…",
    answers: [
      { text: "I got caught farming somewhere I shouldn't be", points: { 1: 1, 2: 1 } },
      { text: "I initiated and my team didn't follow", points: { 3: 2 } },
      { text: "I was warding or saving someone", points: { 5: 2, 4: 1 } },
    ],
  },
  {
    question: "Do you enjoy thinking about the whole map, all the time?",
    answers: [
      { text: "Not really, I prefer to focus on my own farm", points: { 1: 2 } },
      { text: "Sometimes, when it's time to move", points: { 2: 1, 3: 1 } },
      { text: "Yes, that's my favourite part", points: { 4: 2, 5: 1 } },
    ],
  },
  {
    question: "Pick a sentence that sounds like you.",
    answers: [
      { text: "Give me time and I'll win it", points: { 1: 2 } },
      { text: "Give me the ball", points: { 2: 2 } },
      { text: "I'll go in first", points: { 3: 2 } },
      { text: "I'll make plays happen around the map", points: { 4: 2 } },
      { text: "I make sure everyone else can shine", points: { 5: 2 } },
    ],
  },
];

export const POSITION_RESULTS: Record<Position, { name: string; why: string; heroes: string[] }> = {
  1: {
    name: "Position 1 · Carry",
    why: "You're patient, you value resources, and you like being the hero who decides the game late. You're comfortable ignoring noise to hit your timings.",
    heroes: ["Wraith King", "Juggernaut", "Luna", "Medusa", "Faceless Void"],
  },
  2: {
    name: "Position 2 · Mid",
    why: "You love 1v1 pressure, you trust your mechanics, and you want to dictate the tempo of the game rather than react to it.",
    heroes: ["Dragon Knight", "Viper", "Storm Spirit", "Puck", "Ember Spirit"],
  },
  3: {
    name: "Position 3 · Offlane",
    why: "You're fearless, you enjoy creating space, and you'd rather start the fight than wait for it. You make life hard for the enemy carry.",
    heroes: ["Mars", "Centaur Warrunner", "Axe", "Tidehunter", "Underlord"],
  },
  4: {
    name: "Position 4 · Soft Support",
    why: "You think about the whole map, you like making plays happen, and you get more out of a great rotation than a big farm.",
    heroes: ["Earth Spirit", "Tusk", "Hoodwink", "Rubick", "Mirana"],
  },
  5: {
    name: "Position 5 · Hard Support",
    why: "You're selfless, calm under pressure, and you love the small details that win lanes: pulls, wards, saves and positioning.",
    heroes: ["Crystal Maiden", "Witch Doctor", "Oracle", "Dazzle", "Lion"],
  },
};

export function scorePositions(answerIndexes: number[]): Position {
  const totals: Record<Position, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  answerIndexes.forEach((a, q) => {
    const points = POSITION_QUESTIONS[q]?.answers[a]?.points ?? {};
    for (const [pos, pts] of Object.entries(points)) totals[Number(pos) as Position] += pts ?? 0;
  });
  return (Object.keys(totals).map(Number) as Position[]).reduce((best, p) => (totals[p] > totals[best] ? p : best), 1);
}
