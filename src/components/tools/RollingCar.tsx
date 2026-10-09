import { useEffect, useMemo, useRef } from "react";

const SAMPLES = 180;
const WHEEL_R = 34;

/**
 * Wheel radius at angle φ, built from the six slot scores. Each slot sets the
 * radius of one corner of the hexagon; between corners we interpolate smoothly,
 * so a fully built wheel (all 10s) is a perfect circle and rolls flat, while a
 * low slot leaves a flat spot that makes the car bounce (brief §5 "The car").
 */
function buildProfile(slots: number[]) {
  const radii = slots.map((s) => WHEEL_R * (0.3 + 0.7 * Math.max(0, Math.min(10, s)) / 10));
  const pts: { angle: number; r: number }[] = [];
  for (let k = 0; k < SAMPLES; k++) {
    const angle = (k / SAMPLES) * Math.PI * 2;
    const seg = (angle / (Math.PI * 2)) * 6;
    const i = Math.floor(seg) % 6;
    const t = seg - Math.floor(seg);
    const ease = (1 - Math.cos(t * Math.PI)) / 2;
    pts.push({ angle, r: radii[i] + (radii[(i + 1) % 6] - radii[i]) * ease });
  }
  return { pts, radii };
}

/** Distance from wheel centre to the road (lowest point) at rotation θ. */
function contactHeight(pts: { angle: number; r: number }[], theta: number) {
  let max = 0;
  for (const p of pts) {
    const y = p.r * Math.sin(p.angle + theta);
    if (y > max) max = y;
  }
  return max;
}

function wheelPath(pts: { angle: number; r: number }[]) {
  return (
    pts.map((p, k) => `${k === 0 ? "M" : "L"}${(p.r * Math.cos(p.angle)).toFixed(2)},${(p.r * Math.sin(p.angle)).toFixed(2)}`).join(" ") + "Z"
  );
}

function Wheel({ pts, radii, groupRef }: { pts: { angle: number; r: number }[]; radii: number[]; groupRef: React.Ref<SVGGElement> }) {
  // Corners sit at -90° + i·60°, matching the radar chart orientation.
  const corners = radii.map((r, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  return (
    <g ref={groupRef}>
      <g transform="rotate(-90)">
        <path d={wheelPath(pts)} fill="#1C2A3C" stroke="#E8B54A" strokeWidth="3" strokeLinejoin="round" />
      </g>
      {corners.map(([x, y], i) => (
        <line key={i} x1="0" y1="0" x2={x * 0.8} y2={y * 0.8} stroke="#8FA0B5" strokeWidth="2" opacity="0.6" />
      ))}
      <circle r="5" fill="#E8B54A" />
    </g>
  );
}

/**
 * A car riding on wheels shaped like the player's result. Uneven wheel = bumpy
 * ride; fully built = smooth. Animated with rAF + direct DOM writes so it doesn't
 * re-render React 60 times a second.
 */
export function RollingCar({ slots }: { slots: number[] }) {
  const { pts, radii } = useMemo(() => buildProfile(slots), [slots]);
  const bodyRef = useRef<SVGGElement>(null);
  const rearRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const roadRef = useRef<SVGGElement>(null);

  const ROAD_Y = 150;
  const REAR_X = 150;
  const FRONT_X = 330;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
    const speed = 1.6; // rad/s
    let raf = 0;
    const start = performance.now();

    function frame(now: number) {
      const t = reduce ? 0 : (now - start) / 1000;
      const theta = t * speed;
      // The wheel path is drawn rotated -90° (slot 1 on top), so include that offset.
      const h = contactHeight(pts, theta - Math.PI / 2);
      const deg = (theta * 180) / Math.PI;
      const axleY = ROAD_Y - h;

      rearRef.current?.setAttribute("transform", `translate(${REAR_X},${axleY}) rotate(${deg})`);
      frontRef.current?.setAttribute("transform", `translate(${FRONT_X},${axleY}) rotate(${deg})`);
      bodyRef.current?.setAttribute("transform", `translate(0,${axleY - (ROAD_Y - WHEEL_R)})`);
      // Road dashes scroll at the wheel's average rolling speed.
      const offset = -((theta * meanR) % 40);
      roadRef.current?.setAttribute("transform", `translate(${offset},0)`);

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pts, radii]);

  return (
    <svg viewBox="0 0 480 180" className="mx-auto w-full max-w-xl" role="img" aria-label="A car rolling on wheels shaped like your result">
      {/* road */}
      <rect x="0" y={ROAD_Y} width="480" height="30" fill="#16212F" />
      <line x1="0" y1={ROAD_Y} x2="480" y2={ROAD_Y} stroke="#24324A" strokeWidth="2" />
      <g ref={roadRef}>
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={i * 40} y={ROAD_Y + 14} width="20" height="3" rx="1.5" fill="#8FA0B5" opacity="0.35" />
        ))}
      </g>

      {/* body — drawn relative to an axle height of ROAD_Y - WHEEL_R */}
      <g ref={bodyRef}>
        {/* Shape is drawn nose-left, so mirror it around the body's centre (x = 243.5) to face the direction of travel. */}
        <g transform="translate(487,0) scale(-1,1)">
        <path
          d={`M95 ${ROAD_Y - WHEEL_R - 4} L95 ${ROAD_Y - WHEEL_R - 34} Q100 ${ROAD_Y - WHEEL_R - 44} 120 ${ROAD_Y - WHEEL_R - 46}
              L190 ${ROAD_Y - WHEEL_R - 48} L230 ${ROAD_Y - WHEEL_R - 86} L320 ${ROAD_Y - WHEEL_R - 86}
              L360 ${ROAD_Y - WHEEL_R - 48} L380 ${ROAD_Y - WHEEL_R - 46} Q392 ${ROAD_Y - WHEEL_R - 40} 392 ${ROAD_Y - WHEEL_R - 26}
              L392 ${ROAD_Y - WHEEL_R - 4} Z`}
          fill="#E8B54A"
        />
        <path d={`M240 ${ROAD_Y - WHEEL_R - 78} L268 ${ROAD_Y - WHEEL_R - 78} L268 ${ROAD_Y - WHEEL_R - 52} L214 ${ROAD_Y - WHEEL_R - 52} Z`} fill="#0E1724" opacity="0.85" />
        <path d={`M278 ${ROAD_Y - WHEEL_R - 78} L316 ${ROAD_Y - WHEEL_R - 78} L340 ${ROAD_Y - WHEEL_R - 52} L278 ${ROAD_Y - WHEEL_R - 52} Z`} fill="#0E1724" opacity="0.85" />
        </g>
        {/* Text stays outside the mirror so it reads correctly; centred on the door panel between the wheels. */}
        <text x="240" textAnchor="middle" y={ROAD_Y - WHEEL_R - 16} fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="20" fill="#0E1724">
          6SLOT
        </text>
      </g>

      <Wheel pts={pts} radii={radii} groupRef={rearRef} />
      <Wheel pts={pts} radii={radii} groupRef={frontRef} />
    </svg>
  );
}
