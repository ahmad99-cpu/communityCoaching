import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/site/Logo";
import { SocialIcon } from "@/components/site/SocialIcon";
import { site } from "@/config/site";

const FREE_TOOLS = [
  { label: "How Built Are You?", to: "/how-built-are-you" },
  { label: "Position Test", to: "/position-test" },
  { label: "Counter Picker", to: "/counter-picker", isNew: true },
];

const COMMUNITY = [{ label: "Battle Pass", to: "/battle-pass" }];

// Free tools for every Dota player, launching around the 6SLOT launch.
const COMING_SOON = ["Patch Summary", "Player Report", "Lane Combos", "Item Builds", "Eixn's Tier List"];

const POLICIES = [
  { label: "Terms of Service", to: "/policies/terms" },
  { label: "Refund & Cancellation", to: "/policies/refund" },
  { label: "Privacy", to: "/policies/privacy" },
  { label: "Giveaway Rules", to: "/policies/giveaway" },
];

function Column({ title, className = "", children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold/80">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function LinkList({ links }: { links: { label: string; to: string; isNew?: boolean }[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="group inline-flex items-center gap-2 text-text/80 transition hover:text-gold">
            <span>{l.label}</span>
            {l.isNew && (
              <span className="rounded-full border border-gold/50 bg-gold/10 px-1.5 py-px text-[9px] font-black uppercase tracking-wider text-gold">
                New
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Site footer. Phones: brand block, then the links in two columns and "coming soon" as tags,
 * so it stays short. Desktop: brand on the left, four link columns on the right.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-navy-border bg-navy-raised/40">
      {/* Gold hairline and a soft glow along the top edge. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[42rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(232,181,74,0.10),transparent_70%)]"
      />

      <Container className="relative pb-8 pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-16">
          {/* Brand */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 font-display text-lg font-bold text-text">Get fully built.</p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              Weekly Dota 2 group coaching with Eixn. One topic a week, practiced together.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {site.links.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-border bg-navy/60 text-text-muted transition hover:-translate-y-0.5 hover:border-gold/60 hover:text-gold hover:shadow-[0_0_18px_-4px_rgba(232,181,74,0.5)]"
                >
                  <SocialIcon name={s.icon} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Links: 2 columns on phones, 4 on wider screens. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            <Column title="Free tools">
              <LinkList links={FREE_TOOLS} />
            </Column>
            <Column title="Community">
              <LinkList links={COMMUNITY} />
            </Column>
            <Column title="Policies">
              <LinkList links={POLICIES} />
            </Column>
            <Column title="Coming soon">
              <ul className="flex flex-wrap gap-1.5">
                {COMING_SOON.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-dashed border-navy-border px-2.5 py-1 text-xs text-text-muted/70"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </Column>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-navy-border pt-6 text-xs leading-relaxed text-text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>&copy; {new Date().getFullYear()} 6SLOT. All rights reserved.</p>
          <p className="text-text-muted/70 sm:text-right">
            Not affiliated with or endorsed by Valve Corporation. Dota 2 and its game assets are property of Valve.
          </p>
        </div>
      </Container>
    </footer>
  );
}
