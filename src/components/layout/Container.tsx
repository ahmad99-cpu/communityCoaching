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
