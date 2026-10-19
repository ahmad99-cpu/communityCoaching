/** Wheel and car geometry shared by the animated RollingCar and the Discord share card. */

const SAMPLES = 180;
export const WHEEL_R = 35;

/** The smallest a slot can make the wheel (share of full size), so the axle always has a rim. */
const MIN_SHARE = 0.15;

/**
 * Wheel radius at angle φ, built from the six slot scores so the wheel is the player's radar
 * shape: each slot is one spoke, as long as its score (10/10 = full size), and the rim runs
 * straight from spoke to spoke like the radar chart. The better two neighbouring slots are, the
 * more the rim between them bows out into a circle, so a fully built wheel (all 10s) is round
 * and rolls flat, while weak slots leave a small, jagged wheel that bumps along (brief §5).
 */
export function buildProfile(slots: number[]) {
  const radii = slots.map((s) => WHEEL_R * Math.max(MIN_SHARE, Math.min(10, Math.max(0, s)) / 10));
  const step = Math.PI / 3;
  const pts: { angle: number; r: number }[] = [];
  for (let k = 0; k < SAMPLES; k++) {
    const angle = (k / SAMPLES) * Math.PI * 2;
    const seg = angle / step;
    const i = Math.floor(seg) % 6;
    const j = (i + 1) % 6;
    const t = seg - Math.floor(seg);
    const ri = radii[i];
    const rj = radii[j];
    // Straight rim between the two spoke tips (exactly the radar's edge), at this angle.
    const chord = (ri * rj * Math.sin(step)) / (ri * Math.sin(t * step) + rj * Math.sin((1 - t) * step));
    // Round rim: the spoke lengths blended smoothly along the arc.
    const ease = (1 - Math.cos(t * Math.PI)) / 2;
    const arc = ri + (rj - ri) * ease;
    // Strong neighbours bow the rim out into a circle; weak ones keep the radar's straight edge.
    const bow = (Math.min(ri, rj) / WHEEL_R) ** 2;
    pts.push({ angle, r: chord + (arc - chord) * bow });
  }
  return { pts, radii };
}

/** Distance from wheel centre to the road (lowest point) at rotation θ. */
export function contactHeight(pts: { angle: number; r: number }[], theta: number) {
  let max = 0;
  for (const p of pts) {
    const y = p.r * Math.sin(p.angle + theta);
    if (y > max) max = y;
  }
  return max;
}

export interface CartPart {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** Dash pattern, e.g. "3 3". */
  dash?: string;
}

const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;

/**
 * One wheel, shaped by the player's result: the player's radar shape as the gold rim, six spokes
 * (one per slot, slot 1 at the top like the radar) and a hub. Local coords, centred
 * on the axle; callers rotate it as it rolls.
 */
export function wheelParts(slots: number[]): CartPart[] {
  const { pts, radii } = buildProfile(slots);
  const corner = (i: number) => -Math.PI / 2 + (i * Math.PI) / 3;
  const outline = (scale: number) =>
    pts.map((p, k) => `${k === 0 ? "M" : "L"}${pt(p.r * scale, p.angle - Math.PI / 2)}`).join(" ") + "Z";
  const spokes = radii.map((r, i) => `M0,0 L${pt(r * 0.96, corner(i))}`).join(" ");
  return [
    { d: outline(1), fill: "#1C2A3C", stroke: "#E8B54A", strokeWidth: 3 },
    { d: spokes, stroke: "#E8B54A", strokeWidth: 2, opacity: 0.75 },
    { d: "M4,0 A4 4 0 1 0 -4,0 A4 4 0 1 0 4,0 Z", fill: "#E8B54A" },
    { d: "M1.5,0 A1.5 1.5 0 1 0 -1.5,0 A1.5 1.5 0 1 0 1.5,0 Z", fill: "#0E1724" },
  ];
}

/** Rear and front axle x positions; the cart body is drawn around them. */
export const REAR_X = 150;
export const FRONT_X = 330;

/**
 * Siege cart (our own catapult-on-wheels, a nod to Dota's siege creep, not Valve's art) for a
 * road at `roadY`, facing right (direction of travel), arm cocked back with a boulder.
 * Shared by the animated RollingCar and the Discord share card so both look identical.
 */
export function siegeCartParts(roadY: number): CartPart[] {
  const a = roadY - WHEEL_R; // axle height
  const WOOD = "#C4932F";
  const GOLD = "#E8B54A";
  const NAVY = "#0E1724";
  return [
    // rope from the arm down to the back post
    { d: `M132 ${a - 101} L102 ${a - 32}`, stroke: "#F5F5F5", strokeWidth: 1.5, opacity: 0.45 },
    // back post
    { d: `M94 ${a - 18} L94 ${a - 34} L110 ${a - 34} L110 ${a - 18} Z`, fill: WOOD },
    // bed
    { d: `M90 ${a - 2} L90 ${a - 20} L400 ${a - 20} L400 ${a - 2} Z`, fill: WOOD },
    { d: `M90 ${a - 11} L400 ${a - 11}`, stroke: NAVY, strokeWidth: 1.5, opacity: 0.35 },
    // ram on the front
    { d: `M400 ${a - 22} L420 ${a - 15} L420 ${a - 7} L400 ${a}  Z`, fill: GOLD },
    // A-frame
    { d: `M198 ${a - 20} L240 ${a - 70} L282 ${a - 20} L266 ${a - 20} L240 ${a - 50} L214 ${a - 20} Z`, fill: GOLD },
    // counterweight hanging under the short end of the arm
    { d: `M256 ${a - 56} L280 ${a - 56} L280 ${a - 36} L256 ${a - 36} Z`, fill: WOOD },
    // throwing arm, cocked back
    { d: `M127 ${a - 108} L265 ${a - 60} L262 ${a - 51} L124 ${a - 99} Z`, fill: GOLD },
    // pivot
    { d: `M247 ${a - 66} A7 7 0 1 0 233 ${a - 66} A7 7 0 1 0 247 ${a - 66} Z`, fill: NAVY, stroke: GOLD, strokeWidth: 3 },
    // bucket
    { d: `M106 ${a - 112} Q112 ${a - 92} 136 ${a - 98} L132 ${a - 106} Q118 ${a - 102} 116 ${a - 114} Z`, fill: WOOD },
    // boulder
    { d: `M131 ${a - 116} A11 11 0 1 0 109 ${a - 116} A11 11 0 1 0 131 ${a - 116} Z`, fill: "#8FA0B5" },
    { d: `M118 ${a - 121} A4 4 0 1 0 110 ${a - 121} A4 4 0 1 0 118 ${a - 121} Z`, fill: "#F5F5F5", opacity: 0.35 },
  ];
}

/**
 * Creep silhouettes (our own simple shapes, not Valve's models) for the wave that runs ahead
 * of the cart. Origin is between the feet on the road, facing right; about 40 units tall.
 */
export function creepParts(kind: "melee" | "ranged"): CartPart[] {
  const BODY = "#5B6B82";
  const LIGHT = "#8FA0B5";
  const GOLD = "#E8B54A";
  if (kind === "ranged") {
    return [
      // staff + glowing orb
      { d: "M9 -1 L11 -38", stroke: "#C4932F", strokeWidth: 2.5 },
      { d: "M15 -40 A4 4 0 1 0 7 -40 A4 4 0 1 0 15 -40 Z", fill: GOLD },
      // robe and hood
      { d: "M-9 0 L9 0 L5 -25 L-5 -25 Z", fill: BODY },
      { d: "M5 -29 A5.5 5.5 0 1 0 -6 -29 A5.5 5.5 0 1 0 5 -29 Z", fill: LIGHT },
      { d: "M-4 -18 L6 -18", stroke: LIGHT, strokeWidth: 2, opacity: 0.6 },
    ];
  }
  return [
    // legs
    { d: "M-5 0 L-3 -11 M5 0 L3 -11", stroke: BODY, strokeWidth: 3.5 },
    // sword, raised behind
    { d: "M-6 -20 L-13 -36", stroke: LIGHT, strokeWidth: 2.5 },
    // torso
    { d: "M-7 -10 L7 -10 L9 -25 L-9 -25 Z", fill: BODY },
    // head
    { d: "M5 -30 A5 5 0 1 0 -5 -30 A5 5 0 1 0 5 -30 Z", fill: LIGHT },
    // shield in front
    { d: "M6 -26 Q17 -19 8 -9 Z", fill: "#C4932F" },
  ];
}

/** The wave: 3 melee then 1 ranged at the back, spaced along the road (x offsets in units). */
export const CREEP_WAVE: { kind: "melee" | "ranged"; dx: number }[] = [
  { kind: "ranged", dx: 0 },
  { kind: "melee", dx: 30 },
  { kind: "melee", dx: 58 },
  { kind: "melee", dx: 86 },
];

/**
 * How fast the wave pulls away from the cart, 0 (fully built: the cart keeps pace) to 1
 * (nothing built). Eased so even a decent build still visibly falls behind.
 */
export function waveLead(total: number) {
  return Math.min(Math.max(1 - total / 60, 0), 1) ** 0.8;
}
