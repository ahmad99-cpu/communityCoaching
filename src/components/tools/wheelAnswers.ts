/**
 * Tap answers for the "How built are you?" questions (like the "pick the closest fit" chips in
 * Tony Robbins' Growth Plan): four first-person answers per question, from rough to strong,
 * scored 0 / 3 / 7 / 10. Indexed [slot][question], in the same order as the statements in the
 * dashboard (How Built Are You?). If a question is reworded there, update its answers here too.
 */
export const ANSWER_SCORES = [0, 3, 7, 10] as const;

export const WHEEL_ANSWERS: [string, string, string, string][][] = [
  // Role & Drafting
  [
    [
      "I only play my main. Anything else and I'm lost.",
      "I can fill, but I feel useless off my main role.",
      "I'm decent on a second role, just not as comfortable.",
      "I'm solid on two roles. Fill me anywhere.",
    ],
    [
      "I pick what I feel like playing, every game.",
      "I know a few counters, but I mostly play my comfort heroes.",
      "I usually check the enemy draft before I pick.",
      "I draft around matchups and counters every game.",
    ],
  ],
  // Laning
  [
    [
      "Equilibrium? I just hit creeps and hope.",
      "I know what pulling is, but I rarely time it right.",
      "I control the lane most games, and pull when it matters.",
      "I manage the wave, my regen and my pulls on purpose.",
    ],
    [
      "A hard lane means I'm dead or out of lane by minute 5.",
      "I survive, but I come out way behind.",
      "I usually come out close to even.",
      "I find a way to win or go even, even in a bad lane.",
    ],
  ],
  // Farming & Itemization
  [
    [
      "Same build every game. It worked once.",
      "I follow the guide and swap an item now and then.",
      "I adapt my build to the enemy most games.",
      "Every item I buy answers something the enemy has.",
    ],
    [
      "Twenty minutes in and I still have my boots.",
      "I farm when I remember to.",
      "I hit most of my timings, sometimes a bit late.",
      "I hit my timings, and as a support I'm never broke.",
    ],
  ],
  // Map Movement & Positioning
  [
    [
      "I show up where the fight already happened.",
      "I'm often in the wrong place at the wrong time.",
      "I'm usually where my team needs me.",
      "I'm there before the fight starts, every time.",
    ],
    [
      "Minimap? I walk in, then find out.",
      "I check sometimes, usually after I die.",
      "I check before most of my moves.",
      "I always know where they are before I move.",
    ],
  ],
  // Teamfights & Objectives
  [
    [
      "I press my buttons and hope for the best.",
      "I know my job, but I hit whatever's closest.",
      "I usually do my job and pick decent targets.",
      "I know my role and I go for the right target.",
    ],
    [
      "We win a fight, then go back to farming.",
      "Sometimes we take something, but it's random.",
      "I usually call the right objective after a fight.",
      "I always know what we take next, or when to back off.",
    ],
  ],
  // Mindset & Decisions
  [
    [
      "It's always my team's fault.",
      "I blame my team first, then maybe think about it.",
      "I usually look at what I could have done better.",
      "I always start with my own mistakes.",
    ],
    [
      "Bad teammates? I give up on the game.",
      "I try, but I tilt fast.",
      "I adapt most games, even when it's rough.",
      "Whatever the game throws at me, I make it work.",
    ],
  ],
];
