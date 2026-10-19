import { Link, Navigate, useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { site } from "@/config/site";
import { usePageTitle } from "@/lib/usePageTitle";

/**
 * Policy pages: refund, privacy, giveaway rules and terms. Written in plain words on purpose.
 * Each body is a list of paragraphs; an item like { h: "..." } is a section heading.
 * Change `UPDATED` whenever any policy text changes.
 */
const UPDATED = "October 20, 2026";
const OWNER = "Jad Hammoud (Eixn)";
const DISCORD = site.links.discordInvite;

type Block = string | { h: string };

const POLICIES: Record<string, { title: string; intro: string; body: Block[] }> = {
  terms: {
    title: "Terms of Service",
    intro: `These terms are the deal between you and 6SLOT. 6SLOT is run by ${OWNER}, a sole proprietor based in Lebanon. By paying for a membership or using the site, you agree to them.`,
    body: [
      { h: "What you get" },
      "A 6SLOT membership gives you weekly live Dota 2 group coaching with Eixn on Discord, plus access to the members' Discord community. The exact schedule, topics and extras (like Lobby Nights or guests) can change from week to week. If a session has to move, we announce the new time in Discord.",
      { h: "Who can join" },
      "You must be at least 13 years old. If you're under 18, a parent or guardian must agree to these terms and to the payment, and should be the one who pays. You need a Discord account and must follow Discord's own rules.",
      { h: "Payment" },
      "Memberships are paid monthly through PayPal, in US dollars. We never see or store your card details: PayPal handles the payment. If you're on a monthly subscription, it renews automatically each month until you cancel it, which you can do anytime in your PayPal account.",
      "The founder price ($19 a month) is for the first 25 members and stays yours for as long as your membership stays active. If you cancel, you lose it, and rejoining is at the regular price.",
      { h: "Refunds and cancelling" },
      "See the Refund & Cancellation policy. In short: try your first session, and if 6SLOT isn't for you, ask for a refund before your second one.",
      { h: "How we expect members to act" },
      "Be respectful to Eixn, guests and other members. No harassment, hate, cheating, account selling or boosting, scams, or spam. Don't share your access with people who haven't joined. Serious or repeated breaks of these rules can get you removed from 6SLOT without a refund.",
      { h: "Session content" },
      "Sessions, replays, notes and other material are for your own improvement. Please don't record, resell or publish them without asking first.",
      { h: "Results" },
      "Coaching helps, but your rank depends on how much you play and practise, and on things we don't control. We don't promise a specific MMR gain.",
      { h: "Free tools" },
      "The free tools (like the Counter Picker and the tests) use public match data and are given as-is. They're a guide, not a guarantee, and may sometimes be out of date or wrong.",
      { h: "Valve and Dota 2" },
      "6SLOT isn't made, endorsed or sponsored by Valve. Dota 2 and the Aegis are trademarks of Valve Corporation.",
      { h: "Limits" },
      "If something goes wrong on our side, our total responsibility to you is limited to what you paid us in the last 3 months. Nothing in these terms takes away rights you have under the law where you live.",
      { h: "Changes" },
      "We may update these terms. If a change matters, we announce it in Discord before it applies. The date at the top shows the latest version.",
      { h: "Law" },
      "These terms follow the laws of Lebanon.",
      { h: "Questions" },
      "Message Eixn on the 6SLOT Discord.",
    ],
  },

  refund: {
    title: "Refund & Cancellation",
    intro: "We want you to try 6SLOT without risk. Here's exactly how refunds and cancelling work.",
    body: [
      { h: "Your first session is risk-free" },
      "Join, attend your first live session, and if 6SLOT isn't for you, ask for a refund before your second session. No questions asked. Message Eixn on Discord to ask.",
      "Refunds go back through PayPal, to the card or PayPal account you paid with. PayPal keeps its own processing fee when a payment is refunded, so that fee (usually around $1 on a $19 payment) comes off the refund.",
      { h: "Cancelling" },
      "You can cancel anytime. If you're on a monthly subscription, cancel it in your PayPal account (Settings, then Payments, then Manage automatic payments) and you won't be charged again. You keep access until the end of the month you've paid for.",
      "Months after your first aren't refunded, but you're never charged again once you cancel.",
      { h: "Founder price" },
      "Founders keep $19 a month for as long as their membership stays active. If a founder cancels, the founder price is gone for good, and rejoining is at the regular price.",
      { h: "Removed members" },
      "If you're removed for breaking the rules in our Terms of Service, the current month isn't refunded.",
    ],
  },

  privacy: {
    title: "Privacy",
    intro: `This page explains what information 6SLOT collects, why, and what you can do about it. 6SLOT is run by ${OWNER}, a sole proprietor based in Lebanon. We don't sell your information to anyone.`,
    body: [
      { h: "What we collect" },
      "When you pay: PayPal shares your name, email, the plan you chose and the payment status with us. We never see your card or bank details.",
      "When you join: the onboarding form asks things like your email, Discord username, rank and goals, so Eixn can give you access and plan sessions.",
      "When you use a free tool: if you leave your Discord username, we save it with your result, so Eixn can follow up with you about it.",
      "When you visit the site: we count visits with Umami, a privacy-friendly tool. It uses no cookies and doesn't identify you. We only see totals, like how many people visited a page or clicked a button, and which country or website they came from.",
      "Saved only on your device: some tools remember things in your own browser (like your hero list in the Counter Picker or your past test results). That never reaches us.",
      { h: "Why we use it" },
      "To run your membership and Discord access, to keep the member and founder counts and the Battle Pass up to date, to run giveaways and contact winners, to follow up on free-tool results, and to improve the site.",
      { h: "Who helps us" },
      "We use a few trusted services to run 6SLOT: PayPal (payments), Supabase (our database), Google Forms (the onboarding form), Discord (the community), Umami (visit counts) and our website host. They only handle your information to provide their service to us.",
      { h: "How long we keep it" },
      "Member information is kept while you're a member, and up to 2 years after, for payment and tax records. Free-tool sign-ups are kept for up to 12 months. You can ask us to delete your information sooner.",
      { h: "Your choices" },
      "You can ask to see, correct or delete the information we have about you. Message Eixn on the 6SLOT Discord and we'll reply within 30 days. Payment records PayPal keeps are covered by PayPal's own privacy policy.",
      { h: "Members under 18" },
      "Members aged 13 to 17 need a parent or guardian's permission to join. A parent or guardian can ask us to see or delete their child's information at any time.",
      { h: "Changes" },
      "If we change how we use your information, we update this page and the date at the top, and announce important changes in Discord.",
    ],
  },

  giveaway: {
    title: "Giveaway Rules",
    intro: `These rules cover every 6SLOT giveaway and award, including the Battle Pass. The organizer is 6SLOT, run by ${OWNER}, based in Lebanon.`,
    body: [
      { h: "Who can win" },
      "Every member with an active, paid membership on the day of a draw is entered automatically. You don't need to do anything, and there's one entry per person. Cancelled, paused or unpaid memberships aren't entered.",
      "Members under 18 can win, but a parent or guardian has to agree before the prize is handed over, and for physical prizes, give the shipping address. People who run 6SLOT can't win.",
      { h: "Battle Pass levels" },
      "Each level unlocks when 6SLOT reaches its member goal (25, 50, 75 and 100 active paid members). Once a level unlocks, it stays unlocked, even if the member count drops later. The rewards for everyone and the prizes for each level are the ones shown on the Battle Pass page.",
      { h: "How winners are drawn" },
      "Prize draws are random. Eixn draws winners from the list of active members, using a random picker, live on Discord. Winners are announced in Discord the same day.",
      { h: "Monthly awards" },
      "Climber of the Month and Comeback of the Month aren't random. Eixn picks the winner each month: for Climber of the Month, the member who climbed the most MMR, checked with screenshots or a public match profile; for Comeback of the Month, a member working through a losing streak. Eixn's decision is final.",
      { h: "Claiming a prize" },
      "Winners have 14 days to reply to Eixn on Discord. If a winner doesn't reply in time, or can't receive the prize, a new winner is drawn.",
      "Coaching sessions must be booked within 3 months of winning. Free months are applied by skipping your next payments, or as a refund if you've already paid. Prizes can't be swapped for cash or passed to someone else. If a prize becomes unavailable, we replace it with one of equal or higher value.",
      { h: "The Aegis replica" },
      "The Aegis prize is a full-size fan replica. It isn't made or endorsed by Valve. We ship it free to the winner's chosen address. Any import taxes or customs fees in the winner's country are paid by the winner. If we can't ship to a country, we agree another solution with the winner.",
      { h: "Winners' names" },
      "We share winners' Discord usernames in Discord and on the site. Tell us if you'd prefer your name not to be shown.",
      { h: "Other rules" },
      "Giveaways are void where the law doesn't allow them. We can change or cancel a giveaway if something outside our control requires it; if that happens, we explain why in Discord. Taxes on prizes, if any apply where you live, are the winner's responsibility.",
    ],
  },
};

const OTHERS: { slug: string; label: string }[] = [
  { slug: "terms", label: "Terms of Service" },
  { slug: "refund", label: "Refund & Cancellation" },
  { slug: "privacy", label: "Privacy" },
  { slug: "giveaway", label: "Giveaway Rules" },
];

export function Policy() {
  const { slug } = useParams();
  const policy = slug ? POLICIES[slug] : undefined;
  usePageTitle(policy?.title ?? "Policies");
  if (!policy) return <Navigate to="/" replace />;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="section-heading">{policy.title}</h1>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-text-muted">Last updated {UPDATED}</p>
        <p className="mt-6 text-lg leading-relaxed text-text">{policy.intro}</p>
        <div className="mt-6 space-y-4 leading-relaxed text-text-muted">
          {policy.body.map((b, i) =>
            typeof b === "string" ? (
              <p key={i}>{b}</p>
            ) : (
              <h2 key={i} className="pt-4 text-lg font-extrabold text-text">
                {b.h}
              </h2>
            ),
          )}
        </div>
        <p className="mt-10 border-t border-navy-border pt-6 text-sm text-text-muted">
          Questions?{" "}
          <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="font-bold text-gold hover:underline">
            Message Eixn on Discord
          </a>
          .
        </p>
        <nav aria-label="Other policies" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {OTHERS.filter((o) => o.slug !== slug).map((o) => (
            <Link key={o.slug} to={`/policies/${o.slug}`} className="text-text-muted underline underline-offset-2 hover:text-text">
              {o.label}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
