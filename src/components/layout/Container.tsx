import type { ReactNode } from "react";

/**
 * Shared max-width/padding wrapper. Layout.tsx's <main> is intentionally full
 * width (no max-width/padding) so pages like Home can render full-bleed
 * sections (the cinematic video hero); everything else opts into the
 * constrained width via this component instead.
 */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>;
}

/**
 * Near full-width wrapper for the header and the sales-page hero, so wide desktop
 * screens don't get big empty gutters. Side padding grows with the window.
 */
export function WideContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-[clamp(2.5rem,6vw,7.5rem)] ${className}`}>
      {children}
    </div>
  );
}
