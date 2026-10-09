import { Container } from "@/components/layout/Container";
import { site } from "@/config/site";

const STEPS = [
  {
    title: "Join the Discord",
    body: null,
  },
  {
    title: "Message Eixn with the email you paid with",
    body: "That's how your member role gets unlocked (within 24 hours).",
  },
  {
    title: "Open the Start Here channel",
    body: "Get set up before your first session.",
  },
];

/** Post-payment page. PayPal subscription buttons redirect here (brief §4). */
export function ThankYou() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-3xl font-black text-gold">
          6
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          You're in. <span className="text-gold">Welcome to 6SLOT.</span>
        </h1>

        <ol className="mt-12 space-y-4 text-left">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card flex gap-5 p-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-black text-gold ring-1 ring-navy-border">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Step {i + 1}</p>
                <p className="mt-1 font-bold text-text">{s.title}</p>
                {s.body && <p className="mt-1 text-sm text-text-muted">{s.body}</p>}
                {i === 0 && (
                  <a href={site.links.discordInvite} target="_blank" rel="noreferrer" className="btn-gold mt-4">
                    Join 6SLOT Discord
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
