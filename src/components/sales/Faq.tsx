import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";

const FAQS: { q: string; a: React.ReactNode }[] = [
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
    a: (
      <>
        Guides show you what good players do. They don't show you what <em>you're</em> doing wrong. 6SLOT breaks down
        real member replays, then you practice the fix live in drills. Watching teaches you, practicing changes your
        games.
      </>
    ),
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
];

function Item({ q, a, open, onToggle }: { q: string; a: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-navy-border">
      <button
        className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold text-text transition hover:text-gold-light"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy-border text-text-muted transition-transform ${open ? "rotate-45" : ""}`}
          aria-hidden
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-text-muted sm:text-base">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-navy-border py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="section-heading text-center">Questions</h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-3xl border-t border-navy-border">
          {FAQS.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </Container>
    </section>
  );
}
