import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";

export function Referral() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <Reveal className="card mx-auto flex max-w-4xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-navy-border bg-navy text-2xl">
            <span aria-hidden>🤝</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">Bring your stack.</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">
              Bring a friend to try a live session for free. If they join, their first month is $19, and you get a
              month on us.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
