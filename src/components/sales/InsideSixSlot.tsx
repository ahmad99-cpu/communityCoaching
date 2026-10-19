import { m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { Icon, type IconName } from "@/components/site/Icons";

/**
 * "The 6SLOT Loop": the weekly method, named (Hormozi: sell the mechanism, not the features),
 * shown step by step (Graziosi: "here's exactly how it works") with a weekly rhythm (Robbins'
 * event agenda).
 */
const LOOP: { when: string; title: string; body: string; icon: IconName }[] = [
  {
    when: "Start of the week",
    title: "Pick the topic",
    body: "The week's topic drops in Discord: laning, map movement, teamfights and more. Members submit replays that fit it.",
    icon: "hexagon",
  },
  {
    when: "Live session",
    title: "Break it down",
    body: "2 to 3 hours with Eixn and the group. He takes the topic apart using members' replays and examples he prepares, so you see the mistake, the fix, and what it looks like at the top.",
    icon: "mic",
  },
  {
    when: "Before you leave",
    title: "Practice it live",
    body: "You don't just watch. 2v2 lane battles, recreated teamfights and more, played together until it clicks.",
    icon: "crosshair",
  },
  {
    when: "All week",
    title: "Take it into your games",
    body: "A specific practice task, a check-in channel to post your progress, and shoutouts for the members who improve the most.",
    icon: "clipboard",
  },
];

/** Robbins' "you're never alone": what keeps the community going between sessions. */
const BETWEEN: { title: string; body: string; icon: IconName }[] = [
  { title: "The Session Vault", body: "Recordings of every past session. Missed one? Watch it anytime.", icon: "play" },
  { title: "Direct line to Eixn", body: "Ask anything in the members' Discord, answered within 24 hours.", icon: "message" },
  { title: "Stack partners", body: "Players grinding the same topics as you, and teammates to queue with.", icon: "users" },
  { title: "Pro player guests", body: "Pros drop into sessions to share how they think and take your questions. Names coming soon.", icon: "star" },
  { title: "Watch parties", body: "Big tournament games, watched together with Eixn's live analysis.", icon: "tv" },
  { title: "Members-only giveaways", body: "Every member is entered automatically: coaching sessions, Dota 2 skins, merch and more.", icon: "gift" },
];

/** Example topics, in two rows that scroll in opposite directions. */
const TOPIC_ROWS = [
  [
    "Matchups & counters",
    "Meta analysis",
    "Laning stage",
    "Farming patterns",
    "Map positioning",
    "Objectives",
    "Roshan fights",
    "Drafting",
  ],
  [
    "High ground pushes",
    "High ground defense",
    "Late game",
    "Itemization",
    "Vision & warding",
    "Role deep-dives",
    "Hero deep-dives",
    "Teamfight positioning",
  ],
];

export function InsideSixSlot() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Inside 6SLOT · The 6SLOT Loop</p>
          <h2 className="section-heading mt-3">One topic a week. Four steps to master it.</h2>
        </Reveal>

        {/* The loop: numbered timeline */}
        <ol className="relative mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-4">
          {/* connecting line behind the step numbers (desktop) */}
          <m.span
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px origin-left bg-gradient-to-r from-gold/30 via-gold/70 to-gold/30 md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          {LOOP.map((step, i) => (
            <li key={step.title} className="relative flex">
              <Reveal delay={i * 0.08} className="flex w-full flex-col">
                <span className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-navy text-lg font-black text-gold">
                  {i + 1}
                </span>
                <div className="card mt-5 flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{step.when}</p>
                    <Icon name={step.icon} className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* Topics: the 6 slots are areas of your game; the topics inside them never run out. */}
        <Reveal className="mt-16 text-center">
          <h3 className="font-display text-2xl font-bold tracking-wide text-text sm:text-3xl">
            A new topic every week. <span className="text-gold">The list never runs out.</span>
          </h3>
        </Reveal>
        <div className="topic-marquee mx-auto mt-8 max-w-6xl space-y-3" aria-label="Example topics">
          {TOPIC_ROWS.map((row, r) => (
            <div key={r} className="overflow-hidden">
              <ul className={`topic-marquee__track ${r % 2 ? "topic-marquee__track--reverse" : ""}`}>
                {/* The list is doubled so the loop is seamless; the copy is hidden from screen readers. */}
                {[...row, ...row].map((topic, i) => (
                  <li
                    key={i}
                    aria-hidden={i >= row.length || undefined}
                    className="shrink-0 rounded-full border border-navy-border bg-navy-raised px-4 py-2 text-sm font-semibold text-text"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Some weeks we go deep on a role or a hero. Topics rotate and come back deeper, so there&apos;s always something new to learn.
        </p>

        {/* Between sessions */}
        <Reveal className="mx-auto mt-16 max-w-6xl">
          <div className="card p-6 sm:p-8">
            <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-gold">Between sessions, you&apos;re never alone</p>

            {/* Featured bonus: Lobby Nights */}
            <div className="mt-6 flex flex-col gap-4 rounded-card border border-gold/40 bg-gold/5 p-5 sm:flex-row sm:items-center sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-gold/50 bg-navy text-gold">
                <Icon name="users" className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2.5 text-lg font-extrabold text-text">
                  Lobby Nights
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-navy">
                    Bonus
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  On bonus nights, on top of the weekly session, Eixn sets up 5v5 lobbies and coaches the teams live, so
                  you get the real team-coaching experience. It&apos;s streamed for the whole group, so everyone learns
                  from it.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {BETWEEN.map((b) => (
                <div key={b.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-navy-border bg-navy text-gold">
                    <Icon name={b.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-text">{b.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-navy-border pt-5 text-center text-sm text-text-muted">
              Members also get <strong className="text-text">10% off</strong> 1-on-1 sessions with Eixn.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
