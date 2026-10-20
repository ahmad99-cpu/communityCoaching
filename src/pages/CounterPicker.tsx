import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WideContainer } from "@/components/layout/Container";
import { Icon } from "@/components/site/Icons";
import { usePageTitle } from "@/lib/usePageTitle";
import { track } from "@/lib/analytics";

/* ---------------------------------------------------------------- data */

interface Hero {
  id: number;
  slug: string;
  name: string;
  attr: "str" | "agi" | "int" | "all";
}
/** One matchup: the hero's win rate (%) against otherId, over this many games. */
type Row = [otherId: number, games: number, winRate: number];
interface Bracket {
  vs: Record<string, Row[]>;
}
interface MatchupIndex {
  source: "stratz" | "opendota";
  updated: string;
  brackets: string[];
}
/** positions.json: per hero, [share of games %, win rate %] for positions 1 to 5. */
type Positions = Record<string, [number, number][]>;
/** durations.json: per hero, win rate % in the early (15-30), mid (30-45) and late (45+) game. */
type Durations = Record<string, [number, number, number]>;
/**
 * patch.json: each hero's win rate in the current patch, from all public games, per bracket.
 * `version` is null when the patch is newer than Stratz's latest weekly total ("this week").
 */
interface PatchStats {
  version: string | null;
  from: string;
  to: string;
  brackets: Record<string, Record<string, [games: number, winRate: number]>>;
}

const ATTRS: { key: Hero["attr"]; label: string }[] = [
  { key: "str", label: "Strength" },
  { key: "agi", label: "Agility" },
  { key: "int", label: "Intelligence" },
  { key: "all", label: "Universal" },
];
/** Dota positions 1 to 5. A hero counts for a position if at least MIN_SHARE% of its games are played there. */
const POSITIONS = ["Carry", "Mid", "Offlane", "Soft support", "Hard support"];
const MIN_SHARE = 20;
const BRACKET_LABELS: Record<string, string> = {
  all: "All ranks",
  herald_guardian: "Herald–Guardian",
  crusader_archon: "Crusader–Archon",
  legend_ancient: "Legend–Ancient",
  divine_immortal: "Divine–Immortal",
};
const POOL_KEY = "6slot.heroPool";
const img = (h: Hero) => `/heroes/${h.slug}.webp`;

function readPool(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(POOL_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function writePool(pool: Set<number>) {
  try {
    localStorage.setItem(POOL_KEY, JSON.stringify([...pool]));
  } catch {
    /* private mode: the pool just isn't remembered */
  }
}
const idsFromUrl = (key: string) =>
  (new URLSearchParams(window.location.search).get(key) ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 5);

/** Quick lookups: lookup[heroId].get(otherId) = [games, winRate]. */
function toLookup(rows?: Record<string, Row[]>) {
  const out = new Map<number, Map<number, [number, number]>>();
  if (!rows) return out;
  for (const [id, list] of Object.entries(rows)) out.set(Number(id), new Map(list.map(([o, g, w]) => [o, [g, w]])));
  return out;
}

/**
 * Each hero's overall win rate, from the same games as its matchups (every game it played, across
 * all the enemies it met), so "against this enemy" and "overall" are measured the same way.
 */
function overallWinRates(rows?: Record<string, Row[]>) {
  const out = new Map<number, number>();
  if (!rows) return out;
  for (const [id, list] of Object.entries(rows)) {
    let games = 0;
    let wins = 0;
    for (const [, g, w] of list) {
      games += g;
      wins += (g * w) / 100;
    }
    if (games) out.set(Number(id), (wins / games) * 100);
  }
  return out;
}

interface Suggestion {
  hero: Hero;
  /** Its win rate across its matchup games: what each matchup is compared with (same games). */
  overall: number;
  /** Its win rate in the current patch, from all public games (null when not available). */
  patch: number | null;
  /** Shown big, and what the list is sorted by: the average of the win rates in `parts`. */
  winRate: number;
  /** Its win rate against each enemy, straight from the data. */
  parts: { hero: Hero; winRate: number; games: number }[];
  /** Some of these numbers come from few games: shown with a small tag. */
  thin: boolean;
}

/** "+6" / "-3" / "0": the difference from the hero's usual win rate. */
const signed = (n: number, digits = 1) => {
  const v = Number(n.toFixed(digits));
  return v > 0 ? `+${v}` : v < 0 ? `${v}` : "0";
};
/** Green when it does better than usual against that enemy (a real counter), red when worse. */
const deltaColor = (d: number) => (d >= 0.5 ? "text-emerald-400" : d <= -0.5 ? "text-red-400" : "text-text-muted");

/** Green when the pick wins more than it loses, red when it loses more. */
const wrColor = (wr: number) => (wr >= 50 ? "text-emerald-400" : "text-red-400");

/* ---------------------------------------------------------------- page */

export function CounterPicker() {
  usePageTitle("Dota 2 Counter Picker");
  const [heroes, setHeroes] = useState<Hero[] | null>(null);
  const [data, setData] = useState<MatchupIndex | null>(null);
  const [loaded, setLoaded] = useState<Record<string, Bracket>>({});
  const [positions, setPositions] = useState<Positions | null>(null);
  const [durations, setDurations] = useState<Durations | null>(null);
  const [patch, setPatch] = useState<PatchStats | null>(null);
  /** Hero list filter: 0-4 = only heroes really played in that position. */
  const [gridRole, setGridRole] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  const [enemies, setEnemies] = useState<number[]>(() => idsFromUrl("e"));
  const [allies, setAllies] = useState<number[]>(() => idsFromUrl("a"));
  const [side, setSide] = useState<"enemy" | "ally">("enemy");
  const [query, setQuery] = useState("");
  // 0-4 = pos 1-5; ?p=1..5 opens with a position picked (e.g. from the Position Test result).
  const [position, setPosition] = useState<number | null>(() => {
    const p = Number(new URLSearchParams(window.location.search).get("p"));
    return Number.isInteger(p) && p >= 1 && p <= 5 ? p - 1 : null;
  });
  const [bracket, setBracket] = useState("all");
  const [tab, setTab] = useState<"best" | "avoid">("best");
  const [pool, setPool] = useState<Set<number>>(readPool);
  const [poolOnly, setPoolOnly] = useState(false);
  const [editPool, setEditPool] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/heroes.json").then((r) => r.json()),
      fetch("/data/matchups/index.json").then((r) => r.json()),
    ])
      .then(([h, m]) => {
        setHeroes(h);
        setData(m);
      })
      .catch(() => setFailed(true));
    fetch("/data/matchups/patch.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPatch)
      .catch(() => {});
    fetch("/data/matchups/durations.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setDurations)
      .catch(() => {});
    fetch("/data/matchups/positions.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPositions)
      .catch(() => {});
  }, []);

  // Each rank bracket is its own small file, downloaded the first time it's chosen ("all" right away,
  // alongside the hero list).
  const requested = useRef(new Set<string>());
  useEffect(() => {
    if (requested.current.has(bracket)) return;
    requested.current.add(bracket);
    fetch(`/data/matchups/${bracket}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((b: Bracket) => setLoaded((prev) => ({ ...prev, [bracket]: b })))
      .catch(() => {
        requested.current.delete(bracket);
        setFailed(true);
      });
  }, [bracket]);

  // Counted once per visit, the first time results show.
  const used = useRef(false);
  useEffect(() => {
    if (used.current || !enemies.length) return;
    used.current = true;
    track("Counter Picker used");
  }, [enemies.length]);

  // Keep the draft in the address bar, so the page can be shared or refreshed as-is.
  useEffect(() => {
    // Built by hand so the shared link keeps plain commas (?e=1,2,3) instead of %2C.
    const qs = [
      enemies.length && `e=${enemies.join(",")}`,
      allies.length && `a=${allies.join(",")}`,
      position !== null && `p=${position + 1}`,
    ]
      .filter(Boolean)
      .join("&");
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [enemies, allies, position]);

  const byId = useMemo(() => new Map((heroes ?? []).map((h) => [h.id, h])), [heroes]);
  const active = loaded[bracket];
  const vs = useMemo(() => toLookup(active?.vs), [active]);
  const overall = useMemo(() => overallWinRates(active?.vs), [active]);
  /** Matchups with fewer games than this get a "few games" tag, so people know to take them lightly. */
  const minGames = data?.source === "stratz" ? (bracket === "all" ? 150 : 60) : 20;

  const picked = useMemo(() => new Set([...enemies, ...allies]), [enemies, allies]);

  /**
   * Every hero not yet picked, with its win rate against the enemy team, sorted by that number.
   * Counters only: your own picks are just kept out of the list (and feed the game-length read).
   */
  const ranked = useMemo<Suggestion[]>(() => {
    if (!heroes || !enemies.length || !active) return [];
    const list: Suggestion[] = [];
    for (const h of heroes) {
      if (picked.has(h.id)) continue;
      if (position !== null && positions && (positions[h.id]?.[position]?.[0] ?? 0) < MIN_SHARE) continue;
      if (poolOnly && !pool.has(h.id)) continue;
      // Every hero with data shows; numbers from few games get a "few games" tag instead of being hidden.
      const parts: Suggestion["parts"] = [];
      let thin = false;
      for (const e of enemies) {
        const enemy = byId.get(e);
        const [games, winRate] = vs.get(h.id)?.get(e) ?? [0, 0];
        if (!enemy || !games || !winRate) continue;
        if (games < minGames) thin = true;
        parts.push({ hero: enemy, winRate, games });
      }
      if (!parts.length) continue;
      const winRate = parts.reduce((sum, p) => sum + p.winRate, 0) / parts.length;
      const inPatch = patch?.brackets[bracket]?.[h.id] ?? patch?.brackets.all?.[h.id];
      list.push({ hero: h, overall: overall.get(h.id) ?? 50, patch: inPatch?.[1] ?? null, winRate, parts, thin });
    }
    return list.sort((x, y) => y.winRate - x.winRate);
  }, [heroes, enemies, active, picked, position, positions, poolOnly, pool, vs, overall, patch, bracket, byId, minGames]);

  // Heroes with plenty of games come first in both tabs; "few games" heroes still show, after them, so a
  // lucky small sample never takes the top spot. Don't pick never repeats a hero already in Best picks.
  const { best, avoid } = useMemo(() => {
    const solid = ranked.filter((s) => !s.thin);
    const few = ranked.filter((s) => s.thin);
    const best = [...solid, ...few].slice(0, 8);
    const inBest = new Set(best.map((s) => s.hero.id));
    const avoid = [...solid.reverse(), ...few.reverse()].filter((s) => !inBest.has(s.hero.id)).slice(0, 8);
    return { best, avoid };
  }, [ranked]);
  const shown = tab === "best" ? best : avoid;
  const loading = enemies.length > 0 && !active && !failed;

  function add(id: number) {
    if (picked.has(id)) return;
    const [list, setList, other] =
      side === "enemy" ? [enemies, setEnemies, allies] : ([allies, setAllies, enemies] as const);
    if (list.length >= 5) return;
    setList([...list, id]);
    // That team is full: keep going on the other one.
    if (list.length === 4 && other.length < 5) setSide(side === "enemy" ? "ally" : "enemy");
    setQuery("");
  }
  function onHero(id: number) {
    if (editPool) {
      // Built from the latest list, so quick taps in a row are all kept.
      setPool((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        writePool(next);
        return next;
      });
      return;
    }
    add(id);
  }
  /** Picking-my-heroes mode: hero taps go to your list instead of the draft. */
  function startEditPool() {
    setEditPool(true);
    setTimeout(() => searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }
  /** Back to drafting; if heroes were saved, show only those (that's why the mode was opened). */
  function finishEditPool() {
    setEditPool(false);
    if (pool.size) setPoolOnly(true);
  }
  function pickSide(next: "enemy" | "ally") {
    setSide(next);
    if (editPool) finishEditPool();
  }
  function removeFromPool(id: number) {
    setPool((prev) => {
      const next = new Set(prev);
      next.delete(id);
      writePool(next);
      if (!next.size) setPoolOnly(false);
      return next;
    });
  }
  function clearPool() {
    const empty = new Set<number>();
    setPool(empty);
    writePool(empty);
    setPoolOnly(false);
  }

  const matches = useMemo(() => {
    if (!heroes) return [];
    const inRole = (h: Hero) => gridRole === null || !positions || (positions[h.id]?.[gridRole]?.[0] ?? 0) >= MIN_SHARE;
    const q = query.trim().toLowerCase();
    if (!q) return heroes.filter(inRole);
    const initials = (n: string) =>
      n
        .split(/[\s-]+/)
        .map((w) => w[0])
        .join("")
        .toLowerCase();
    return heroes.filter((h) => inRole(h) && (h.name.toLowerCase().includes(q) || initials(h.name).startsWith(q)));
  }, [heroes, query, gridRole, positions]);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address bar still has the link */
    }
  }

  return (
    <section className="py-6 sm:py-8">
      <WideContainer>
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">Counter Picker</h1>
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-text-muted">
            <span className="text-gold">Free tool</span> · Powered by STRATZ
          </p>
        </div>

        {failed && (
          <p className="mt-4 text-center text-sm text-text-muted">
            The hero data couldn't load.{" "}
            <button type="button" onClick={() => window.location.reload()} className="font-bold text-gold hover:underline">
              Try again
            </button>
          </p>
        )}

        {/* The draft arena: your team left, the enemy right, like the Dota draft screen */}
        <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <DraftSide
            title="Your team"
            tone="ally"
            ids={allies}
            byId={byId}
            active={side === "ally"}
            onActivate={() => pickSide("ally")}
            onRemove={(id) => setAllies(allies.filter((x) => x !== id))}
          />
          <span className="relative mx-auto flex h-14 w-14 items-center justify-center" aria-hidden>
            <span
              className="absolute inset-0 bg-gradient-to-b from-gold-light to-gold-dark"
              style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
            />
            <span
              className="absolute inset-[2px] bg-navy"
              style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
            />
            <span className="relative font-display text-lg font-bold text-gold">VS</span>
          </span>
          <DraftSide
            title="Enemy team"
            tone="enemy"
            ids={enemies}
            byId={byId}
            active={side === "enemy"}
            onActivate={() => pickSide("enemy")}
            onRemove={(id) => setEnemies(enemies.filter((x) => x !== id))}
          />
        </div>

        {durations && <GameLength allies={allies} enemies={enemies} durations={durations} />}

        {/* Results, right under the draft */}
        <div className="mt-4 rounded-card border border-gold/25 bg-navy-raised/80 p-3 sm:p-4">
          {/* Phones: one clean row per control, top to bottom. Desktop (lg): everything on one line. */}
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-3">
            <div className="grid grid-cols-2 rounded-control border border-navy-border p-1 lg:inline-grid">
              {(
                [
                  ["best", "Best picks"],
                  ["avoid", "Don't pick"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={`rounded-[7px] px-4 py-2 text-sm font-extrabold transition ${
                    tab === key
                      ? key === "best"
                        ? "bg-gold text-navy"
                        : "bg-red-500/90 text-white"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {positions && (
              <div className="min-w-0 lg:flex lg:items-center lg:gap-2">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-text-muted lg:mb-0">I'm playing</p>
                {/* One swipeable row on phones instead of chips wrapping into a pile. */}
                <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {POSITIONS.map((label, i) => (
                    <Chip key={label} on={position === i} onClick={() => setPosition(position === i ? null : i)}>
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Settings-style row: label and hint on the left, switch on the right. */}
            <button
              type="button"
              role="switch"
              aria-checked={poolOnly}
              onClick={() => (pool.size ? setPoolOnly(!poolOnly) : startEditPool())}
              className="flex w-full items-center justify-between gap-3 rounded-control border border-navy-border bg-navy/50 px-3 py-2.5 text-left transition hover:border-gold/40 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0"
            >
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${poolOnly ? "text-gold" : "text-text"}`}>Only heroes I play</span>
                <span className="block text-xs text-text-muted">
                  {pool.size ? `${pool.size} hero${pool.size === 1 ? "" : "es"} saved` : "Tap to pick your heroes first"}
                </span>
              </span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${poolOnly ? "bg-gold" : "bg-navy-border"}`}>
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${poolOnly ? "left-[22px]" : "left-0.5"}`}
                />
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:flex">
              {data && data.brackets.length > 1 && (
                <select
                  value={bracket}
                  onChange={(e) => setBracket(e.target.value)}
                  className="w-full rounded-control border border-navy-border bg-navy px-3 py-2.5 text-sm text-text lg:w-auto lg:py-2"
                  aria-label="Rank bracket"
                >
                  {data.brackets.map((b) => (
                    <option key={b} value={b}>
                      {BRACKET_LABELS[b] ?? b}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={share}
                disabled={!enemies.length && !allies.length}
                className={`rounded-control border border-navy-border px-3 py-2.5 text-sm font-bold text-text transition hover:border-gold/60 disabled:opacity-40 lg:py-2 ${
                  data && data.brackets.length > 1 ? "" : "col-span-2"
                }`}
              >
                {copied ? "Link copied" : "Share draft"}
              </button>
            </div>
          </div>

          {/* Your saved heroes, removable in one tap */}
          {(poolOnly || editPool) && pool.size > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-black uppercase tracking-[0.16em] text-text-muted">My heroes</span>
              {[...pool].map((id) => {
                const h = byId.get(id);
                if (!h) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => removeFromPool(id)}
                    title={`Remove ${h.name} from your heroes`}
                    className="group flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 py-0.5 pl-0.5 pr-2 text-xs font-bold text-text transition hover:border-red-500/60 hover:bg-red-500/10"
                  >
                    <img src={img(h)} alt="" width={36} height={20} className="h-5 w-9 rounded-full object-cover" />
                    {h.name}
                    <span className="text-sm leading-none text-text-muted group-hover:text-red-400">×</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cards */}
          <div className="mt-3">
            {!enemies.length ? (
              <p className="rounded-control border border-dashed border-navy-border px-4 py-3 text-center text-sm text-text-muted">
                Add at least one enemy hero below to see who wins the most against them.
              </p>
            ) : loading ? (
              <ol aria-label="Loading" className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i} className="h-[82px] animate-pulse rounded-control border border-navy-border bg-navy/60" />
                ))}
              </ol>
            ) : !shown.length ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">
                {tab === "avoid" && ranked.length
                  ? `All ${ranked.length} heroes fit in Best picks, sorted from best to worst.`
                  : "No heroes match these filters."}
              </p>
            ) : (
              <ol className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {shown.map((s, i) => (
                  <ResultCard
                    key={s.hero.id}
                    s={s}
                    rank={i + 1}
                    mine={pool.has(s.hero.id)}
                    avoid={tab === "avoid"}
                    patchVersion={patch?.version ?? null}
                  />
                ))}
              </ol>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-navy-border pt-3 text-xs text-text-muted">
            <span>
              {data?.source === "stratz"
                ? "Data from STRATZ, real public matches."
                : "Early data from OpenDota (pro matches)."}{" "}
              {data &&
                `Updated ${new Date(data.updated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`}
            </span>
            <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-gold hover:underline">
              Know the counter, not how to play it? See 6SLOT <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero picker */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const first = editPool ? matches[0] : matches.find((h) => !picked.has(h.id));
                  if (first) onHero(first.id);
                }
                if (e.key === "Escape") setQuery("");
              }}
              placeholder={
                editPool
                  ? "Type a hero to add it to your heroes"
                  : `Type a hero, Enter adds it to ${side === "enemy" ? "the enemy team" : "your team"}`
              }
              className="min-w-[220px] flex-1 rounded-control border border-navy-border bg-navy-raised px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-gold focus:outline-none"
              aria-label="Search heroes"
            />
            {!editPool && (
              <button
                type="button"
                onClick={startEditPool}
                className="rounded-control border border-navy-border px-4 py-3 text-sm font-bold text-text transition hover:border-gold/60"
              >
                My heroes ({pool.size})
              </button>
            )}
          </div>
          {editPool && (
            <div className="sticky top-16 z-20 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control border border-gold bg-navy-raised px-4 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]">
              <p className="text-sm text-text">
                <strong className="text-gold">Picking your heroes</strong> · {pool.size} saved. Tap the heroes you play.
              </p>
              <div className="flex items-center gap-2">
                {pool.size > 0 && (
                  <button
                    type="button"
                    onClick={clearPool}
                    className="rounded-control px-3 py-2 text-sm font-bold text-text-muted transition hover:text-red-400"
                  >
                    Clear all
                  </button>
                )}
                <button type="button" onClick={finishEditPool} className="btn-gold px-5 py-2 text-sm">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Role filter for the hero list: heroes really played in that position */}
          {positions && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-black uppercase tracking-[0.16em] text-text-muted">Show</span>
              <Chip on={gridRole === null} onClick={() => setGridRole(null)}>
                All heroes
              </Chip>
              {POSITIONS.map((label, i) => (
                <Chip key={label} on={gridRole === i} onClick={() => setGridRole(gridRole === i ? null : i)}>
                  {label}
                </Chip>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-5">
            {ATTRS.map((a) => {
              const list = matches.filter((h) => h.attr === a.key);
              if (!list.length) return null;
              return (
                <div key={a.key}>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{a.label}</p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(74px,1fr))] gap-1">
                    {list.map((h) => {
                      const inEnemy = enemies.includes(h.id);
                      const inAlly = allies.includes(h.id);
                      const mine = pool.has(h.id);
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => onHero(h.id)}
                          title={h.name}
                          className={`group relative aspect-[16/9] overflow-hidden rounded-md border transition ${
                            inEnemy
                              ? "border-red-500/70 opacity-40"
                              : inAlly
                                ? "border-teal-400/70 opacity-40"
                                : mine
                                  ? "border-gold"
                                  : "border-transparent hover:border-gold/70"
                          }`}
                        >
                          <img
                            src={img(h)}
                            alt={h.name}
                            width={192}
                            height={108}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1 pb-0.5 pt-3 text-left text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                            {h.name}
                          </span>
                          {mine && <MineTag />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WideContainer>
    </section>
  );
}

/* ---------------------------------------------------------------- pieces */

function DraftSide({
  title,
  tone,
  ids,
  byId,
  active,
  onActivate,
  onRemove,
}: {
  title: string;
  tone: "enemy" | "ally";
  ids: number[];
  byId: Map<number, Hero>;
  active: boolean;
  onActivate: () => void;
  onRemove: (id: number) => void;
}) {
  const color = tone === "enemy" ? "text-red-400" : "text-teal-300";
  const ring = tone === "enemy" ? "border-red-500/60 bg-red-500/[0.04]" : "border-teal-400/60 bg-teal-400/[0.04]";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`Add heroes to ${title.toLowerCase()}`}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onActivate();
        }
      }}
      className={`cursor-pointer rounded-card border p-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${active ? ring : "border-navy-border bg-navy-raised"}`}
    >
      <div className={`flex items-center justify-between ${tone === "enemy" ? "lg:flex-row-reverse" : ""}`}>
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${color}`}>
          {title} <span className="text-text-muted">{ids.length}/5</span>
        </p>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          {active ? "Adding here" : "Tap to add here"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }, (_, i) => {
          const h = byId.get(ids[i]);
          return h ? (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(h.id);
              }}
              title={`Remove ${h.name}`}
              className="group relative h-12 overflow-hidden rounded-md sm:h-14"
            >
              <img src={img(h)} alt={h.name} width={192} height={108} className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-black text-white opacity-0 transition group-hover:opacity-100">
                ×
              </span>
            </button>
          ) : (
            <span
              key={i}
              className="flex h-12 items-center justify-center rounded-md border border-dashed border-navy-border text-text-muted sm:h-14"
            >
              +
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        on ? "border-gold bg-gold/15 text-gold" : "border-navy-border text-text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

/** "One of my heroes": a gold corner tag on the hero's picture. */
function MineTag() {
  return (
    <span aria-label="One of your heroes" className="absolute left-0 top-0 h-7 w-7">
      <span className="absolute inset-0 bg-gold" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
      <Icon name="check" className="absolute left-[3px] top-[3px] h-3.5 w-3.5 text-navy" />
    </span>
  );
}

function ResultCard({
  s,
  rank,
  mine,
  avoid,
  patchVersion,
}: {
  s: Suggestion;
  rank: number;
  mine: boolean;
  avoid: boolean;
  patchVersion: string | null;
}) {
  return (
    <li
      className={`rounded-control border p-2.5 ${
        avoid ? "border-red-500/25 bg-red-500/[0.04]" : "border-navy-border bg-navy/60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-4 shrink-0 text-center text-xs font-black text-text-muted">{rank}</span>
        <span className="relative shrink-0 overflow-hidden rounded">
          <img src={img(s.hero)} alt="" width={64} height={36} className="block h-9 w-16 object-cover" />
          {mine && <MineTag />}
        </span>
        <div className="min-w-0 flex-1">
          {/* The tag drops to its own line when the name needs the room */}
          <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-extrabold leading-tight text-text">
            <span className="min-w-0">{s.hero.name}</span>
            {s.thin && (
              <span
                title="At least one of these numbers comes from only a few games"
                className="shrink-0 rounded bg-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted"
              >
                few games
              </span>
            )}
          </p>
          <p
            className="mt-0.5 text-[11px] font-semibold text-text-muted"
            title={
              s.patch !== null
                ? `${s.hero.name} wins ${s.patch.toFixed(1)}% of all its public games ${patchVersion ? `in patch ${patchVersion}` : "this week"} (this rank bracket)`
                : `${s.hero.name} wins ${s.overall.toFixed(1)}% of its games in this rank bracket`
            }
          >
            {s.patch !== null
              ? `${Math.round(s.patch)}% in ${patchVersion ?? "this week"}`
              : `${Math.round(s.overall)}% overall`}
          </p>
        </div>
        <span className="shrink-0 text-right">
          <span className={`block text-lg font-black leading-none ${wrColor(s.winRate)}`}>{Math.round(s.winRate)}%</span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-text-muted">
            {s.parts.length > 1 ? "avg vs them" : "win rate vs them"}
          </span>
        </span>
      </div>
      {/* Its win rate against each enemy: five columns, so the row always fits on one line */}
      <div className="mt-2 grid grid-cols-5 gap-1">
        {s.parts.map((p) => (
          <span
            key={p.hero.id}
            title={`${s.hero.name} against ${p.hero.name}: wins ${p.winRate.toFixed(1)}% of ${p.games.toLocaleString("en-US")} games. ${signed(p.winRate - s.overall)} compared with its other matchups (same games), so ${p.winRate - s.overall >= 0.5 ? "it counters" : p.winRate - s.overall <= -0.5 ? "it struggles against" : "it's even with"} ${p.hero.name}.`}
            className="flex min-w-0 items-center justify-center gap-1 rounded bg-navy py-0.5 pl-0.5 pr-1 font-black"
          >
            <img src={img(p.hero)} alt={p.hero.name} width={24} height={14} className="h-3.5 w-6 rounded-sm object-cover" />
            <span className="flex flex-col items-center leading-none">
              <span className={`text-[10px] ${wrColor(p.winRate)}`}>{Math.round(p.winRate)}%</span>
              <span className={`mt-0.5 text-[9px] ${deltaColor(p.winRate - s.overall)}`}>{signed(p.winRate - s.overall, 0)}</span>
            </span>
          </span>
        ))}
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- game length */

const PHASES = ["Early", "Mid", "Late"];
const PHASE_TIMES = ["15–30 min", "30–45 min", "45+ min"];

/** A team's win rate in each phase: the average of its heroes. */
function teamCurve(ids: number[], durations: Durations): number[] | null {
  const rows = ids.map((id) => durations[id]).filter(Boolean);
  if (!rows.length) return null;
  return [0, 1, 2].map((i) => rows.reduce((sum, r) => sum + r[i], 0) / rows.length);
}

/** What to do when you're stronger in a phase: play for that window. */
const YOUR_PLAN = [
  "Be aggressive and end it before 40 minutes.",
  "Group up and take your fights from 30 to 45 minutes.",
  "Play safe early, the late game is yours.",
];

/**
 * The timing read, only for a full draft (5 vs 5): when you're stronger than them, compared phase
 * by phase, with one line of advice. Until then, a small hint says what unlocks it.
 */
function GameLength({ allies, enemies, durations }: { allies: number[]; enemies: number[]; durations: Durations }) {
  const yours = allies.length === 5 ? teamCurve(allies, durations) : null;
  const enemy = enemies.length === 5 ? teamCurve(enemies, durations) : null;

  if (!yours || !enemy) {
    return (
      <p className="mt-3 flex items-center gap-2 px-1 text-xs text-text-muted">
        <Icon name="clock" className="h-3.5 w-3.5" />
        Game length read: shows when both teams have 5 heroes.
      </p>
    );
  }

  const when = (i: number) => `${PHASES[i].toLowerCase()} (${PHASE_TIMES[i]})`;
  const edge = [0, 1, 2].map((i) => yours[i] - enemy[i]);
  const best = edge.indexOf(Math.max(...edge));
  const worst = edge.indexOf(Math.min(...edge));
  const even = Math.max(...edge) - Math.min(...edge) < 1.5;

  return (
    <div className="mt-3 flex items-start gap-3 rounded-card border border-gold/30 bg-navy-raised/60 px-4 py-3 text-sm">
      <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <p className="text-text">
        {even ? (
          <>
            <strong className="text-gold">Both drafts peak at the same time.</strong> The better lanes and fights will
            decide it.
          </>
        ) : (
          <>
            <strong className="text-teal-300">You're stronger {when(best)}</strong>,{" "}
            <strong className="text-red-400">they're stronger {PHASES[worst].toLowerCase()}.</strong> {YOUR_PLAN[best]}
          </>
        )}
      </p>
    </div>
  );
}
