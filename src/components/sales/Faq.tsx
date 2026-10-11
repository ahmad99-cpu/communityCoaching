import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { useContent } from "@/lib/content";
import { site } from "@/config/site";
import { SocialIcon } from "@/components/site/SocialIcon";

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
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
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-text-muted sm:text-base">{a}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Groups questions under their small title, in the order the groups first appear. */
function groupItems(items: { q: string; a: string; group?: string }[]) {
  const groups: { title: string; items: typeof items }[] = [];
  for (const item of items) {
    const title = item.group?.trim() || "More questions";
    let g = groups.find((x) => x.title === title);
    if (!g) groups.push((g = { title, items: [] }));
    g.items.push(item);
  }
  return groups;
}

export function Faq() {
  const { items } = useContent("faq");
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);
  const groups = groupItems(items);

  return (
    <section className="border-t border-navy-border py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Before you join</p>
            <h2 className="section-heading mt-3">FAQs</h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">{g.title}</p>
              <div className="mt-3 border-t border-navy-border">
                {g.items.map((f) => (
                  <Item key={f.q} q={f.q} a={f.a} open={open === f.q} onToggle={() => setOpen(open === f.q ? null : f.q)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <AskEixn />
      </Container>
    </section>
  );
}

/** "Still have a question?": Discord first (where the community lives), other inboxes as smaller buttons. */
function AskEixn() {
  const { discord, instagram, tiktok, facebook } = site.links.ask;
  const others = [
    { label: "Instagram", icon: "instagram", href: instagram },
    { label: "TikTok", icon: "tiktok", href: tiktok },
    { label: "Facebook", icon: "facebook", href: facebook },
  ].filter((o) => o.href);
  if (!discord && others.length === 0) return null;

  return (
    <Reveal className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 border-t border-navy-border pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="font-extrabold text-text">Still have a question?</p>
        <p className="mt-0.5 text-sm text-text-muted">Ask Eixn directly. You&apos;ll get a real answer, not a bot.</p>
      </div>
      <div className="flex items-center gap-2">
        {discord && (
          <a
            href={discord}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-control border border-gold/70 px-4 py-2.5 text-sm font-bold text-text transition hover:bg-gold hover:text-navy"
          >
            <SocialIcon name="discord" className="h-4 w-4" />
            Ask on Discord
          </a>
        )}
        {others.map((o) => (
          <a
            key={o.label}
            href={o.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Message Eixn on ${o.label}`}
            title={o.label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-border text-text-muted transition hover:border-gold hover:text-gold"
          >
            <SocialIcon name={o.icon} className="h-4 w-4" />
          </a>
        ))}
      </div>
    </Reveal>
  );
}
