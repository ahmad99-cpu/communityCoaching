import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { WideContainer } from "@/components/layout/Container";
import { Logo } from "@/components/site/Logo";
import { CtaButton } from "@/components/site/CtaButton";
import { Icon, type IconName } from "@/components/site/Icons";

/**
 * The free tools: the second reason to visit. `isNew` gets the NEW tag, and on wide screens also its
 * own link in the header (the spotlight moves to whichever tool launched last).
 */
const TOOLS: { to: string; label: string; body: string; icon: IconName; isNew?: boolean }[] = [
  { to: "/counter-picker", label: "Counter Picker", body: "What to pick against any draft", icon: "crosshair", isNew: true },
  { to: "/how-built-are-you", label: "How Built Are You?", body: "Find your weakest slot in 2 minutes", icon: "hexagon" },
];
/** Shown in the menu, greyed out and not clickable, so people know what's coming. */
const TOOLS_SOON: { label: string; body: string; icon: IconName }[] = [
  { label: "Patch Summary", body: "Every patch in 2 minutes", icon: "calendar" },
  { label: "Player Report", body: "Your report card from your Dota ID", icon: "clipboard" },
  { label: "Lane Combos", body: "The duos that win their lane", icon: "users" },
  { label: "Item Builds", body: "What to buy against them", icon: "shield" },
  { label: "Eixn's Tier List", body: "Eixn ranks every hero, each patch", icon: "star" },
];
const SPOTLIGHT = TOOLS.find((t) => t.isNew);

const linkClass = (active: boolean) =>
  `flex items-center gap-1.5 rounded-control px-2 py-2.5 text-sm font-bold transition hover:text-gold sm:px-3 ${
    active ? "text-gold" : "text-text"
  }`;

function NewTag() {
  return (
    <span className="rounded bg-gold px-1 py-px text-[9px] font-black uppercase leading-tight tracking-wider text-navy">
      New
    </span>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = TOOLS.some((t) => pathname.startsWith(t.to));

  // Close on navigation, on a click outside, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={linkClass(active || open)}
      >
        <Icon name="grid" className="h-4 w-4 text-gold" />
        Free tools
        <Icon name="chevron" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="fixed inset-x-4 top-16 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-card border border-navy-border bg-navy-raised p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px]"
        >
          {/* Phones only: on wider screens the Battle Pass has its own link in the header */}
          <Link
            to="/battle-pass"
            role="menuitem"
            className="mb-1 flex items-center gap-3 rounded-control border border-gold/30 bg-gold/5 p-2.5 transition hover:bg-gold/10 sm:hidden"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gold text-navy">
              <Icon name="trophy" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-gold">Battle Pass</span>
              <span className="block text-xs text-text-muted">Unlock rewards together, up to the Aegis</span>
            </span>
          </Link>

          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              role="menuitem"
              // The spotlight tool has its own header link on wide screens, so it isn't listed twice.
              className={`flex items-center gap-3 rounded-control p-2.5 transition hover:bg-navy ${t.isNew ? "lg:hidden" : ""}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-gold/30 bg-gold/10 text-gold">
                <Icon name={t.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-text">
                  {t.label}
                  {t.isNew && <NewTag />}
                </span>
                <span className="block text-xs text-text-muted">{t.body}</span>
              </span>
            </Link>
          ))}

          <div className="mt-1 border-t border-navy-border pt-1">
            <p className="px-2.5 pb-0.5 pt-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
              Coming soon
            </p>
            {TOOLS_SOON.map((t) => (
              <div
                key={t.label}
                role="menuitem"
                aria-disabled="true"
                className="flex cursor-default items-center gap-3 rounded-control px-2.5 py-2 opacity-55"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-dashed border-navy-border text-text-muted">
                  <Icon name={t.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-text">{t.label}</span>
                  <span className="block text-xs text-text-muted">{t.body}</span>
                </span>
                <Icon name="lock" className="h-3.5 w-3.5 text-text-muted" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Header: the logo, Free tools, the newest tool (wide screens), the Battle Pass and Join. Kept short on
 * purpose: nothing else pulls visitors away before they join.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-border/70 bg-navy/85 backdrop-blur-md">
      <WideContainer className="flex h-16 items-center justify-between gap-2">
        <Logo withTagline />
        <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
          <ToolsMenu />
          {SPOTLIGHT && (
            <NavLink to={SPOTLIGHT.to} className={({ isActive }) => `hidden lg:flex ${linkClass(isActive)}`}>
              <Icon name={SPOTLIGHT.icon} className="h-4 w-4 text-gold" />
              {SPOTLIGHT.label}
              <NewTag />
            </NavLink>
          )}
          {/* Phones find the Battle Pass inside Free tools. */}
          <NavLink to="/battle-pass" className={({ isActive }) => `hidden sm:flex ${linkClass(isActive)}`}>
            <Icon name="trophy" className="h-4 w-4 text-gold" />
            Battle Pass
          </NavLink>
          <CtaButton className="!px-4 !py-2.5 sm:!px-5">Join</CtaButton>
        </div>
      </WideContainer>
    </header>
  );
}
