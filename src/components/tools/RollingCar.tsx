import { useEffect, useMemo, useRef } from "react";
import {
  buildProfile,
  contactHeight,
  CREEP_WAVE,
  creepParts,
  FRONT_X,
  REAR_X,
  siegeCartParts,
  waveLead,
  wheelParts,
  WHEEL_R,
  type CartPart,
} from "@/components/tools/carGeometry";

function Wheel({ slots, groupRef }: { slots: number[]; groupRef: React.Ref<SVGGElement> }) {
  const parts = useMemo(() => wheelParts(slots), [slots]);
  return (
    <g ref={groupRef}>
      <Parts parts={parts} />
    </g>
  );
}

function Parts({ parts }: { parts: CartPart[] }) {
  return (
    <>
      {parts.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ?? "none"}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          opacity={p.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={p.dash}
        />
      ))}
    </>
  );
}

/** Scene bounds (SVG units): the road runs from X0 to X0 + W; creeps wrap around it. */
const X0 = -60;
const W = 820;
const WAVE_START = 470;
/** Creep spacing in scene units (the shapes are drawn 1.25× their base size). */
const CREEP_SPACING = 1.25;
/** Units per second the wave pulls away at waveLead = 1. */
const WAVE_SPEED = 120;

/**
 * A siege cart riding on wheels shaped like the player's result, with a creep wave running
 * ahead. Uneven wheel = bumpy ride; the lower the score, the faster the wave pulls away and
 * laps the cart; fully built = the cart keeps pace. Animated with rAF + direct DOM writes so it
 * doesn't re-render React 60 times a second.
 */
export function RollingCar({ slots }: { slots: number[] }) {
  const { pts, radii } = useMemo(() => buildProfile(slots), [slots]);
  const bodyRef = useRef<SVGGElement>(null);
  const rearRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const roadRef = useRef<SVGGElement>(null);
  const creepRefs = useRef<(SVGGElement | null)[]>([]);
  const lead = waveLead(slots.reduce((a, b) => a + b, 0));

  const ROAD_Y = 150;

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
      // The wave runs ahead and wraps round, so a slow cart gets lapped again and again.
      CREEP_WAVE.forEach((c, i) => {
        const x = X0 - 20 + ((((WAVE_START + c.dx * CREEP_SPACING + lead * WAVE_SPEED * t - X0 + 20) % (W + 40)) + W + 40) % (W + 40));
        const hop = -Math.abs(Math.sin(t * 9 + i * 1.3)) * 3;
        creepRefs.current[i]?.setAttribute("transform", `translate(${x.toFixed(1)},${(ROAD_Y + hop).toFixed(1)})`);
      });

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pts, radii, lead]);

  return (
    <svg
      viewBox={`${X0} -32 ${W} 212`}
      className="mx-auto w-full"
      role="img"
      aria-label="A siege cart rolling on wheels shaped like your result, with a creep wave running ahead"
    >
      {/* road */}
      <rect x={X0} y={ROAD_Y} width={W} height="30" fill="#16212F" />
      <line x1={X0} y1={ROAD_Y} x2={X0 + W} y2={ROAD_Y} stroke="#24324A" strokeWidth="2" />
      <g ref={roadRef}>
        {Array.from({ length: Math.ceil(W / 40) + 2 }, (_, i) => (
          <rect key={i} x={X0 + i * 40} y={ROAD_Y + 14} width="20" height="3" rx="1.5" fill="#8FA0B5" opacity="0.35" />
        ))}
      </g>

      {/* creep wave — drawn before the cart, so the cart passes in front when they overlap */}
      {CREEP_WAVE.map((c, i) => (
        <g key={i} ref={(el) => (creepRefs.current[i] = el)} transform={`translate(${WAVE_START + c.dx * CREEP_SPACING},${ROAD_Y})`}>
          <g transform="scale(1.25)">
            <Parts parts={creepParts(c.kind)} />
          </g>
        </g>
      ))}

      {/* body — drawn relative to an axle height of ROAD_Y - WHEEL_R */}
      <g ref={bodyRef}>
        <Parts parts={siegeCartParts(ROAD_Y)} />
        <text x="240" textAnchor="middle" y={ROAD_Y - WHEEL_R - 6} fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="11" fill="#0E1724">
          6SLOT
        </text>
      </g>

      <Wheel slots={slots} groupRef={rearRef} />
      <Wheel slots={slots} groupRef={frontRef} />
    </svg>
  );
}
