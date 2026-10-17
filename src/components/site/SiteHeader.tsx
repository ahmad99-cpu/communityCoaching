import { WideContainer } from "@/components/layout/Container";
import { Logo } from "@/components/site/Logo";
import { NavLink } from "react-router-dom";
import { CtaButton } from "@/components/site/CtaButton";
import { Icon } from "@/components/site/Icons";

/**
 * Header stays minimal (brief §2): the logo, one Battle Pass tab (so nobody misses the
 * giveaways) and the Join button. Nothing else pulls visitors away before they join.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-border/70 bg-navy/85 backdrop-blur-md">
      <WideContainer className="flex h-16 items-center justify-between">
        <Logo withTagline />
        <div className="flex items-center gap-1 sm:gap-3">
          <NavLink
            to="/battle-pass"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-control px-2.5 py-2.5 text-sm font-bold transition hover:text-gold sm:px-3 ${
                isActive ? "text-gold" : "text-text"
              }`
            }
          >
            <Icon name="trophy" className="h-4 w-4 text-gold" />
            Battle Pass
          </NavLink>
          <CtaButton className="!px-5 !py-2.5">Join</CtaButton>
        </div>
      </WideContainer>
    </header>
  );
}
