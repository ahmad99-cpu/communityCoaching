import type { SiteContent } from "@/content/types";

/**
 * Built-in content: what the site shows until an admin saves a section in the
 * dashboard (/adminDashboard). Saved sections in Supabase `site_content` replace these.
 */
export const DEFAULT_CONTENT: SiteContent = {
  giveaway: {
    items: [
      {
        id: "founders-1",
        goal: 20,
        prize: {
          category: "coaching",
          name: "Free 1-on-1 coaching session with Eixn",
          team: "",
          value: 55,
          imageUrl: "",
        },
      },
    ],
    next: {
      revealed: false,
      goal: 35,
      prize: { category: "dota_item", name: "", team: "", value: 0, imageUrl: "" },
    },
  },

  pricing: {
    heading: "Claim your spot",
    subheading: "6SLOT is $27/month. The first 25 members lock in the $19 launch price for as long as they stay.",
    founder: {
      name: "Founder",
      price: 19,
      subtitle: "Launch price, locked in forever. First 25 members only.",
      badge: "Limited",
      features: [
        "Weekly 2 to 3 hour live sessions",
        "Real games broken down live (members' replays and Eixn's prepared examples)",
        "Live practice every session",
        "Practice tasks & progress rewards",
        "Direct line: ask Eixn anything, answered within 24 hours",
        "The Session Vault: recordings of every past session",
        "Members-only Discord & stack partners",
        "Bonus Lobby Nights: 5v5 lobbies coached live by Eixn, streamed for the group",
        "Pro player guests (names coming soon)",
        "Watch parties with live analysis of tournament games",
        "Members-only giveaways: coaching sessions, Dota 2 skins, merch and more",
        "10% off 1-on-1 sessions with Eixn",
      ],
      highlight: "Founder perks: gold Founder role and a vote on every month's topics",
      buttonLabel: "Claim my founder spot",
    },
    member: {
      name: "Member",
      price: 27,
      subtitle: "Available once founder spots are gone.",
      badge: "",
      features: ["Everything in Founder (except founder perks)"],
      highlight: "",
      buttonLabel: "Join 6SLOT",
    },
    stackTitle: "Everything you get every month",
    stack: [
      {
        item: "4 live sessions with Eixn",
        detail: "2 to 3 hours every Saturday. One topic, real games, live practice.",
        value: 220,
        founderOnly: false,
      },
      {
        item: "The Session Vault",
        detail: "Recordings of every past session. Missed one, or joined later? Watch any topic, anytime.",
        value: 49,
        founderOnly: false,
      },
      {
        item: "Direct line to Eixn",
        detail: "Ask anything in the members' Discord, answered within 24 hours.",
        value: 49,
        founderOnly: false,
      },
      {
        item: "Practice tasks, check-ins & progress rewards",
        detail: "Specific tasks after every session, a monthly progress check, and rewards for the most improved.",
        value: 39,
        founderOnly: false,
      },
      {
        item: "Members' Discord & stack partners",
        detail: "Players grinding the same topics as you, and teammates to queue with.",
        value: 19,
        founderOnly: false,
      },
    ],
    valueBoxTitle: "How we value it:",
    valueBox: "a single 1-on-1 session with Eixn costs $55. Four live sessions a month at that rate is $220, and each one runs 2 to 3 hours.",
    guarantee: "Try your first session. Not for you? Get your money back, no questions asked.",
    smallPrint: "Cancel anytime. Founders who cancel lose their $19 price permanently.",
  },

  faq: {
    items: [
      // How 6SLOT works
      {
        group: "How 6SLOT works",
        q: "Who is 6SLOT for?",
        a: "Any Dota player who wants to get better with a group instead of alone. Maybe you've been stuck at the same rank for months, maybe you want to finally learn a second role, or maybe 1-on-1 coaching was never in your budget. 6SLOT gives you a pro-level coach every week and a community grinding the same topics as you, for less than the price of a single 1-on-1 session a month.",
      },
      {
        group: "How 6SLOT works",
        q: "What happens in a weekly session?",
        a: "Each week has one topic. Before the session, members submit replays that fit it. Live, Eixn breaks the topic down using a few of those replays and examples he prepares, then the whole group practices it together: 2v2 lane battles, recreated teamfights and more. You leave with a practice task and post your progress in the Discord. Even when it's not your replay, it's usually the same mistake you make.",
      },
      {
        group: "How 6SLOT works",
        q: "When are the sessions?",
        a: "Once a week, 2 to 3 hours live on Discord, in English. The first session is October 31 at 12:00 UTC. Times can shift based on a weekly member survey, so they work for as many members as possible.",
      },
      {
        group: "How 6SLOT works",
        q: "What if I can't make it live?",
        a: "Every session is recorded and saved in the Session Vault. Watch it whenever it works for you, and catch up on any topic you missed.",
      },
      {
        group: "How 6SLOT works",
        q: "Which roles does it cover?",
        a: "All five. Each topic is broken down for every role, and some weeks we go deep on a single role or hero.",
      },
      // The community
      {
        group: "The community",
        q: "Will I actually get attention in a group?",
        a: "Yes. You can submit replays, ask questions live and practice with the group. Between sessions you have the direct line to Eixn, answered within 24 hours, plus the progress check-ins and bonus Lobby Nights where Eixn coaches 5v5 teams live.",
      },
      {
        group: "The community",
        q: "What happens between sessions?",
        a: "The members' Discord keeps going all week: the direct line to Eixn, stack partners to queue with and progress check-ins. On top of that come bonus Lobby Nights, pro player guests, watch parties and members-only giveaways, where every member is entered automatically.",
      },
      {
        group: "The community",
        q: "How is this different from 1-on-1 coaching?",
        a: "1-on-1 goes deep on your games only, at $55 an hour. 6SLOT works on the fundamentals every player struggles with, every week, with a group learning from each other's games, for less than a single 1-on-1 session a month. Members also get 10% off 1-on-1 sessions with Eixn whenever they want an extra push.",
      },
      // Joining & pricing
      {
        group: "Joining & pricing",
        q: "Why do founders pay $19 instead of $27?",
        a: "6SLOT is $27/month. Founders are the first 25 in: they help shape the sessions, the topics and the community from day one, so they lock in the $19 launch price for as long as they stay subscribed. Once the 25 founder spots are gone, it's $27.",
      },
      {
        group: "Joining & pricing",
        q: "How do I join?",
        a: "You need Dota 2, Discord and a card or PayPal account. A mic helps for practice and questions, but it's optional. After you pay, you land on a page with your next steps: join the Discord and fill a 2-minute onboarding form with the email you paid with. Eixn gives you access within 24 hours.",
      },
      {
        group: "Joining & pricing",
        q: "Can I bring a friend?",
        a: "Yes. Once a month, every member can bring one friend to a live session for free: message Eixn on Discord before the session with your friend's Discord username. If your friend becomes a member, you get one free month (once per member). Just make sure they mention your name when they message Eixn.",
      },
      {
        group: "Joining & pricing",
        q: "Can I cancel or get a refund?",
        a: "Yes, cancel anytime. If your subscription isn't renewed before the next session, your access ends, and founders who cancel lose the $19 price for good. Not for you after your first session? Ask for a refund before your second one, no questions asked. Refunds go back through PayPal, minus PayPal's processing fee (usually around $1), because PayPal doesn't return it to us.",
      },
    ],
  },

  wheel_test: {
    slots: [
      {
        name: "Role & Drafting",
        statements: [
          "I play my main role well, and I can also play a second role (like offlane) when I don't get my main",
          "I understand matchups and hero counters, and I pick accordingly",
        ],
      },
      {
        name: "Laning",
        statements: [
          "I understand lane equilibrium and resource management, and I know when and how to pull",
          "I know how to win or go even in a hard matchup",
        ],
      },
      {
        name: "Farming & Itemization",
        statements: [
          "I change my build based on the enemy heroes, not a guide",
          "I'm always farmed: as a core I have good farming patterns and hit my item timings, as a support I'm never broke",
        ],
      },
      {
        name: "Map Movement & Positioning",
        statements: [
          "I'm always in the right place on the map based on the game time and the next objective",
          "I check the minimap and vision before I move, so I rarely walk into the enemy",
        ],
      },
      {
        name: "Teamfights & Objectives",
        statements: [
          "I know my job in a fight and hit the right targets",
          "I know when to take Roshan, push a tower, or back off",
        ],
      },
      {
        name: "Mindset & Decisions",
        statements: [
          "After a loss, I look at my own mistakes instead of blaming my team",
          "I adapt to whatever situation my teammates put me in, and make the best of it",
        ],
      },
    ],
  },

  // DRAFT position test content — replace from the dashboard with Jad's final copy.
  position_test: {
    questions: [
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
    ],
    results: {
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
    },
  },

  next_session: {
    startsAt: "2026-10-31T12:00:00Z",
    topic: "",
  },
};
