import type { CSSProperties } from "react";

// Fixed (not random) so the burst looks the same every time and never re-shuffles on re-render.
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (i % 2 ? 0.12 : 0);
  const dist = 110 + ((i * 37) % 90);
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 30,
    r: (i * 47) % 360,
    delay: (i % 5) * 0.03,
    size: 6 + (i % 3) * 3,
    gold: i % 3 !== 0,
  };
});

/**
 * One-time gold burst for the result reveal (Tony Robbins' "this is your starting point" moment).
 * Pure CSS (.celebrate-particle in index.css); hidden for visitors who prefer reduced motion.
 */
export function Celebrate() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-0 w-0">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`celebrate-particle absolute rounded-[2px] ${p.gold ? "bg-gold" : "bg-text"}`}
          style={
            {
              width: p.size,
              height: p.size * 0.5,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.r}deg`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
