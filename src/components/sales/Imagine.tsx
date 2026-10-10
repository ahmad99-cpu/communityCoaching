import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";

const MOMENTS = [
  {
    title: "You win your lane instead of surviving it.",
    body: "You know what you're playing for in the first ten minutes, and you walk out of lane ahead.",
  },
  {
    title: "You're there before the fight starts.",
    body: "You read the map, you're in position, and for once your team is following you.",
  },
  {
    title: "You lose a game and know exactly why.",
    body: "No blaming the team. One clear mistake, and next game you don't make it.",
  },
];

/**
 * Future pacing (Tony Robbins): instead of a "for you / not for you" checklist, let the visitor
 * picture the result. Three moments every stuck player wants.
 */
export function Imagine() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Picture yourself fully built</p>
          <h2 className="section-heading mt-3">Same game. A different player.</h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {MOMENTS.map((moment, i) => (
            <Reveal key={moment.title} delay={i * 0.08} className="card h-full p-6 sm:p-8">
              <p className="font-display text-4xl font-bold text-gold/80">0{i + 1}</p>
              <h3 className="mt-4 text-xl font-extrabold leading-snug">{moment.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{moment.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="text-lg font-semibold text-text">
            That&apos;s what <span className="text-gold">6SLOT</span> builds, one slot at a time.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
