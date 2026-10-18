import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/site/Logo";
import { SocialIcon } from "@/components/site/SocialIcon";
import { site } from "@/config/site";

const FREE_TOOLS = [
  { label: "How Built Are You?", to: "/how-built-are-you" },
  { label: "Position Test", to: "/position-test" },
  { label: "Counter Picker", to: "/counter-picker" },
];

const COMMUNITY = [{ label: "Battle Pass", to: "/battle-pass" }];

// Free tools for every Dota player, launching around the 6SLOT launch.
const COMING_SOON = ["Patch Summary", "Player Report", "Lane Combos", "Item Builds", "Eixn's Tier List"];

const POLICIES = [
  { label: "Refund & Cancellation", to: "/policies/refund" },
  { label: "Privacy", to: "/policies/privacy" },
  { label: "Giveaway Rules", to: "/policies/giveaway" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-border bg-navy-raised/40">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 text-sm font-semibold text-text">Get fully built.</p>
            <p className="mt-1 text-sm text-text-muted">Dota 2 group coaching with Eixn.</p>
            <div className="-ml-2.5 mt-5 flex gap-1">
              {site.links.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-navy-raised hover:text-text"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <Column title="Free tools">
            {FREE_TOOLS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-text transition hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="Community">
            {COMMUNITY.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-text transition hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="Coming soon">
            {COMING_SOON.map((label) => (
              <li key={label} className="text-text-muted/50">
                {label}
              </li>
            ))}
          </Column>

          <Column title="Policies">
            {POLICIES.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-text-muted transition hover:text-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
        </div>

        <p className="mt-12 border-t border-navy-border pt-6 text-xs leading-relaxed text-text-muted">
          Not affiliated with or endorsed by Valve Corporation. Dota 2 and its game assets are property of Valve.
        </p>
      </Container>
    </footer>
  );
}
