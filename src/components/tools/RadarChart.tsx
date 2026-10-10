import { motion } from "framer-motion";
import { fmt } from "@/components/tools/wheelData";

const SIZE = 560;
const CX = SIZE / 2;
const CY = 250;
const R = 150;

/** Slot i sits at the top and goes clockwise. */
function point(i: number, value: number) {
  const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6;
  const r = (value / 10) * R;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)] as const;
}

function polygon(values: number[]) {
  return values.map((v, i) => point(i, v).join(",")).join(" ");
}

/** Splits "Map Movement & Positioning" into two lines at the "&". */
function labelLines(name: string) {
  const parts = name.split(" & ");
  return parts.length === 2 ? [`${parts[0]} &`, parts[1]] : [name];
}

/**
 * Six-sided wheel (brief §5 result screen):
 * - dashed gold outline = fully built (10 everywhere)
 * - filled gold shape = now
 * - faint outline = previous result (monthly retake)
 */
export function RadarChart({
  names,
  slots,
  previous,
  weakestIndex,
}: {
  /** The 6 slot names, in order. */
  names: string[];
  slots: number[];
  previous?: number[];
  weakestIndex: number;
}) {
  return (
    <svg viewBox={`0 0 ${SIZE} 500`} className="mx-auto w-full max-w-xl" role="img" aria-label="Your 6SLOT wheel">
      {/* grid rings */}
      {[2.5, 5, 7.5].map((v) => (
        <polygon key={v} points={polygon(Array(6).fill(v))} fill="none" stroke="#24324A" strokeWidth="1" />
      ))}
      {names.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#24324A" strokeWidth="1" />;
      })}

      {/* fully built */}
      <polygon points={polygon(Array(6).fill(10))} fill="none" stroke="#E8B54A" strokeWidth="2" strokeDasharray="7 6" opacity="0.8" />

      {/* previous result */}
      {previous && (
        <polygon points={polygon(previous)} fill="none" stroke="#8FA0B5" strokeWidth="1.5" opacity="0.55" strokeDasharray="2 4" />
      )}

      {/* now */}
      <motion.polygon
        points={polygon(slots)}
        fill="rgba(232,181,74,0.35)"
        stroke="#E8B54A"
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />
      {slots.map((v, i) => {
        const [x, y] = point(i, v);
        return <circle key={i} cx={x} cy={y} r="4" fill="#E8B54A" />;
      })}

      {/* labels */}
      {names.map((name, i) => {
        const [x, y] = point(i, 13.6);
        const anchor = Math.abs(x - CX) < 4 ? "middle" : x > CX ? "start" : "end";
        const lines = labelLines(name);
        const gap = 10 - slots[i];
        const weakest = i === weakestIndex;
        const lineH = 17;
        const top = y - ((lines.length + 1) * lineH) / 2 + 12;
        return (
          <text key={i} x={x} y={top} textAnchor={anchor} fontFamily="Montserrat, sans-serif">
            {lines.map((line, li) => (
              <tspan key={li} x={x} dy={li === 0 ? 0 : lineH} fontSize="14" fontWeight="700" fill={weakest ? "#E8B54A" : "#F5F5F5"}>
                {line}
              </tspan>
            ))}
            <tspan x={x} dy={lineH + 2} fontSize="13" fontWeight="600" fill="#8FA0B5">
              {fmt(slots[i])}/10{gap > 0 ? ` · +${fmt(gap)}` : " · built"}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
