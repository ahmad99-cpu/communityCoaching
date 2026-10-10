import { Navigate, useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";

/**
 * Policy pages (brief §2). Jad is providing the final text — paste each one into
 * `body` below as paragraphs. Until then a short holding summary is shown.
 */
const POLICIES: Record<string, { title: string; body: string[] }> = {
  refund: {
    title: "Refund & Cancellation",
    body: [
      "Try your first session. If 6SLOT isn't for you, ask for a refund before your second session. No questions asked.",
      "Refunds go back through PayPal, to the card or PayPal account you paid with. PayPal keeps its processing fee when a payment is refunded, so that fee (usually around $1 on a $19 payment) is deducted from your refund.",
      "You can cancel anytime. If your subscription isn't renewed before the next session, your access ends. Founders who cancel lose the $19 price permanently.",
      "Full policy text coming soon.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: ["Full policy text coming soon."],
  },
  giveaway: {
    title: "Giveaway Rules",
    body: [
      "Giveaways unlock as 6SLOT grows. Every member is entered automatically, and winners are announced in Discord.",
      "Full rules coming soon.",
    ],
  },
};

export function Policy() {
  const { slug } = useParams();
  const policy = slug ? POLICIES[slug] : undefined;
  if (!policy) return <Navigate to="/" replace />;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="section-heading">{policy.title}</h1>
        <div className="mt-8 space-y-4 leading-relaxed text-text-muted">
          {policy.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}
