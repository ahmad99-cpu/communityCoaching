import {
  buildProfile,
  contactHeight,
  CREEP_WAVE,
  creepParts,
  CREW_GEAR,
  FOREMAN_ORDERS,
  FOREMAN_X,
  foremanParts,
  foremanStaffParts,
  FRONT_X,
  groundShieldParts,
  groundSwordParts,
  hammerAngle,
  hammerParts,
  hammerSwing,
  isBrokenDown,
  mechanicParts,
  orderBubble,
  REAR_X,
  REPAIR_CREW,
  siegeCartParts,
  waveLead,
  WHEEL_R,
  wheelParts,
  type CartPart,
} from "@/components/tools/carGeometry";
import { fmt } from "@/components/tools/wheelData";
import { encodeGif } from "@/lib/gifEncoder";

/**
 * Draws the square (1080×1080) Discord share card for a wheel result on a canvas. The hero is
 * the player's siege cart rolling on wheels shaped like their result; score, biggest gap and the
 * six slot scores sit underneath. Plain Canvas 2D, no library.
 */

const SIZE = 1080;
const NAVY = "#0E1724";
const RAISED = "#16212F";
const BORDER = "#24324A";
const GOLD = "#E8B54A";
const TEXT = "#F5F5F5";
const MUTED = "#8FA0B5";
const FONT = "Montserrat, sans-serif";

export interface ShareCardData {
  name: string;
  slotNames: string[];
  slots: number[];
  total: number;
  weakestIndex: number;
  /** e.g. "6slot.gg/how-built-are-you" */
  url: string;
}

function font(weight: number, px: number) {
  return `${weight} ${px}px ${FONT}`;
}

/** Draws `parts` of text side by side, centred on x, each with its own font and colour. */
function centredRun(ctx: CanvasRenderingContext2D, y: number, parts: { text: string; font: string; color: string }[]) {
  ctx.textAlign = "left";
  const widths = parts.map((p) => {
    ctx.font = p.font;
    return ctx.measureText(p.text).width;
  });
  let x = (SIZE - widths.reduce((a, b) => a + b, 0)) / 2;
  parts.forEach((p, i) => {
    ctx.font = p.font;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, x, y);
    x += widths[i];
  });
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const glow = ctx.createRadialGradient(540, 430, 0, 540, 430, 600);
  glow.addColorStop(0, "rgba(232,181,74,0.2)");
  glow.addColorStop(1, "rgba(232,181,74,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "rgba(143,160,181,0.05)";
  ctx.lineWidth = 1;
  for (let v = 54; v < SIZE; v += 54) {
    ctx.beginPath();
    ctx.moveTo(v, 0);
    ctx.lineTo(v, SIZE);
    ctx.moveTo(0, v);
    ctx.lineTo(SIZE, v);
    ctx.stroke();
  }

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(24, 24, SIZE - 48, SIZE - 48, 28);
  ctx.stroke();
}

function drawHeader(ctx: CanvasRenderingContext2D, name: string) {
  ctx.textAlign = "left";
  ctx.font = font(900, 52);
  ctx.fillStyle = GOLD;
  ctx.fillText("6", 72, 112);
  const six = ctx.measureText("6").width;
  ctx.fillStyle = TEXT;
  ctx.fillText("SLOT", 72 + six, 112);

  ctx.textAlign = "right";
  ctx.font = font(800, 20);
  ctx.fillStyle = GOLD;
  ctx.fillText("HOW BUILT ARE YOU?", SIZE - 72, 104);

  ctx.textAlign = "center";
  ctx.font = font(800, 40);
  ctx.fillStyle = TEXT;
  const label = `${name}'s build`;
  ctx.fillText(label.length > 34 ? `${label.slice(0, 33)}…` : label, SIZE / 2, 206);
}

/**
 * The hero: the siege cart on the player's wheels, big, with speed lines behind it.
 * `t` is animation progress 0–1 (one full wheel turn); 0 for the still image.
 */
/** Fills and strokes cart/creep parts in the current transform. */
function drawParts(ctx: CanvasRenderingContext2D, parts: CartPart[]) {
  ctx.lineCap = "round";
  for (const p of parts) {
    const path = new Path2D(p.d);
    ctx.globalAlpha = p.opacity ?? 1;
    if (p.fill) {
      ctx.fillStyle = p.fill;
      ctx.fill(path);
    }
    if (p.stroke) {
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = p.strokeWidth ?? 1;
      ctx.lineJoin = "round";
      ctx.setLineDash(p.dash ? p.dash.split(" ").map(Number) : []);
      ctx.stroke(path);
      ctx.setLineDash([]);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * The creep wave running ahead of the cart. In the GIF it laps across the card once per loop
 * (when the build has a real gap), so a slow cart visibly falls behind; a near-full build keeps
 * the wave beside it.
 */
function drawWave(ctx: CanvasRenderingContext2D, scale: number, oy: number, roadY: number, total: number, t: number) {
  const start = 690;
  const creepScale = scale * 1.25;
  const span = SIZE + 200;
  const laps = waveLead(total) > 0.15 ? 1 : 0;
  ctx.save();
  ctx.beginPath();
  ctx.rect(48, oy - 40, SIZE - 96, roadY - oy + 40);
  ctx.clip();
  CREEP_WAVE.forEach((c, i) => {
    const raw = start + c.dx * creepScale + laps * t * span;
    const x = ((((raw + 100) % span) + span) % span) - 100;
    const hop = -Math.abs(Math.sin(t * Math.PI * 2 * 6 + i * 1.3)) * 3 * creepScale;
    ctx.save();
    ctx.translate(x, roadY + hop);
    ctx.scale(creepScale, creepScale);
    drawParts(ctx, creepParts(c.kind));
    ctx.restore();
  });
  ctx.restore();
}

/**
 * Broken-down scene for the card: three melee creeps hammering at the wheels (gear on the road)
 * and the ranged creep giving orders, one order per quarter of the loop. Same layout as the page.
 */
function drawRepairCrew(ctx: CanvasRenderingContext2D, ROAD_Y: number, t: number) {
  for (const g of CREW_GEAR) {
    ctx.save();
    ctx.translate(g.x, ROAD_Y);
    ctx.scale(1.25, 1.25);
    drawParts(ctx, g.kind === "sword" ? groundSwordParts() : groundShieldParts());
    ctx.restore();
  }
  // ranged creep behind the cart, facing it, staff jabbing at the work
  ctx.save();
  ctx.translate(FOREMAN_X, ROAD_Y);
  ctx.scale(1.25, 1.25);
  drawParts(ctx, foremanParts());
  ctx.translate(6, -20);
  ctx.rotate(((55 + Math.sin(t * Math.PI * 2 * 3) * 12) * Math.PI) / 180);
  drawParts(ctx, foremanStaffParts());
  ctx.restore();
  // speech bubble
  ctx.save();
  ctx.translate(FOREMAN_X - 4, ROAD_Y - 70);
  const order = FOREMAN_ORDERS[Math.floor(t * FOREMAN_ORDERS.length) % FOREMAN_ORDERS.length];
  drawParts(ctx, [{ d: orderBubble(order), fill: "#F5F5F5" }]);
  ctx.font = font(900, 11);
  ctx.textAlign = "center";
  ctx.fillStyle = NAVY;
  ctx.fillText(order, 0, 6);
  ctx.restore();
  // the crew, swinging (four swings per loop so the GIF loops cleanly)
  REPAIR_CREW.forEach((m, i) => {
    const swing = hammerSwing(t * 4 + i * 0.6);
    ctx.save();
    ctx.translate(m.x, ROAD_Y);
    ctx.scale(m.flip ? -1.25 : 1.25, 1.25);
    drawParts(ctx, mechanicParts(m.shieldOnBack));
    ctx.save();
    ctx.translate(2, -22);
    ctx.rotate((hammerAngle(swing) * Math.PI) / 180);
    drawParts(ctx, hammerParts());
    ctx.restore();
    if (swing > 0.9) drawParts(ctx, [{ d: "M22 -10 L25 -16 M24 -8 L31 -11 M21 -6 L23 1", stroke: GOLD, strokeWidth: 1.8 }]);
    ctx.restore();
  });
}

function drawCart(ctx: CanvasRenderingContext2D, slots: number[], t: number) {
  const ROAD_Y = 150;
  const broken = isBrokenDown(slots);
  const scale = 1.7;
  // cart sits left (bed starts near the card's left edge) so the wave has room to run ahead;
  // broken down there is no wave, so it slides right to fit the ranged creep and its bubble behind
  const ox = 74 - 90 * scale + (broken ? 215 : 0);
  const oy = 250;
  const roadY = oy + ROAD_Y * scale;
  const { pts } = buildProfile(slots);
  // Broken down: the cart doesn't roll (no wheel turn, no road movement, no wave).
  const theta = broken ? 0 : t * Math.PI * 2;
  const axleY = ROAD_Y - contactHeight(pts, theta - Math.PI / 2);

  // road across the whole card
  ctx.fillStyle = RAISED;
  ctx.fillRect(48, roadY, SIZE - 96, 44);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(48, roadY);
  ctx.lineTo(SIZE - 48, roadY);
  ctx.stroke();
  ctx.fillStyle = "rgba(143,160,181,0.35)";
  // dashes move 3 gaps per loop, so the GIF loops without a jump
  const dash = broken ? 0 : (t * 240) % 80;
  ctx.save();
  ctx.beginPath();
  ctx.rect(48, roadY, SIZE - 96, 44);
  ctx.clip();
  for (let x = 30 - dash; x < SIZE - 40; x += 80) ctx.fillRect(x, roadY + 22, 40, 5);
  ctx.restore();

  if (!broken) drawWave(ctx, scale, oy, roadY, slots.reduce((sum, v) => sum + v, 0), t);

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // cart body, sitting on the wheels
  ctx.save();
  ctx.translate(0, axleY - (ROAD_Y - WHEEL_R));
  if (broken) {
    // tilted, like on the page: rotate -3° around the front axle
    ctx.translate(FRONT_X, ROAD_Y - WHEEL_R);
    ctx.rotate((-3 * Math.PI) / 180);
    ctx.translate(-FRONT_X, -(ROAD_Y - WHEEL_R));
  }
  drawParts(ctx, siegeCartParts(ROAD_Y));
  ctx.font = font(900, 11);
  ctx.textAlign = "center";
  ctx.fillStyle = NAVY;
  ctx.fillText("6SLOT", 240, ROAD_Y - WHEEL_R - 6);
  ctx.restore();

  // wheels: the player's own wheel chart
  const wheel = wheelParts(slots);
  for (const x of [REAR_X, FRONT_X]) {
    ctx.save();
    ctx.translate(x, axleY);
    ctx.rotate(theta);
    drawParts(ctx, wheel);
    ctx.restore();
  }
  if (broken) drawRepairCrew(ctx, ROAD_Y, t);
  ctx.restore();
}

function drawScore(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  centredRun(ctx, 690, [
    { text: fmt(d.total), font: font(900, 96), color: TEXT },
    { text: " /60 BUILT", font: font(800, 42), color: MUTED },
  ]);
  centredRun(
    ctx,
    738,
    d.slots.every((v) => v >= 10)
      ? [{ text: "Fully built. No gaps.", font: font(800, 28), color: GOLD }]
      : d.weakestIndex < 0
        ? [
            { text: "Even wheel: ", font: font(700, 28), color: MUTED },
            { text: `${fmt(d.slots[0])}/10 in every slot`, font: font(800, 28), color: GOLD },
          ]
        : [
          { text: "Biggest gap: ", font: font(700, 28), color: MUTED },
          { text: d.slotNames[d.weakestIndex], font: font(800, 28), color: GOLD },
        ],
  );
}

/** Six slot chips (2 columns × 3 rows, wide enough for full names); the biggest gap is outlined in gold. */
function drawSlots(ctx: CanvasRenderingContext2D, d: ShareCardData) {
  const cols = 2;
  const w = 452;
  const h = 58;
  const gap = 14;
  const x0 = (SIZE - cols * w - (cols - 1) * gap) / 2;
  const y0 = 772;
  d.slotNames.forEach((slotName, i) => {
    const x = x0 + (i % cols) * (w + gap);
    const y = y0 + Math.floor(i / cols) * (h + gap);
    const weakest = i === d.weakestIndex;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fillStyle = weakest ? "rgba(232,181,74,0.12)" : RAISED;
    ctx.fill();
    ctx.strokeStyle = weakest ? GOLD : BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = font(700, 21);
    ctx.fillStyle = weakest ? GOLD : TEXT;
    let label = slotName;
    while (ctx.measureText(label).width > w - 110 && label.length > 4) label = `${label.slice(0, -2)}…`;
    ctx.fillText(label, x + 18, y + h / 2 + 7);

    ctx.textAlign = "right";
    ctx.font = font(900, 26);
    ctx.fillStyle = TEXT;
    ctx.fillText(fmt(d.slots[i]), x + w - 52, y + h / 2 + 9);
    ctx.font = font(700, 17);
    ctx.fillStyle = MUTED;
    ctx.fillText("/10", x + w - 18, y + h / 2 + 8);
  });
}

function drawFooter(ctx: CanvasRenderingContext2D, url: string) {
  centredRun(ctx, 1036, [
    { text: "How built are you? Take the test: ", font: font(600, 22), color: MUTED },
    { text: url, font: font(800, 22), color: TEXT },
  ]);
}

async function loadFonts() {
  try {
    await Promise.all([document.fonts.load(font(900, 96)), document.fonts.load(font(700, 28)), document.fonts.load(font(600, 22))]);
  } catch {
    // Font API unavailable: canvas falls back to sans-serif, still readable.
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, data: ShareCardData, t: number) {
  drawBackground(ctx);
  drawHeader(ctx, data.name);
  drawCart(ctx, data.slots, t);
  drawScore(ctx, data);
  drawSlots(ctx, data);
  drawFooter(ctx, data.url);
}

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  return { canvas, ctx };
}

/** Renders the still card (1080×1080 PNG), for copy/paste and download. */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await loadFonts();
  const { canvas, ctx } = makeCanvas(SIZE);
  drawFrame(ctx, data, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/png"),
  );
}

/** Encodes in a Web Worker so the page keeps animating; falls back to this thread if workers fail. */
function encodeOffThread(frames: Uint8ClampedArray[], width: number, height: number, delayCs: number): Promise<Blob> {
  return new Promise((resolve) => {
    const fallback = () => resolve(encodeGif(frames.map((data) => ({ data })), width, height, delayCs));
    let worker: Worker;
    try {
      worker = new Worker(new URL("../../lib/gifWorker.ts", import.meta.url), { type: "module" });
    } catch {
      fallback();
      return;
    }
    worker.onmessage = (e: MessageEvent<Blob>) => {
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = () => {
      worker.terminate();
      fallback();
    };
    worker.postMessage({ frames, width, height, delayCs });
  });
}

/**
 * Renders the card as a looping GIF with the cart rolling (one wheel turn per loop), at
 * 540×540 to keep the file small; Discord autoplays GIFs in the channel. Frames are drawn one
 * at a time (yielding between them) and encoded in a worker, so the page never freezes.
 */
export async function renderShareGif(data: ShareCardData, frameCount = 36): Promise<Blob> {
  await loadFonts();
  const OUT = 540;
  const full = makeCanvas(SIZE);
  const small = makeCanvas(OUT);
  small.ctx.imageSmoothingQuality = "high";
  const frames: Uint8ClampedArray[] = [];
  for (let i = 0; i < frameCount; i++) {
    drawFrame(full.ctx, data, i / frameCount);
    small.ctx.drawImage(full.canvas, 0, 0, OUT, OUT);
    frames.push(small.ctx.getImageData(0, 0, OUT, OUT).data);
    await new Promise((r) => setTimeout(r, 0));
  }
  return encodeOffThread(frames, OUT, OUT, 8);
}
