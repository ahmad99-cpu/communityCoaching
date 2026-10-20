/**
 * Builds the Counter Picker's matchup data.
 *
 *   node scripts/build-counter-data.mjs
 *
 * Needs STRATZ_API_TOKEN (in .env or the environment): real public matches from Stratz, per rank
 * bracket. Without it the script stops; `--opendota` builds OpenDota's free pro-match matchups
 * instead (a rough fallback with no rank brackets), only when asked for.
 *
 * Writes one small file per bracket, so the page only downloads the bracket being viewed:
 *   public/data/matchups/index.json   { source, updated, brackets: ["all", "herald_guardian", ...] }
 *   public/data/matchups/<bracket>.json   { vs: { [heroId]: [[otherId, games, winRate], ...] } }
 *   public/data/matchups/positions.json   how often each hero is played in positions 1-5 (Stratz only)
 *   public/data/matchups/durations.json   win rate by game length: early / mid / late (Stratz only)
 *   public/data/matchups/patch.json   each hero's win rate in the current patch, per bracket (Stratz only)
 * winRate is the hero's win rate (%) in games against otherId. Only what the page shows is kept, so the
 * files stay small.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "data", "matchups");
const heroes = JSON.parse(readFileSync(join(ROOT, "public", "data", "heroes.json"), "utf8"));

function envToken() {
  if (process.env.STRATZ_API_TOKEN) return process.env.STRATZ_API_TOKEN.trim();
  const envFile = join(ROOT, ".env");
  if (!existsSync(envFile)) return "";
  const line = readFileSync(envFile, "utf8").split(/\r?\n/).find((l) => l.startsWith("STRATZ_API_TOKEN="));
  return line ? line.slice("STRATZ_API_TOKEN=".length).trim().replace(/^"|"$/g, "") : "";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round1 = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ Stratz */

const STRATZ_BRACKETS = {
  all: null,
  herald_guardian: "HERALD_GUARDIAN",
  crusader_archon: "CRUSADER_ARCHON",
  legend_ancient: "LEGEND_ANCIENT",
  divine_immortal: "DIVINE_IMMORTAL",
};
const BATCH = 8; // heroes per request (GraphQL aliases), to stay well inside the per-minute limit

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
    if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 400));
    return json.data;
  }
  throw new Error("Stratz kept rate-limiting");
}

async function fromStratz(token) {
  const out = {};
  for (const [key, enumValue] of Object.entries(STRATZ_BRACKETS)) {
    const vs = {};
    const bracketArg = enumValue ? `, bracketBasicIds: [${enumValue}]` : "";
    for (let i = 0; i < heroes.length; i += BATCH) {
      const batch = heroes.slice(i, i + BATCH);
      const fields = batch
        .map(
          (h) => `h${h.id}: matchUp(heroId: ${h.id}${bracketArg}, take: 200) {
            vs { heroId2 matchCount winCount }
          }`,
        )
        .join("\n");
      const data = await stratz(token, `{ heroStats { ${fields} } }`);
      for (const h of batch) {
        const m = data?.heroStats?.[`h${h.id}`]?.[0];
        vs[h.id] = (m?.vs ?? []).map((r) => [
          r.heroId2,
          r.matchCount,
          r.matchCount ? round1((r.winCount / r.matchCount) * 100) : 0,
        ]);
      }
      await sleep(700);
    }
    out[key] = { vs };
    console.log("stratz bracket", key, "done");
  }
  return { source: "stratz", brackets: out };
}

/**
 * How often each hero is played in each position, and its win rate there (latest week, all ranks):
 * positions.json = { [heroId]: [[sharePercent, winRatePercent] × 5] } for positions 1 to 5.
 */
async function positionsFromStratz(token) {
  const fields = [1, 2, 3, 4, 5]
    .map((p) => `p${p}: winWeek(take: 1, positionIds: [POSITION_${p}], groupBy: HERO_ID) { heroId matchCount winCount }`)
    .join(" ");
  const data = await stratz(token, `{ heroStats { ${fields} } }`);
  const out = {};
  for (const h of heroes) {
    const rows = [1, 2, 3, 4, 5].map((p) => data.heroStats[`p${p}`].find((r) => r.heroId === h.id));
    const total = rows.reduce((sum, r) => sum + (r?.matchCount ?? 0), 0) || 1;
    out[h.id] = rows.map((r) => [
      round1(((r?.matchCount ?? 0) / total) * 100),
      r?.matchCount ? round1((r.winCount / r.matchCount) * 100) : 0,
    ]);
  }
  return out;
}

/**
 * Win rate by game length (latest week, all ranks), for the Counter Picker's game-length check:
 * durations.json = { [heroId]: [early, mid, late] } win rates in %, for 15-30, 30-45 and 45+ minutes.
 * Stratz groups games in 5-minute steps (durationMinute 6 = 30-35 min); games under 15 minutes
 * (mostly abandons) are left out.
 */
async function durationsFromStratz(token) {
  const data = await stratz(token, `{ heroStats { winWeek(take: 1, groupBy: HERO_ID_DURATION_MINUTES) { heroId durationMinute matchCount winCount } } }`);
  const sums = {};
  for (const r of data.heroStats.winWeek) {
    const minutes = r.durationMinute * 5;
    if (minutes < 15) continue;
    const phase = minutes < 30 ? 0 : minutes < 45 ? 1 : 2;
    sums[r.heroId] ??= [[0, 0], [0, 0], [0, 0]];
    sums[r.heroId][phase][0] += r.winCount;
    sums[r.heroId][phase][1] += r.matchCount;
  }
  const out = {};
  for (const [id, phases] of Object.entries(sums)) out[id] = phases.map(([w, m]) => (m ? round1((w / m) * 100) : 50));
  return out;
}

/**
 * Each hero's win rate in the current patch, per rank bracket, from ALL public games (Stratz's
 * weekly totals since the patch came out). The matchup files use a smaller sample of games, so
 * this is the honest "how good is this hero right now" number.
 * patch.json = { version, from, to, brackets: { [bracket]: { [heroId]: [games, winRate] } } }.
 * If the patch is younger than Stratz's latest weekly total, it falls back to the latest week and
 * sets version to null (the page then says "this week" instead of the patch name).
 */
const RANKS = {
  all: null,
  herald_guardian: "HERALD, GUARDIAN",
  crusader_archon: "CRUSADER, ARCHON",
  legend_ancient: "LEGEND, ANCIENT",
  divine_immortal: "DIVINE, IMMORTAL",
};

async function patchFromStratz(token) {
  const versions = (await stratz(token, `{ constants { gameVersions { name asOfDateTime } } }`)).constants.gameVersions;
  const patch = versions.reduce((a, b) => (b.asOfDateTime > a.asOfDateTime ? b : a));
  const fields = Object.entries(RANKS)
    .map(([key, ranks]) => `${key}: winWeek(take: 12${ranks ? `, bracketIds: [${ranks}]` : ""}, groupBy: HERO_ID) { heroId week matchCount winCount }`)
    .join(" ");
  const data = (await stratz(token, `{ heroStats { ${fields} } }`)).heroStats;

  const weeks = [...new Set(data.all.map((r) => r.week))].sort((a, b) => a - b);
  const inPatch = weeks.filter((w) => w >= patch.asOfDateTime);
  const use = new Set(inPatch.length ? inPatch : weeks.slice(-1));
  const brackets = {};
  for (const key of Object.keys(RANKS)) {
    const sums = {};
    for (const r of data[key]) {
      if (!use.has(r.week)) continue;
      sums[r.heroId] ??= [0, 0];
      sums[r.heroId][0] += r.matchCount;
      sums[r.heroId][1] += r.winCount;
    }
    brackets[key] = Object.fromEntries(
      Object.entries(sums).map(([id, [g, w]]) => [id, [g, g ? round1((w / g) * 100) : 0]]),
    );
  }
  const day = (sec) => new Date(sec * 1000).toISOString().slice(0, 10);
  const last = Math.max(...use);
  return {
    version: inPatch.length ? patch.name : null,
    from: day(inPatch.length ? patch.asOfDateTime : last),
    to: day(last + 6 * 86400),
    brackets,
  };
}

/* ------------------------------------------------------------------ OpenDota fallback */

async function fromOpenDota() {
  const vs = {};
  for (const h of heroes) {
    let rows = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(`https://api.opendota.com/api/heroes/${h.id}/matchups`);
      if (res.status === 429) {
        await sleep(5000);
        continue;
      }
      rows = await res.json();
      break;
    }
    vs[h.id] = rows
      .filter((r) => r.games_played > 0)
      .map((r) => [r.hero_id, r.games_played, round1((r.wins / r.games_played) * 100)]);
    await sleep(1100); // free tier: 60 requests a minute
  }
  return { source: "opendota", brackets: { all: { vs } } };
}

/* ------------------------------------------------------------------ main */

const token = envToken();
// No token = stop. Falling back to OpenDota (pro matches only, no rank brackets) silently replaced
// the real data once, when the GitHub secret was missing. Use --opendota to opt in on purpose.
if (!token && !process.argv.includes("--opendota")) {
  console.error("STRATZ_API_TOKEN is missing (.env locally, or the repository secret in GitHub Actions).");
  console.error("Not touching the data. Run with --opendota to build the rough pro-match fallback on purpose.");
  process.exit(1);
}
const data = token ? await fromStratz(token) : await fromOpenDota();
mkdirSync(OUT_DIR, { recursive: true });
if (token) {
  writeFileSync(join(OUT_DIR, "positions.json"), JSON.stringify(await positionsFromStratz(token)));
  console.log("positions done");
  writeFileSync(join(OUT_DIR, "durations.json"), JSON.stringify(await durationsFromStratz(token)));
  console.log("durations done");
  writeFileSync(join(OUT_DIR, "patch.json"), JSON.stringify(await patchFromStratz(token)));
  console.log("patch done");
}
for (const [key, bracket] of Object.entries(data.brackets)) {
  writeFileSync(join(OUT_DIR, `${key}.json`), JSON.stringify(bracket));
}
writeFileSync(
  join(OUT_DIR, "index.json"),
  JSON.stringify({ source: data.source, updated: new Date().toISOString(), brackets: Object.keys(data.brackets) }),
);
console.log(`wrote ${Object.keys(data.brackets).length} bracket files from ${data.source}`);
