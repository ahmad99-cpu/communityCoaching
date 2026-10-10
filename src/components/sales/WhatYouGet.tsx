import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { Icon, type IconName } from "@/components/site/Icons";

const CARDS = [
  {
    icon: "mic" as const,
    title: "Weekly live session",
    body: "2 to 3 hours on Discord with Eixn and the group, every week, one topic. Matchups, laning, itemization, teamfights, map movement, positioning, farming patterns and much more. You go deep on one thing until it actually clicks.",
  },
  {
    icon: "play" as const,
    title: "Real games, broken down",
    body: "Eixn teaches each topic through real games: replays members submit and examples he prepares, from pro matches to high-MMR games. The whole group sees the mistake, the fix, and what it looks like at the top level.",
  },
  {
    icon: "crosshair" as const,
    title: "Live practice",
    body: "You don't just listen, you practice. 2v2 lane battles for laning week, recreated teamfights for positioning week and much more, played together during the session.",
  },
  {
    icon: "clipboard" as const,
    title: "Homework & progress",
    body: "Leave every session with specific tasks, post your progress in the homework check-in channel, and track your climb. Members who improve the most get rewarded.",
  },
];

const ALSO_INCLUDED: [string, string][] = [
  ["The Session Vault:", "recordings of every past session, rewatch any topic anytime"],
  ["Direct line to Eixn:", "ask anything in Discord, answered within 24 hours"],
  ["Stack partners:", "find teammates to grind with in the members-only Discord"],
  ["10% off sessions with Eixn", ""],
];

const EVENTS: [IconName, string][] = [
  ["star", "Pro player guests (names coming soon)"],
  ["tv", "Watch parties with live analysis of tournament games"],
  ["gift", "Giveaways, digital and physical"],
];

export function WhatYouGet() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">What you get</h2>
          <p className="mt-4 text-text-muted sm:text-lg">
            One topic a week, learned three ways: broken down together, practiced live, and taken into your games.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06} className="card p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-control border border-navy-border bg-navy text-gold">
                <Icon name={c.icon} />
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{c.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-[1.4fr_1fr]">
          <Reveal className="card p-6 sm:p-7">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Also included</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {ALSO_INCLUDED.map(([title, rest]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-gold" aria-hidden>✓</span>
                  <span>
                    <strong className="text-text">{title}</strong>
                    {rest && <span className="text-text-muted"> {rest}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06} className="card p-6 sm:p-7">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Special events</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {EVENTS.map(([icon, text]) => (
                <li key={text} className="flex gap-3">
                  <Icon name={icon} className="mt-0.5 h-4 w-4 text-gold" />
                  <span className="text-text">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
