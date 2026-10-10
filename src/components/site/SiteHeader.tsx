import { WideContainer } from "@/components/layout/Container";
import { Logo } from "@/components/site/Logo";
import { CtaButton } from "@/components/site/CtaButton";

/**
 * Header has NO navigation links on purpose (brief §2): just the logo and a Join
 * button, so nothing pulls visitors away before they join.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-border/70 bg-navy/85 backdrop-blur-md">
      <WideContainer className="flex h-16 items-center justify-between">
        <Logo withTagline />
        <CtaButton className="!px-5 !py-2.5">Join</CtaButton>
      </WideContainer>
    </header>
  );
}
