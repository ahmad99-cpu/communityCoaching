import front from "@/assets/aegis-front.webp";

/**
 * The Aegis, front view, with a gold glow and a light sweep across the metal every few seconds.
 * Plain CSS (index.css). The sweep stops for reduced-motion users.
 */
export function AegisEmblem({ className = "" }: { className?: string }) {
  return (
    <div className={`aegis-emblem ${className}`}>
      <img src={front} alt="" width={364} height={364} loading="lazy" decoding="async" className="h-full w-full" />
      {/* Sweep masked to the shield's own shape, so the light only touches the metal. */}
      <span
        aria-hidden
        className="aegis-emblem__shine"
        style={{ maskImage: `url(${front})`, WebkitMaskImage: `url(${front})` }}
      />
    </div>
  );
}
