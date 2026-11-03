/**
 * Builds the Lane Combos data from STRATZ (laneOutcome: how each hero's lane goes, per lane partner
 * and per lane opponent, in real public matches, per rank bracket).
 *
 *   node scripts/build-lane-data.mjs
 *
 * Needs STRATZ_API_TOKEN (in .env or the environment), the same token as the Counter Picker data.
 * Runs every Monday from .github/workflows/counter-data.yml, after the Counter Picker data.
 *
 * Each hero is measured in each role it's really played in (positions with at least MIN_SHARE% of its
 * games, from public/data/matchups/positions.json, which the Counter Picker script builds first), so
 * Crystal Maiden's lanes as a hard support aren't mixed with her few games as a carry.
 *
 * Rank brackets cover the current patch: every complete STRATZ week (Thursday to Wednesday) since it
 * came out, added together, so the numbers never come from a half-finished week or an older patch
 * (see patchWeeks). The "tournaments" bracket is different: professional tournament
 * games (the match list from OpenDota's proMatches, the lane results from STRATZ) over the last
 * TOURNAMENT_DAYS days, because there are only about a hundred a week.
 *
 * Writes one small file per bracket, so the page only downloads the bracket being viewed:
 *   public/data/lanes/index.json      { updated, brackets: ["herald_guardian", ..., "tournaments"], patch, dates: { [bracket]: [from, to] } }
 *     patch = the patch the rank brackets cover ("7.41f"), or null right after a new patch
 *   public/data/lanes/<bracket>.json  { [heroId]: { [position 1-5]: { base, with: Row[], vs: Row[] } } }
 *     base  [games, laneWin%, laneDraw%, laneLoss%]: the hero's lanes in that role, to compare against
 *     Row   [otherId, games, laneWin%, laneDraw%, laneLoss%, stompWin%, stompLoss%, gameWin%]
 *   public/data/lanes/duos.json       the showcase's strongest duos per bracket (see buildDuos below)
 *   "with" = lane partners, best first; "vs" = lane opponents: the ones that beat it most first, then
 *   the ones it beats most. Lists are ranked by a sample-weighted lane win rate, so 60 lucky games
 *   don't outrank 1,700 solid ones. Only what the page shows is kept, so the files stay small.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "data", "lanes");
const heroes = JSON.parse(readFileSync(join(ROOT, "public", "data", "heroes.json"), "utf8"));
/** positions.json: per hero, [share of games %, win rate %] for positions 1 to 5. */
const positions = JSON.parse(readFileSync(join(ROOT, "public", "data", "matchups", "positions.json"), "utf8"));

/** A hero counts for a role if at least this % of its games are played there (same as the Counter Picker). */
const MIN_SHARE = 20;
/** Pairs with fewer lanes than this are dropped: too few to say anything. */
const MIN_KEEP = 30;
/**
 * Sample weight for ranking: a pairing's lane win rate is pulled toward the hero's usual one as if it
 * had this many extra average lanes. 60 games barely move; 2,000 games keep their own number.
 */
const PRIOR_GAMES = 200;
/** How many rows to keep per hero and role, for each list. */
const KEEP_WITH = 16;
const KEEP_VS_EACH_END = 12;
/**
 * Each request asks, per (hero, role) pair, for partners and opponents in every week of the patch, so
 * the pairs per request shrink as the patch gets longer and requests stay about this many lists.
 */
const LISTS_PER_REQUEST = 24;

const WEEK_SECONDS = 7 * 24 * 3600;
/** STRATZ weeks start Thursday 00:00 UTC (1970-01-01 was a Thursday); the "week" argument is that time. */
const thisWeek = Math.floor(Date.now() / 1000 / WEEK_SECONDS);
/** At most this many weeks, so a very long patch can't make the weekly run take hours. */
const MAX_WEEKS = 12;
/** Set in main by patchWeeks(): the weeks the rank brackets cover (STRATZ "week" values), and the batch size. */
let WEEKS = [];
let BATCH = 1;

/**
 * The complete STRATZ weeks of the current patch: from the first week that starts after the patch came
 * out (the week it came out in also has games from the patch before) to the last finished week.
 * A brand-new patch with no complete week yet falls back to the last 2 weeks, labelled by dates.
 */
async function patchWeeks(token) {
  const data = await stratz(token, "{ constants { gameVersions { name asOfDateTime } } }");
  const now = Date.now() / 1000;
  const patch = data.constants.gameVersions
    .filter((v) => v.asOfDateTime <= now)
    .sort((a, b) => b.asOfDateTime - a.asOfDateTime)[0];
  const weeks = [];
  for (let w = Math.max(Math.ceil(patch.asOfDateTime / WEEK_SECONDS), thisWeek - MAX_WEEKS); w < thisWeek; w++) weeks.push(w);
  const fresh = !weeks.length;
  if (fresh) weeks.push(thisWeek - 2, thisWeek - 1);
  return { patch: fresh ? null : patch.name, weeks: weeks.map((w) => w * WEEK_SECONDS) };
}

/** The roles each hero is really played in, most played first (at least one). */
function rolesOf(heroId) {
  const shares = (positions[heroId] ?? []).map((p, i) => [i + 1, p[0]]);
  const real = shares.filter(([, s]) => s >= MIN_SHARE).sort((a, b) => b[1] - a[1]);
  if (real.length) return real.map(([pos]) => pos);
  const top = [...shares].sort((a, b) => b[1] - a[1])[0];
  return top ? [top[0]] : [1];
}

const BRACKETS = {
  herald_guardian: "HERALD_GUARDIAN",
  crusader_archon: "CRUSADER_ARCHON",
  legend_ancient: "LEGEND_ANCIENT",
  divine_immortal: "DIVINE_IMMORTAL",
};

function envToken() {
  if (process.env.STRATZ_API_TOKEN) return process.env.STRATZ_API_TOKEN.trim();
  const envFile = join(ROOT, ".env");
  if (!existsSync(envFile)) return "";
  const line = readFileSync(envFile, "utf8").split(/\r?\n/).find((l) => l.startsWith("STRATZ_API_TOKEN="));
  return line ? line.slice("STRATZ_API_TOKEN=".length).trim().replace(/^"|"$/g, "") : "";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round1 = (n) => Math.round(n * 10) / 10;
const pct = (part, total) => (total ? round1((part / total) * 100) : 0);

async function stratz(token, query) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch("https://api.stratz.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "User-Agent": "STRATZ_API" },
      body: JSON.stringify({ query }),
    });
    if (res.status === 429) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    const json = await res.json();
    const message = json.errors?.map((e) => e.message).join("; ");
    // STRATZ is sometimes briefly overloaded ("temporarily unavailable ... at capacity"): wait and retry.
    if (message && /temporarily unavailable|at capacity|retry/i.test(message)) {
      await sleep(15000 * (attempt + 1));
      continue;
    }
    if (message) throw new Error(`Stratz: ${message}`);
    return json.data;
  }
  throw new Error("Stratz: still rate-limited or overloaded after retries");
}

const FIELDS = "heroId2 matchCount winCount drawCount lossCount stompWinCount stompLossCount matchWinCount";

/** STRATZ row -> compact row. */
function toRow(r) {
  const g = r.matchCount;
  return [
    r.heroId2,
    g,
    pct(r.winCount, g),
    pct(r.drawCount, g),
    pct(r.lossCount, g),
    pct(r.stompWinCount, g),
    pct(r.stompLossCount, g),
    pct(r.matchWinCount, g),
  ];
}

async function bracketFromStratz(token, enumValue) {
  const bracketArg = enumValue ? `, bracketBasicIds: [${enumValue}]` : "";
  const jobs = heroes.flatMap((h) => rolesOf(h.id).map((pos) => ({ id: h.id, pos })));
  const out = {};
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);
    const fields = batch
      .map(
        ({ id, pos }) =>
          WEEKS.map(
            (week, k) =>
              `w${id}_${pos}_${k}: laneOutcome(heroId: ${id}, isWith: true, week: ${week}, positionIds: [POSITION_${pos}]${bracketArg}) { ${FIELDS} }
               v${id}_${pos}_${k}: laneOutcome(heroId: ${id}, isWith: false, week: ${week}, positionIds: [POSITION_${pos}]${bracketArg}) { ${FIELDS} }`,
          ).join("\n"),
      )
      .join("\n");
    const data = await stratz(token, `{ heroStats { ${fields} } }`);
    // All the patch's weeks added together, per other hero.
    const merged = (prefix) => {
      const byHero = new Map();
      for (let k = 0; k < WEEKS.length; k++) {
        for (const r of data.heroStats[`${prefix}_${k}`] ?? []) {
          const t = byHero.get(r.heroId2);
          if (!t) byHero.set(r.heroId2, { ...r });
          else for (const f of FIELDS.split(" ").slice(1)) t[f] += r[f];
        }
      }
      return [...byHero.values()];
    };
    for (const { id, pos } of batch) {
      const withRaw = merged(`w${id}_${pos}`).filter((r) => r.heroId2 !== id);
      const vsRaw = merged(`v${id}_${pos}`).filter((r) => r.heroId2 !== id);
      if (!vsRaw.length) continue;

      // The hero's lanes in this role (all its opponents together): what each pairing is compared with.
      const t = vsRaw.reduce(
        (s, r) => ({ g: s.g + r.matchCount, w: s.w + r.winCount, d: s.d + r.drawCount, l: s.l + r.lossCount }),
        { g: 0, w: 0, d: 0, l: 0 },
      );
      out[id] ??= {};
      out[id][pos] = roleLanes(t, withRaw, vsRaw, MIN_KEEP, PRIOR_GAMES);
    }
    await sleep(700);
  }
  return out;
}

/**
 * One hero in one role: its usual lane (t = totals) plus its kept partners and opponents, ranked by a
 * sample-weighted lane win rate. Rows are STRATZ-shaped ({ heroId2, matchCount, winCount, ... }).
 */
function roleLanes(t, withRaw, vsRaw, minKeep, prior) {
  const base = [t.g, pct(t.w, t.g), pct(t.d, t.g), pct(t.l, t.g)];
  const baseWin = t.g ? t.w / t.g : 0;
  // Sample-weighted lane win rate, used only to rank.
  const score = (r) => (r.winCount + prior * baseWin) / (r.matchCount + prior);

  // Partners: only lanes won at least as often as lost and better than usual (a "best" partner
  // that loses more lanes than it wins isn't a recommendation).
  const partners = withRaw
    .filter((r) => r.matchCount >= minKeep && r.winCount >= r.lossCount && r.winCount / r.matchCount >= baseWin)
    .sort((a, b) => score(b) - score(a))
    .slice(0, KEEP_WITH)
    .map(toRow);

  const opponents = vsRaw.filter((r) => r.matchCount >= minKeep);
  const tough = [...opponents].sort((a, b) => score(a) - score(b)).slice(0, KEEP_VS_EACH_END);
  const toughIds = new Set(tough.map((r) => r.heroId2));
  const easy = [...opponents]
    .sort((a, b) => score(b) - score(a))
    .filter((r) => !toughIds.has(r.heroId2) && r.winCount >= r.lossCount)
    .slice(0, KEEP_VS_EACH_END);

  return { base, with: partners, vs: [...tough, ...easy].map(toRow) };
}

/* ------------------------------------------------------------------ tournaments */

/** How far back tournament games are counted, and the smaller limits their smaller numbers need. */
const TOURNAMENT_DAYS = 60;
const TOURNAMENT_MIN_KEEP = 3;
const TOURNAMENT_PRIOR = 20;
/** A hero counts in a role with at least this many tournament lanes there. */
const TOURNAMENT_MIN_ROLE = 8;

/** Professional tournament match ids from the last TOURNAMENT_DAYS days (OpenDota, newest first, 100 a page). */
async function tournamentMatchIds() {
  const since = Date.now() / 1000 - TOURNAMENT_DAYS * 86400;
  const ids = [];
  let before = "";
  for (let page = 0; page < 60; page++) {
    const res = await fetch(`https://api.opendota.com/api/proMatches${before}`);
    if (!res.ok) throw new Error(`OpenDota proMatches: HTTP ${res.status}`);
    const list = await res.json();
    if (!list.length) break;
    for (const m of list) if (m.start_time >= since) ids.push(m.match_id);
    if (list[list.length - 1].start_time < since) break;
    before = `?less_than_match_id=${list[list.length - 1].match_id}`;
    await sleep(1100); // OpenDota's free limit is 60 requests a minute
  }
  return [...new Set(ids)];
}

/** Which map lane a team's lane is: Radiant's safe lane is bottom, Dire's is top. */
function mapLane(lane, isRadiant) {
  if (lane === "MID_LANE") return "mid";
  if (lane === "SAFE_LANE") return isRadiant ? "bottom" : "top";
  if (lane === "OFF_LANE") return isRadiant ? "top" : "bottom";
  return null;
}

/**
 * The tournaments bracket: every scored lane of every tournament game, counted per hero and role,
 * with its lane partners and lane opponents. Same shape as the rank brackets.
 */
async function tournamentsBracket(token) {
  const ids = await tournamentMatchIds();
  const stats = new Map(); // "hero_pos" -> { t, with: Map, vs: Map }
  const empty = (heroId2) => ({
    heroId2,
    matchCount: 0,
    winCount: 0,
    drawCount: 0,
    lossCount: 0,
    stompWinCount: 0,
    stompLossCount: 0,
    matchWinCount: 0,
  });
  const add = (r, res, wonGame) => {
    r.matchCount++;
    if (res === "win" || res === "stompWin") r.winCount++;
    if (res === "draw") r.drawCount++;
    if (res === "loss" || res === "stompLoss") r.lossCount++;
    if (res === "stompWin") r.stompWinCount++;
    if (res === "stompLoss") r.stompLossCount++;
    if (wonGame) r.matchWinCount++;
  };
  let first = Infinity;
  let last = 0;
  let used = 0;

  for (let i = 0; i < ids.length; i += 25) {
    const batch = ids.slice(i, i + 25);
    const query = batch
      .map(
        (id) =>
          `m${id}: match(id: ${id}) { startDateTime didRadiantWin topLaneOutcome midLaneOutcome bottomLaneOutcome players { heroId position isRadiant lane } }`,
      )
      .join("\n");
    const data = await stratz(token, `{ ${query} }`);
    for (const id of batch) {
      const m = data[`m${id}`];
      // Only games STRATZ scored (some aren't parsed: no lanes, no roles).
      if (!m?.players?.length || !m.bottomLaneOutcome || m.players.some((p) => !p.position || !p.lane)) continue;
      used++;
      first = Math.min(first, m.startDateTime);
      last = Math.max(last, m.startDateTime);
      const outcome = { top: m.topLaneOutcome, mid: m.midLaneOutcome, bottom: m.bottomLaneOutcome };
      const players = m.players.map((p) => ({ ...p, pos: Number(p.position.replace("POSITION_", "")), map: mapLane(p.lane, p.isRadiant) }));
      for (const p of players) {
        const o = p.map && outcome[p.map];
        if (!o) continue;
        const side = p.isRadiant ? "RADIANT" : "DIRE";
        const stomp = o.endsWith("STOMP");
        const res = o === "TIE" ? "draw" : o.startsWith(side) ? (stomp ? "stompWin" : "win") : stomp ? "stompLoss" : "loss";
        const wonGame = m.didRadiantWin === p.isRadiant;
        const key = `${p.heroId}_${p.pos}`;
        if (!stats.has(key)) stats.set(key, { t: { g: 0, w: 0, d: 0, l: 0 }, with: new Map(), vs: new Map() });
        const s = stats.get(key);
        s.t.g++;
        if (res === "win" || res === "stompWin") s.t.w++;
        if (res === "draw") s.t.d++;
        if (res === "loss" || res === "stompLoss") s.t.l++;
        // Lane partners (same team) and lane opponents (other team) in the same map lane.
        for (const q of players) {
          if (q === p || q.map !== p.map) continue;
          const list = q.isRadiant === p.isRadiant ? s.with : s.vs;
          if (!list.has(q.heroId)) list.set(q.heroId, empty(q.heroId));
          add(list.get(q.heroId), res, wonGame);
        }
      }
    }
    await sleep(700);
  }

  const out = {};
  for (const [key, s] of stats) {
    if (s.t.g < TOURNAMENT_MIN_ROLE) continue;
    const [id, pos] = key.split("_");
    out[id] ??= {};
    out[id][pos] = roleLanes(s.t, [...s.with.values()], [...s.vs.values()], TOURNAMENT_MIN_KEEP, TOURNAMENT_PRIOR);
  }
  console.log(`tournaments: ${used} scored games of ${ids.length}`);
  return { bracket: out, dates: [new Date(first * 1000).toISOString(), new Date(last * 1000).toISOString()] };
}

/* ------------------------------------------------------------------ top duos */

/** Showcase settings: how many duos per list, and the fewest lanes a duo needs to be listed. */
const DUOS_PER_LIST = 5;
const DUO_MIN_GAMES = { tournaments: 6, default: 120 };
/** A duo's result in a bracket counts for "Best in" only with at least this many lanes there. */
const BEST_MIN_GAMES = 80;

/**
 * duos.json: the strongest lane duos per bracket, for the page's showcase, plus each listed duo's
 * result in every bracket, so the page can say which rank it works best in without downloading
 * all five bracket files.
 *   { [bracket]: { safe: Duo[], off: Duo[] } }
 *   Duo = { a, b, role, win, draw, loss, usual, games, ranks: { [bracket]: [win, usual, games] }, best: bracket | null }
 * a = the carry (safe lane, role 1) or offlaner (off lane, role 3), b = the partner. Ranked by how much
 * better than usual the lane goes (sample-weighted); each hero at most once per list.
 */
function buildDuos(built) {
  const keys = Object.keys(built);
  // "Best in" compares ranks only: tournaments are a different kind of game, with far fewer of them.
  const ranked = keys.filter((k) => k !== "tournaments");
  const resultIn = (bk, a, role, b) => {
    const lanes = built[bk]?.[a]?.[role];
    const row = lanes?.with.find((r) => r[0] === b);
    return lanes && row ? [row[2], lanes.base[1], row[1]] : null;
  };

  const out = {};
  for (const bk of keys) {
    const minGames = DUO_MIN_GAMES[bk] ?? DUO_MIN_GAMES.default;
    const prior = bk === "tournaments" ? TOURNAMENT_PRIOR : PRIOR_GAMES;
    const list = (role) => {
      const all = [];
      for (const [id, roles] of Object.entries(built[bk])) {
        const lanes = roles[role];
        if (!lanes) continue;
        const usual = lanes.base[1];
        for (const r of lanes.with) {
          if (r[1] < minGames || r[2] < r[4]) continue; // enough lanes, and won at least as often as lost
          const weighted = (r[2] * r[1] + prior * usual) / (r[1] + prior);
          all.push({ a: Number(id), b: r[0], role, win: r[2], draw: r[3], loss: r[4], usual, games: r[1], score: weighted - usual });
        }
      }
      const used = new Set();
      const picked = [];
      for (const d of all.sort((x, y) => y.score - x.score)) {
        if (used.has(d.a) || used.has(d.b)) continue;
        used.add(d.a);
        used.add(d.b);
        picked.push(d);
        if (picked.length === DUOS_PER_LIST) break;
      }
      return picked.map(({ score: _score, ...d }) => {
        const ranks = {};
        let best = null;
        let bestDelta = -Infinity;
        for (const rk of ranked) {
          const res = resultIn(rk, d.a, d.role, d.b);
          if (!res) continue;
          ranks[rk] = res;
          if (res[2] >= BEST_MIN_GAMES && res[0] - res[1] > bestDelta) {
            bestDelta = res[0] - res[1];
            best = rk;
          }
        }
        return { ...d, ranks, best };
      });
    };
    out[bk] = { safe: list(1), off: list(3) };
  }
  return out;
}

/* ------------------------------------------------------------------ main */

const token = envToken();
if (!token) {
  console.error("STRATZ_API_TOKEN is missing (.env locally, or the repository secret in GitHub Actions).");
  console.error("Not touching the lane data.");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
// Build everything first, then write: a failure halfway never leaves a mix of old and new files.
const period = await patchWeeks(token);
WEEKS = period.weeks;
BATCH = Math.max(1, Math.floor(LISTS_PER_REQUEST / (2 * WEEKS.length)));
/** First and last moment the rank brackets cover. */
const weeksRange = [new Date(WEEKS[0] * 1000).toISOString(), new Date((WEEKS.at(-1) + WEEK_SECONDS - 1) * 1000).toISOString()];
console.log(`rank brackets: patch ${period.patch ?? "(new, last 2 weeks)"}, ${WEEKS.length} weeks, ${weeksRange[0].slice(0, 10)} to ${weeksRange[1].slice(0, 10)}`);

const built = {};
const dates = {};
for (const [key, enumValue] of Object.entries(BRACKETS)) {
  built[key] = await bracketFromStratz(token, enumValue);
  dates[key] = weeksRange;
  console.log("lanes bracket", key, "done:", Object.keys(built[key]).length, "heroes");
}
// Tournaments sit right after Divine–Immortal on the page.
const tournaments = await tournamentsBracket(token);
built.tournaments = tournaments.bracket;
dates.tournaments = tournaments.dates;
console.log("lanes bracket tournaments done:", Object.keys(built.tournaments).length, "heroes");
for (const [key, bracket] of Object.entries(built)) writeFileSync(join(OUT_DIR, `${key}.json`), JSON.stringify(bracket));
writeFileSync(join(OUT_DIR, "duos.json"), JSON.stringify(buildDuos(built)));
writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify({ updated: new Date().toISOString(), brackets: Object.keys(built), patch: period.patch, dates }));
console.log(`wrote ${Object.keys(built).length} lane files`);
