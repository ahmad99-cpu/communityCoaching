import type { SiteContent } from "@/content/types";

/**
 * Built-in content: what the site shows until an admin saves a section in the
 * dashboard (/admin). Saved sections in Supabase `site_content` replace these.
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
    subheading: "Every member gets the full 6SLOT experience. Founders just pay less, forever.",
    founder: {
      name: "Founder",
      price: 19,
      subtitle: "Locked in forever. First 20 members only.",
      badge: "🔥 Limited",
      features: [
        "Weekly 2 to 3 hour live sessions",
        "Your replays broken down live",
        "Live drills every session",
        "Homework & progress rewards",
        "Start Here kit",
        "The Session Vault",
        "Members-only Discord & stack partners",
        "Special events: guest pros, watch parties, giveaways",
        "10% off sessions with Eixn",
      ],
      highlight: "Founder perks: gold Founder role and a vote on every month's topics",
      buttonLabel: "Claim my founder spot",
    },
    member: {
      name: "Member",
      price: 29,
      subtitle: "Available once founder spots are gone.",
      badge: "",
      features: ["Everything in Founder (except founder perks)"],
      highlight: "",
      buttonLabel: "Join 6SLOT",
    },
    valueBoxTitle: "A single 1-on-1 session with Eixn costs $55.",
    valueBox: "As a founder, you get 4 live sessions a month, 2 to 3 hours each, plus everything above, for $19.",
    guarantee: "Try your first session. Not for you? Full refund, no questions asked.",
    smallPrint: "Cancel anytime. Founders who cancel lose their $19 price permanently.",
  },

  faq: {
    items: [
      {
        q: "Who is 6SLOT for?",
        a: "Players who've been stuck at the same rank for months or even years. You know a lot about Dota, you watch the tournaments and the guides, but you still can't see what's actually costing you games. If you're ready to find out and put in the work, this is for you.",
      },
      {
        q: "Which positions does it cover?",
        a: "All five. Each topic is broken down for every role, so whether you play carry or hard support, you'll know what it means for you.",
      },
      {
        q: "I've watched tons of guides already. Why is this different?",
        a: "Guides show you what good players do. They don't show you what you're doing wrong. 6SLOT breaks down real member replays, then you practice the fix live in drills. Watching teaches you, practicing changes your games.",
      },
      {
        q: "Will I actually get attention in a group?",
        a: "Yes. You can ask questions live, submit replays every week, and get feedback in the Discord between sessions. And as 6SLOT grows, it grows with you: more sessions, more pro guests, more events.",
      },
      {
        q: "How fast will I see results?",
        a: "It depends on where you start and how much you put into the homework. Most players notice they're thinking differently about the game after the first session. The rank follows when you apply it consistently.",
      },
      {
        q: "When are the sessions?",
        a: "Every Saturday, 2 to 3 hours on Discord, starting October 31 at 12:00 UTC. Times can shift based on a weekly member survey so they work for as many people as possible.",
      },
      {
        q: "What if I can't make it live?",
        a: "Every session is recorded and saved in the Session Vault. Watch it whenever it works for you.",
      },
      {
        q: "How do replay submissions work?",
        a: "Before each session, submit a replay that fits that week's topic in the replay channel. Eixn picks the replays that best show the topic and breaks them down live, so even when it's not your game, it's your mistake being fixed.",
      },
      {
        q: "Do I have to join the drills?",
        a: 'No, but you should. Drills are where the topic goes from "I understand it" to "I can actually do it."',
      },
      {
        q: "Who are the guest pro players?",
        a: "From time to time, pro players join sessions as special guests to share how they think about the game and answer member questions. Guests are announced in Discord ahead of time. Stay tuned, the first names are coming soon.",
      },
      {
        q: "How do giveaways work?",
        a: "Giveaways unlock as 6SLOT grows. Every member is entered automatically, and winners are announced in Discord. The next one is still a secret. Stay tuned.",
      },
      {
        q: "Why is the founder price so low?",
        a: "Because founders are the first ones in. They help shape the sessions, the topics and the community from day one, and in return they keep $19/month for as long as they stay subscribed. Once the 20 founder spots are gone, the price is $29.",
      },
      {
        q: "How does the referral program work?",
        a: "Invite a friend to 6SLOT. If they join, their first month is $19 instead of $29, and you get one free month. The free month can be earned once per member. Just make sure your friend mentions your name when they message Eixn.",
      },
      {
        q: "Can I bring a friend to try a session?",
        a: "Yes. Every member can bring one friend to try a live session for free. Message Eixn on Discord before the session with your friend's Discord username, and they'll get access for that session.",
      },
      {
        q: "What do I need to join?",
        a: "Dota 2, Discord, and a card or PayPal account. A mic is optional but useful for drills and questions.",
      },
      {
        q: "How do I get access after paying?",
        a: "Instantly. After you pay, you're taken straight to the Discord invite and the Start Here kit. Message Eixn with the email you paid with, and your full member access is unlocked within 24 hours.",
      },
      { q: "What language are the sessions in?", a: "English." },
      {
        q: "Can I cancel anytime?",
        a: "Yes, cancel anytime. If your subscription isn't renewed before the next session, your access ends. Founders who cancel lose the $19 price permanently.",
      },
      {
        q: "Is there a refund?",
        a: "Yes. Try your first session, and if 6SLOT isn't for you, ask for a full refund before your second session. No questions asked.",
      },
      {
        q: "What's the difference between 6SLOT and 1-on-1 coaching?",
        a: "6SLOT teaches the fundamentals everyone struggles with, every week, at a low price. 1-on-1 coaching goes deep on your games only. Members get 10% off sessions with Eixn whenever they want that extra push.",
      },
    ],
  },

  wheel_test: {
    slots: [
      {
        name: "Role & Drafting",
        statements: [
          "I know how to play my main role, and a secondary role when I don't get my main",
          "My hero pool is big enough to play any game, including picking counters",
        ],
      },
      {
        name: "Laning",
        statements: [
          "I know how to win or go even in a hard matchup",
          "I understand resource management, pulling, and lane equilibrium",
        ],
      },
      {
        name: "Farming & Itemization",
        statements: [
          "I change my build based on the enemy heroes, not a guide",
          "I hit my item timings on time, not delayed",
        ],
      },
      {
        name: "Map Movement & Positioning",
        statements: [
          "I'm never walking around the map doing nothing, I always know where I should be next",
          "I'm always in the right place on the map based on the game time and the next objective",
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
          "I stay calm and keep communicating after mistakes or bad teammates",
          "I can explain why I lost a game, beyond blaming my team",
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
};
