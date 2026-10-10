import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { useContent } from "@/lib/content";

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
  const { items } = useContent("faq");

  return (
    <section className="border-t border-navy-border py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="section-heading text-center">Questions</h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-3xl border-t border-navy-border">
          {items.map((f, i) => (
            <Item key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </Container>
    </section>
  );
}
