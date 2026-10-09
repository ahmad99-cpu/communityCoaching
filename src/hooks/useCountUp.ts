import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` using requestAnimationFrame, starting
 * only once `start` flips true (driven by Framer Motion's useInView on the
 * caller side) so the count-up plays when the stat scrolls into view instead
 * of immediately on mount.
 */
export function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!start || playedRef.current) return;
    playedRef.current = true;

    let raf: number;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic — quick start, gentle settle.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}
