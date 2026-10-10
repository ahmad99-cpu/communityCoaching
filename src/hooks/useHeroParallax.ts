import { useEffect, type RefObject } from "react";

/**
 * Gentle scroll parallax for the hero portrait, same as eixn-dota.com: writes
 * --parallax-y (12% of the scroll distance, capped at one screen) on `ref`.
 * One rAF-throttled style write per frame, no React re-renders, and nothing at all
 * for visitors who prefer reduced motion.
 */
export function useHeroParallax(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const write = () => {
      frame = 0;
      const y = Math.min(window.scrollY, window.innerHeight || 800) * 0.12;
      el.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    write();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref]);
}
