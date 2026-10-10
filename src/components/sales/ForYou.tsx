import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";

const NOT_FOR = [
  "You want someone to play your games for you",
  "You're looking for a quick trick to gain 1,000 MMR overnight",
  "You're not willing to do the homework",
];

const FOR = [
  "You've been stuck at the same rank and you're tired of guessing why",
  "You want to actually understand the game, not just copy builds",
  "You're ready to put in the work between sessions",
];

export function ForYou() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="section-heading text-center">
            Is <span className="text-gold">6SLOT</span> for you?
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal className="card p-6 sm:p-8">
            <h3 className="font-extrabold text-text">It's not for you if:</h3>
            <ul className="mt-5 space-y-4">
              {NOT_FOR.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-text-muted sm:text-base">
                  <span className="mt-0.5 font-black text-red-400" aria-hidden>✗</span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="card border-gold/40 p-6 sm:p-8">
            <h3 className="font-extrabold text-text">It's for you if:</h3>
            <ul className="mt-5 space-y-4">
              {FOR.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-text sm:text-base">
                  <span className="mt-0.5 font-black text-emerald-400" aria-hidden>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
