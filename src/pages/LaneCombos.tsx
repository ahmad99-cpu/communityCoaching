import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  /** "Melee" or "Ranged". */
  attack?: string;
}
/** One pairing: [otherId, lanes, laneWin%, laneDraw%, laneLoss%, stompWin%, stompLoss%, gameWin%]. */
type LaneRow = [number, number, number, number, number, number, number, number];
interface RoleLanes {
  /** The hero's lanes in this role: [lanes, win%, draw%, loss%]. */
  base: [number, number, number, number];
  /** Lane partners, best first. */
  with: LaneRow[];
  /** Lane opponents. */
  vs: LaneRow[];
}
/** lanes/<bracket>.json: per hero, per position (1-5), built by scripts/build-lane-data.mjs. */
type LaneBracket = Record<string, Record<string, RoleLanes>>;
interface LaneIndex {
  updated: string;
  brackets: string[];
  /** Per bracket, the first and last day its games are from (ISO). */
  dates?: Record<string, [string, string]>;
  /** The patch the rank brackets cover ("7.41f"); null right after a new patch (then they show dates). */
  patch?: string | null;
}
/** One showcase duo from duos.json: a = carry or offlaner, b = partner. */
interface Duo {
  a: number;
  b: number;
  role: number;
  /** Lanes won / draw / lost, %. */
  win: number;
  draw: number;
  loss: number;
  usual: number;
  games: number;
  /** Its result in each rank: [lanes won %, usual %, lanes]. */
  ranks: Record<string, [number, number, number]>;
  /** The rank where it beats its usual lane by the most, or null. */
  best: string | null;
}
/** duos.json: the strongest duos per rank, built weekly by scripts/build-lane-data.mjs. */
type DuosFile = Record<string, { safe: Duo[]; off: Duo[] }>;

const ROLE_NAMES: Record<number, string> = { 1: "Carry", 2: "Mid", 3: "Offlane", 4: "Soft support", 5: "Hard support" };
const LANE_OF: Record<number, string> = { 1: "Safe lane", 2: "Mid lane", 3: "Off lane", 4: "Off lane", 5: "Safe lane" };
const ATTRS: { key: Hero["attr"]; label: string }[] = [
  { key: "str", label: "Strength" },
  { key: "agi", label: "Agility" },
  { key: "int", label: "Intelligence" },
  { key: "all", label: "Universal" },
];
const BRACKET_LABELS: Record<string, string> = {
  herald_guardian: "Herald–Guardian",
  crusader_archon: "Crusader–Archon",
  legend_ancient: "Legend–Ancient",
  divine_immortal: "Divine–Immortal",
  tournaments: "Tournaments",
};
/** The rank shown first (and when a link names a rank that no longer exists). */
const DEFAULT_BRACKET = "legend_ancient";
/** Weekly data: always check the saved copy is current (a few bytes when nothing changed). */
const FRESH: RequestInit = { cache: "no-cache" };
/**
 * Pairings with fewer lanes than this get a "few games" tag. Tournaments have far fewer games (about
 * a hundred a week, worldwide), so their bar is lower.
 */
const fewGames = (bracket: string) => (bracket === "tournaments" ? 15 : 150);
/** Fewer tournament lanes than this in a role: the page says pros rarely play the hero there. */
const RARE_IN_TOURNAMENTS = 30;
/** Same sample weights as the data script: small samples are pulled toward the hero's usual lane. */
const priorGames = (bracket: string) => (bracket === "tournaments" ? 20 : 200);
const img = (h: Hero) => `/heroes/${h.slug}.webp`;

/** "Oct 16 – Oct 29": the days a bracket's games are from, or null if the data doesn't say. */
function dateRange(index: LaneIndex | null, bracket: string): string | null {
  const d = index?.dates?.[bracket];
  if (!d) return null;
  const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${day(d[0])} – ${day(d[1])}`;
}

type Tab = "partners" | "tough" | "easy";
/** `short` is the phone label, so the three tabs fit on one line. */
const TABS: { key: Tab; label: string; short: string; on: string }[] = [
  { key: "partners", label: "Best partners", short: "Partners", on: "bg-gold text-navy" },
  { key: "tough", label: "Tough lanes", short: "Tough lanes", on: "bg-red-500/90 text-white" },
  { key: "easy", label: "Easy lanes", short: "Easy lanes", on: "bg-emerald-500/90 text-navy" },
];

const fromUrl = (key: string) => new URLSearchParams(window.location.search).get(key);

/** Roles a hero has data for in this bracket, most played (most lanes) first. */
function rolesFor(bracket: LaneBracket | undefined, id: number | null): number[] {
  if (!bracket || id === null || !bracket[id]) return [];
  return Object.entries(bracket[id])
    .sort((a, b) => b[1].base[0] - a[1].base[0])
    .map(([pos]) => Number(pos));
}

/* ---------------------------------------------------------------- page */

export function LaneCombos() {
  usePageTitle("Dota 2 Lane Combos");
  const [heroes, setHeroes] = useState<Hero[] | null>(null);
  const [index, setIndex] = useState<LaneIndex | null>(null);
  const [duos, setDuos] = useState<DuosFile | null>(null);
  const [loaded, setLoaded] = useState<Record<string, LaneBracket>>({});
  const [failed, setFailed] = useState(false);

  const [heroId, setHeroId] = useState<number | null>(() => Number(fromUrl("h")) || null);
  const [role, setRole] = useState<number | null>(() => Number(fromUrl("r")) || null);
  const [bracket, setBracket] = useState(() => {
    const b = fromUrl("b");
    return b && b !== "all" ? b : DEFAULT_BRACKET;
  });
  const [tab, setTab] = useState<Tab>(() => (["partners", "tough", "easy"].includes(fromUrl("t") ?? "") ? (fromUrl("t") as Tab) : "partners"));
  const [query, setQuery] = useState("");
  const [gridRole, setGridRole] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Clicking "Lane Combos" in the menu (or the browser's back button) while a hero is open is a real
  // navigation to the page without ?h=: go back to the showcase. (Our own address bar updates use
  // replaceState, which the router doesn't see, so they don't land here.)
  const location = useLocation();
  const firstLocation = useRef(true);
  useEffect(() => {
    if (firstLocation.current) {
      firstLocation.current = false;
      return;
    }
    const h = Number(new URLSearchParams(location.search).get("h")) || null;
    setHeroId(h);
  }, [location.key, location.search]);

  useEffect(() => {
    Promise.all([
      fetch("/data/heroes.json", FRESH).then((r) => r.json()),
      fetch("/data/lanes/index.json", FRESH).then((r) => r.json()),
    ])
      .then(([h, i]) => {
        setHeroes(h);
        setIndex(i);
      })
      .catch(() => setFailed(true));
    // The showcase's top duos for every rank (small).
    fetch("/data/lanes/duos.json", FRESH)
      .then((r) => (r.ok ? r.json() : null))
      .then(setDuos)
      .catch(() => {});
  }, []);

  // One small file per rank bracket, downloaded the first time it's chosen.
  const requested = useRef(new Set<string>());
  useEffect(() => {
    if (requested.current.has(bracket)) return;
    requested.current.add(bracket);
    fetch(`/data/lanes/${bracket}.json`, FRESH)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((b: LaneBracket) => setLoaded((prev) => ({ ...prev, [bracket]: b })))
      .catch(() => {
        requested.current.delete(bracket);
        if (bracket !== DEFAULT_BRACKET) setBracket(DEFAULT_BRACKET);
        else setFailed(true);
      });
  }, [bracket]);

  // Older data files still list "all"; the page shows the ranks and tournaments only.
  const brackets = useMemo(() => (index?.brackets ?? [DEFAULT_BRACKET]).filter((b) => b !== "all"), [index]);
  const byId = useMemo(() => new Map((heroes ?? []).map((h) => [h.id, h])), [heroes]);
  const data = loaded[bracket];
  const hero = heroId !== null ? byId.get(heroId) ?? null : null;
  const roles = useMemo(() => rolesFor(data, heroId), [data, heroId]);
  // The chosen role, if the hero has data for it; otherwise its main role.
  const activeRole = role !== null && roles.includes(role) ? role : roles[0] ?? null;
  const lanes = heroId !== null && activeRole !== null ? data?.[heroId]?.[activeRole] : undefined;
  const solo = activeRole === 2;
  const activeTab: Tab = solo && tab === "partners" ? "tough" : tab;

  // Keep the selection in the address bar, so it can be shared or refreshed as-is.
  useEffect(() => {
    const qs = [
      heroId !== null && `h=${heroId}`,
      heroId !== null && activeRole !== null && `r=${activeRole}`,
      bracket !== DEFAULT_BRACKET && `b=${bracket}`,
      heroId !== null && activeTab !== "partners" && `t=${activeTab}`,
    ]
      .filter(Boolean)
      .join("&");
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [heroId, activeRole, bracket, activeTab]);

  // Counted once per visit, the first time a hero's lanes show.
  const used = useRef(false);
  useEffect(() => {
    if (used.current || !lanes) return;
    used.current = true;
    track("Lane Combos used");
  }, [lanes]);

  /**
   * The list for the active tab. Best partners and Easy lanes only list lanes that are won at least
   * as often as they're lost AND go better than the hero's usual lane: a "best" partner that loses
   * more lanes than it wins isn't a recommendation. If few qualify, the list is just shorter.
   */
  const rows = useMemo(() => {
    if (!lanes) return [];
    const baseWin = lanes.base[1];
    const prior = priorGames(bracket);
    const score = (r: LaneRow) => (r[2] * r[1] + prior * baseWin) / (r[1] + prior);
    const good = (r: LaneRow) => r[2] >= r[4] && r[2] >= baseWin;
    if (activeTab === "partners") return lanes.with.filter(good);
    if (activeTab === "tough") return lanes.vs.filter((r) => score(r) < baseWin).sort((a, b) => score(a) - score(b)).slice(0, 12);
    return lanes.vs.filter(good).sort((a, b) => score(b) - score(a)).slice(0, 12);
  }, [lanes, activeTab, bracket]);
  // What the games are from: the patch for ranks ("Patch 7.41f"), the days for tournaments.
  const patch = bracket !== "tournaments" && index?.patch ? index.patch : null;
  const dates = patch ? `Patch ${patch}` : dateRange(index, bracket);
  const few = fewGames(bracket);

  function pickHero(id: number, pos?: number) {
    setHeroId(id);
    setRole(pos ?? null);
    setQuery("");
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address bar still has the link */
    }
  }

  const matches = useMemo(() => {
    if (!heroes) return [];
    const q = query.trim().toLowerCase();
    const initials = (n: string) =>
      n
        .split(/[\s-]+/)
        .map((w) => w[0])
        .join("")
        .toLowerCase();
    return heroes.filter(
      (h) =>
        (gridRole === null || !data || Boolean(data[h.id]?.[gridRole])) &&
        (!q || h.name.toLowerCase().includes(q) || initials(h.name).startsWith(q)),
    );
  }, [heroes, query, gridRole, data]);

  return (
    <section className="py-6 sm:py-8">
      <WideContainer>
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">Lane Combos</h1>
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-text-muted">
            <span className="text-gold">Free tool</span> · Powered by STRATZ and OpenDota
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted">
            The duos that win their lane, and the lanes to watch out for. From real matches, by role and rank, plus
            pro tournament games.
          </p>
        </div>

        {failed && (
          <p className="mt-4 text-center text-sm text-text-muted">
            The lane data couldn't load.{" "}
            <button type="button" onClick={() => window.location.reload()} className="font-bold text-gold hover:underline">
              Try again
            </button>
          </p>
        )}

        <div ref={topRef} className="scroll-mt-20" />

        {/* Back to the start: the strongest duos, no hero picked. */}
        {hero && (
          <button
            type="button"
            onClick={() => {
              setHeroId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-control border border-navy-border bg-navy-raised/70 px-3 py-2 text-xs font-bold text-text transition hover:border-gold/60 hover:text-gold"
          >
            <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
            Back to Lane Combos
          </button>
        )}

        {/* The chosen hero, or the showcase before one is picked */}
        {hero ? (
          data ? (
            <HeroBanner
              hero={hero}
              roles={roles}
              activeRole={activeRole}
              lanes={lanes}
              dates={dates}
              onRole={setRole}
              onClear={() => setHeroId(null)}
            />
          ) : (
            <div className="mt-3 h-40 animate-pulse rounded-card border border-navy-border bg-navy-raised/60" aria-label="Loading" />
          )
        ) : (
          <TopDuos
            duos={duos}
            brackets={brackets}
            bracket={bracket}
            onBracket={setBracket}
            byId={byId}
            dates={dates}
            onPick={pickHero}
          />
        )}

        {/* Results */}
        {hero && data && (
          <div className="mt-4 rounded-card border border-gold/25 bg-navy-raised/80 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-3 rounded-control border border-navy-border p-1 lg:inline-grid">
                {TABS.map((t) => {
                  const disabled = t.key === "partners" && solo;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTab(t.key)}
                      aria-pressed={activeTab === t.key}
                      title={disabled ? "Mid is a solo lane" : undefined}
                      className={`rounded-[7px] px-2 py-2 text-xs font-extrabold transition sm:px-4 sm:text-sm ${
                        activeTab === t.key ? t.on : "text-text-muted hover:text-text"
                      } disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-text-muted`}
                    >
                      <span className="sm:hidden">{t.short}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 lg:flex">
                {brackets.length > 1 && (
                  <select
                    value={bracket}
                    onChange={(e) => setBracket(e.target.value)}
                    className="w-full rounded-control border border-navy-border bg-navy px-3 py-2.5 text-sm text-text lg:w-auto lg:py-2"
                    aria-label="Rank bracket"
                  >
                    {brackets.map((b) => (
                      <option key={b} value={b}>
                        {BRACKET_LABELS[b] ?? b}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={share}
                  className={`rounded-control border border-navy-border px-3 py-2.5 text-sm font-bold text-text transition hover:border-gold/60 lg:py-2 ${
                    brackets.length > 1 ? "" : "col-span-2"
                  }`}
                >
                  {copied ? "Link copied" : "Share"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-text-muted">
              {activeTab === "partners" && (
                <>
                  Who to lane with as <strong className="text-text">{hero.name}</strong>{" "}
                  {activeRole && <>({ROLE_NAMES[activeRole].toLowerCase()})</>}: the partners that win this lane most.
                </>
              )}
              {activeTab === "tough" && (
                <>
                  The lane opponents that beat <strong className="text-text">{hero.name}</strong> most. Play safe, or ask
                  for help early.
                </>
              )}
              {activeTab === "easy" && (
                <>
                  The lane opponents <strong className="text-text">{hero.name}</strong> beats most. Play these lanes for
                  the kill.
                </>
              )}
              {solo && activeTab !== "partners" && <span className="text-text-muted"> Mid is a solo lane, so there are no partners.</span>}
            </p>

            {/* Pros pick some heroes rarely: say so, instead of lists that look broken. */}
            {bracket === "tournaments" && (!lanes || lanes.base[0] < RARE_IN_TOURNAMENTS) && (
              <div className="mt-3 flex flex-col gap-3 rounded-control border border-[#FF8A4C55] bg-[#FF8A4C0d] p-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <strong className="text-text">Pros rarely play {hero.name}{activeRole ? ` as ${ROLE_NAMES[activeRole].toLowerCase()}` : ""}.</strong>{" "}
                  {lanes
                    ? `Only ${fmt(lanes.base[0])} tournament ${lanes.base[0] === 1 ? "lane" : "lanes"}${dates ? ` (${dates})` : ""}, too few for solid partners and matchups.`
                    : "Not enough tournament games to show its lanes."}{" "}
                  Divine–Immortal has far more games for it.
                </p>
                <button
                  type="button"
                  onClick={() => setBracket("divine_immortal")}
                  className="shrink-0 rounded-control border border-gold/60 px-3 py-2 text-xs font-bold text-gold transition hover:bg-gold/10"
                >
                  See Divine–Immortal
                </button>
              </div>
            )}

            {lanes && rows[0] && byId.get(rows[0][0]) && (
              <HowToRead
                example={{
                  hero: hero.name,
                  other: byId.get(rows[0][0])!.name,
                  against: activeTab !== "partners",
                  games: rows[0][1],
                  win: rows[0][2],
                  draw: rows[0][3],
                  loss: rows[0][4],
                }}
                few={few}
              />
            )}

            <div className="mt-3">
              {!lanes ? (
                <p className="px-4 py-6 text-center text-sm text-text-muted">No lane data for {hero.name} {bracket === "tournaments" ? "in recent tournaments" : "in this rank"} yet.</p>
              ) : !rows.length ? (
                <p className="px-4 py-6 text-center text-sm text-text-muted">
                  {activeTab === "tough"
                    ? "No lane stands out as tough for this hero yet."
                    : activeTab === "partners"
                      ? `No partner wins more lanes than it loses with ${hero.name} in this rank yet. Try another rank or role.`
                      : `No lane opponent ${hero.name} beats more often than it loses to in this rank yet.`}
                </p>
              ) : (
                <ol className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  {rows.map((r, i) => {
                    const other = byId.get(r[0]);
                    return other ? (
                      <ComboCard
                        key={r[0]}
                        rank={i + 1}
                        heroName={hero.name}
                        other={other}
                        row={r}
                        kind={activeTab}
                        few={few}
                        onOpen={() => pickHero(other.id)}
                      />
                    ) : null;
                  })}
                </ol>
              )}
            </div>

            <Footnote updated={index?.updated} bracket={bracket} dates={dates} patch={patch} />
          </div>
        )}
        {!hero && duos && <Footnote updated={index?.updated} bracket={bracket} dates={dates} patch={patch} boxed />}

        {/* Hero picker */}
        <div className="mt-6">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold">
            {hero ? "Check another hero" : "Pick your hero"}
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches[0]) pickHero(matches[0].id);
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Type a hero, Enter opens its lanes"
            className="w-full rounded-control border border-navy-border bg-navy-raised px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-gold focus:outline-none"
            aria-label="Search heroes"
          />
          <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <Chip on={gridRole === null} onClick={() => setGridRole(null)}>
              All heroes
            </Chip>
            {[1, 2, 3, 4, 5].map((p) => (
              <Chip key={p} on={gridRole === p} onClick={() => setGridRole(gridRole === p ? null : p)}>
                {ROLE_NAMES[p]}
              </Chip>
            ))}
          </div>

          <div className="mt-5 space-y-5">
            {ATTRS.map((a) => {
              const list = matches.filter((h) => h.attr === a.key);
              if (!list.length) return null;
              return (
                <div key={a.key}>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{a.label}</p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(74px,1fr))] gap-1">
                    {list.map((h) => {
                      const on = h.id === heroId;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => pickHero(h.id, gridRole ?? undefined)}
                          title={h.name}
                          aria-pressed={on}
                          className={`group relative aspect-[16/9] overflow-hidden rounded-md border transition ${
                            on ? "border-gold ring-1 ring-gold" : "border-transparent hover:border-gold/70"
                          }`}
                        >
                          <img src={img(h)} alt={h.name} width={192} height={108} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1 pb-0.5 pt-3 text-left text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                            {h.name}
                          </span>
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

interface Split {
  /** Games won / draw / lost, and their total (they always add up). */
  won: number;
  draw: number;
  lost: number;
  total: number;
  /** The same as whole percentages that add up to exactly 100. */
  pct: [number, number, number];
}

/**
 * Turns STRATZ's numbers into games that add up. STRATZ gives a game count plus won / draw / lost as
 * percentages, and a few lanes it couldn't score are in none of the three. Those are left out, so
 * won + draw + lost = the total shown, and the percentages are of that total (largest-remainder
 * rounding, so they add up to 100, never 99 or 101).
 */
function split(games: number, win: number, draw: number, loss: number): Split {
  const won = Math.round((games * win) / 100);
  const drawn = Math.round((games * draw) / 100);
  const lost = Math.round((games * loss) / 100);
  const total = won + drawn + lost;
  if (!total) return { won, draw: drawn, lost, total, pct: [0, 0, 0] };
  const raw = [won, drawn, lost].map((n) => (n / total) * 100);
  const pct = raw.map(Math.floor) as [number, number, number];
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  const missing = 100 - pct.reduce((s, v) => s + v, 0);
  for (let k = 0; k < missing; k++) pct[order[k][1]]++;
  return { won, draw: drawn, lost, total, pct };
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** The three numbers every lane is shown with: won, draw, lost (green, grey, red), each as % and games. */
function WDL({ s, className = "" }: { s: Split; className?: string }) {
  const cell = (label: string, pct: number, count: number, color: string) => (
    <span className="flex min-w-[2.6rem] flex-col items-center leading-none">
      <span className={`text-sm font-black sm:text-base ${color}`}>{pct}%</span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-text-muted">{label}</span>
      <span className="mt-0.5 text-[10px] font-semibold text-text-muted/80">{fmt(count)}</span>
    </span>
  );
  return (
    <span
      className={`flex shrink-0 items-start gap-1 sm:gap-2 ${className}`}
      aria-label={`${fmt(s.total)} games: won ${fmt(s.won)} (${s.pct[0]}%), draw ${fmt(s.draw)} (${s.pct[1]}%), lost ${fmt(s.lost)} (${s.pct[2]}%)`}
    >
      {cell("Won", s.pct[0], s.won, "text-emerald-400")}
      {cell("Draw", s.pct[1], s.draw, "text-text-muted")}
      {cell("Lost", s.pct[2], s.lost, "text-red-400")}
    </span>
  );
}

/** Win / draw / loss as one bar (green, grey, red), scaled to the lanes that had a result. */
function LaneBar({ win, draw, loss, className = "" }: { win: number; draw: number; loss: number; className?: string }) {
  const total = win + draw + loss || 1;
  return (
    <span className={`flex h-1.5 overflow-hidden rounded-full bg-navy ${className}`} aria-hidden>
      <span className="bg-emerald-400" style={{ width: `${(win / total) * 100}%` }} />
      <span className="bg-text-muted/40" style={{ width: `${(draw / total) * 100}%` }} />
      <span className="bg-red-400" style={{ width: `${(loss / total) * 100}%` }} />
    </span>
  );
}

/**
 * The chosen hero. Phones: small portrait beside the name, "Change hero" in the corner, roles and the
 * usual lane full width underneath, so the banner stays short. Wider screens: portrait on the left,
 * everything else in one column beside it.
 */
function HeroBanner({
  hero,
  roles,
  activeRole,
  lanes,
  dates,
  onRole,
  onClear,
}: {
  hero: Hero;
  roles: number[];
  activeRole: number | null;
  lanes: RoleLanes | undefined;
  /** What these games are from: "Patch 7.41f", or days like "Sep 1 – Oct 30". */
  dates: string | null;
  onRole: (r: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-card border border-gold/40 bg-navy-raised shadow-[0_0_50px_-20px_rgba(232,181,74,0.45)]">
      {/* Hero art fading into the card */}
      <img
        src={img(hero)}
        alt=""
        width={192}
        height={108}
        className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-30 [mask-image:linear-gradient(to_left,black_10%,transparent_75%)] sm:w-2/3"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-6 sm:p-6">
        <img
          src={img(hero)}
          alt={hero.name}
          width={192}
          height={108}
          className="h-14 w-24 rounded-control border border-gold/50 object-cover sm:row-span-2 sm:h-24 sm:w-44"
        />
        <div className="min-w-0 pr-24 sm:pr-0">
          <h2 className="font-display text-xl font-bold leading-tight text-text sm:text-3xl">{hero.name}</h2>
          {activeRole && (
            <span className="mt-1 inline-block rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-gold">
              {LANE_OF[activeRole]}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-4 rounded-control border border-navy-border bg-navy/70 px-3 py-2 text-xs font-bold text-text transition hover:border-gold/60 sm:static sm:row-span-2 sm:self-center"
        >
          Change hero
        </button>

        {/* Roles and the usual lane: full width on phones, beside the portrait on wider screens. */}
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
          {roles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-black uppercase tracking-[0.16em] text-text-muted">Playing as</span>
              {roles.map((r) => (
                <Chip key={r} on={activeRole === r} onClick={() => onRole(r)}>
                  {ROLE_NAMES[r]}
                </Chip>
              ))}
            </div>
          )}
          {lanes &&
            (() => {
              const s = split(lanes.base[0], lanes.base[1], lanes.base[2], lanes.base[3]);
              return (
            <div className="mt-3 max-w-md">
              <p className="flex flex-wrap items-baseline gap-x-3 text-xs text-text-muted">
                <span className="font-black uppercase tracking-[0.16em]">All its lanes</span>
                <span>
                  <strong className="text-emerald-400">Won {s.pct[0]}%</strong> · Draw {s.pct[1]}% ·{" "}
                  <strong className="text-red-400">Lost {s.pct[2]}%</strong>
                </span>
              </p>
              <LaneBar win={s.won} draw={s.draw} loss={s.lost} className="mt-1.5" />
              <p className="mt-1 text-[11px] text-text-muted">{fmt(s.total)} games{dates && <> · {dates}</>}</p>
            </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

/** One partner or opponent: who, how many lanes, and how those lanes went (won, draw, lost). */
function ComboCard({
  rank,
  heroName,
  other,
  row,
  kind,
  few: fewLimit,
  onOpen,
}: {
  rank: number;
  /** The chosen hero, for the tooltip. */
  heroName: string;
  other: Hero;
  row: LaneRow;
  kind: Tab;
  /** Fewer games than this get the "few games" tag. */
  few: number;
  onOpen: () => void;
}) {
  const [, games, win, draw, loss, stompWin, stompLoss, gameWin] = row;
  const s = split(games, win, draw, loss);
  const few = s.total < fewLimit;
  const tone = kind === "tough" ? "border-red-500/25 bg-red-500/[0.04]" : kind === "easy" ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-navy-border bg-navy/60";
  return (
    <li
      className={`rounded-control border p-2.5 ${tone}`}
      title={`${heroName} ${kind === "partners" ? "with" : "against"} ${other.name}, ${fmt(s.total)} games: won ${fmt(s.won)}, draw ${fmt(s.draw)}, lost ${fmt(s.lost)}.`}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-4 shrink-0 text-center text-xs font-black text-text-muted">{rank}</span>
        <button type="button" onClick={onOpen} title={`See ${other.name}'s lanes`} className="shrink-0 overflow-hidden rounded transition hover:ring-1 hover:ring-gold">
          <img src={img(other)} alt="" width={64} height={36} className="block h-9 w-16 object-cover" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-extrabold leading-tight text-text">
            <button type="button" onClick={onOpen} title={`See ${other.name}'s lanes`} className="min-w-0 text-left transition hover:text-gold">
              {other.name}
            </button>
            {few && (
              <span title="Only a few lanes so far" className="shrink-0 rounded bg-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                few games
              </span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-text-muted">{fmt(s.total)} games</p>
        </div>
      </div>
      {/* Its own row across the card, so long names never collide with the numbers. */}
      <WDL s={s} className="mt-2.5 w-full justify-around" />
      <LaneBar win={s.won} draw={s.draw} loss={s.lost} className="mt-2" />
      <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-[10px] font-semibold text-text-muted">
        <span>{kind === "tough" ? `Big lane losses ${Math.round(stompLoss)}%` : `Big lane wins ${Math.round(stompWin)}%`}</span>
        <span>Game won {Math.round(gameWin)}%</span>
      </p>
    </li>
  );
}

/** Each rank's color, used for its tab dot and its "Best in" badge. */
const RANK_COLORS: Record<string, string> = {
  herald_guardian: "#9CA86B",
  crusader_archon: "#4FB4A3",
  legend_ancient: "#5B8DEF",
  divine_immortal: "#B38CFF",
  tournaments: "#FF8A4C",
};

function RankDot({ bracket }: { bracket: string }) {
  const color = RANK_COLORS[bracket];
  return color ? (
    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
  ) : (
    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-gold" />
  );
}

/**
 * Before a hero is picked: the strongest duos right now (duos.json, built weekly), safe lane (carry +
 * partner) and off lane (offlaner + partner), per rank. Each duo also says which rank it works best
 * in, so people can see where a combo really shines.
 */
function TopDuos({
  duos,
  brackets,
  bracket,
  onBracket,
  byId,
  dates,
  onPick,
}: {
  duos: DuosFile | null;
  brackets: string[];
  bracket: string;
  onBracket: (b: string) => void;
  byId: Map<number, Hero>;
  /** The days these games are from. */
  dates: string | null;
  onPick: (heroId: number, role: number) => void;
}) {
  const raw = duos?.[bracket];
  const tournaments = bracket === "tournaments";
  if (!raw) {
    return <div className="mt-5 h-64 animate-pulse rounded-card border border-navy-border bg-navy-raised/60" aria-label="Loading" />;
  }
  // Highest "Won" % first, by the percentage shown on screen (ties: the more precise number).
  const shownWin = (d: Duo) => split(d.games, d.win, d.draw, d.loss).pct[0];
  const byWin = (list: Duo[]) => [...list].sort((x, y) => shownWin(y) - shownWin(x) || y.win - x.win);
  const lists = { safe: byWin(raw.safe), off: byWin(raw.off) };

  // The #1 safe-lane duo, used as the worked example in "How to read these numbers".
  const first = lists.safe[0];
  const topExample =
    first && byId.get(first.a) && byId.get(first.b)
      ? { a: byId.get(first.a)!.name, b: byId.get(first.b)!.name, games: first.games, win: first.win, draw: first.draw, loss: first.loss }
      : null;

  return (
    <div className="relative mt-5 overflow-hidden rounded-card border border-gold/30 bg-navy-raised/80 p-4 sm:p-6">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">{dates ?? "Recent games"}</p>
          <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">
            {bracket === "tournaments" ? "Strongest lane duos in pro tournaments" : "Strongest lane duos right now"}
          </h2>
        </div>
        <p className="text-xs text-text-muted">Pick a hero below for its own partners and matchups.</p>
      </div>

      {/* Rank tabs: every rank has its own top duos. */}
      <div
        role="tablist"
        aria-label="Rank"
        className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {brackets.map((b) => {
          const on = b === bracket;
          return (
            <button
              key={b}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onBracket(b)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                on ? "border-gold bg-gold/15 text-gold" : "border-navy-border text-text-muted hover:text-text"
              }`}
            >
              <RankDot bracket={b} />
              {BRACKET_LABELS[b] ?? b}
            </button>
          );
        })}
      </div>

      {topExample && (
        <HowToRead
          example={{ hero: topExample.a, other: topExample.b, against: false, games: topExample.games, win: topExample.win, draw: topExample.draw, loss: topExample.loss }}
          bestIn={!tournaments}
          few={fewGames(bracket)}
        />
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {(
          [
            ["Safe lane", "Carry + partner", lists.safe],
            ["Off lane", "Offlaner + partner", lists.off],
          ] as const
        ).map(([title, sub, list]) => (
          // min-w-0: grid columns otherwise refuse to shrink below their content on phones.
          <div key={title} className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold text-text">{title}</span>
              <span className="text-xs text-text-muted">{sub}</span>
            </p>
            {!list.length ? (
              <p className="mt-2.5 rounded-control border border-dashed border-navy-border px-3 py-4 text-center text-xs text-text-muted">
                Not enough lanes in this rank yet.
              </p>
            ) : (
              <ol className="mt-2.5 space-y-2">
                {list.map((d, i) => {
                  const a = byId.get(d.a);
                  const b = byId.get(d.b);
                  if (!a || !b) return null;
                  const s = split(d.games, d.win, d.draw, d.loss);
                  // One badge per list: the first duo, the highest lanes won %. None for tournaments.
                  const best = !tournaments && i === 0;
                  const ranksText = tournaments
                    ? ""
                    : Object.entries(d.ranks)
                        .map(([rk, [w, , g]]) => `${BRACKET_LABELS[rk] ?? rk}: won ${Math.round(w)}% of ${fmt(g)} games`)
                        .join("\n");
                  // Each hero opens its own lanes: the carry / offlaner in its role, the partner as a support.
                  const heroLink = (h: Hero, role: number, plus: boolean) => (
                    <button
                      type="button"
                      onClick={() => onPick(h.id, role)}
                      title={`See ${h.name}'s lanes`}
                      className="group/hero flex min-w-0 max-w-full items-center gap-2 rounded text-left"
                    >
                      <img
                        src={img(h)}
                        alt=""
                        width={64}
                        height={36}
                        className="h-6 w-10 shrink-0 rounded border border-navy-border object-cover transition group-hover/hero:border-gold sm:h-8 sm:w-14"
                      />
                      <span className="min-w-0 truncate text-sm font-bold leading-tight text-text transition group-hover/hero:text-gold">
                        {plus && <span className="text-text-muted">+ </span>}
                        {h.name}
                      </span>
                    </button>
                  );
                  return (
                    <li
                      key={`${d.a}-${d.b}`}
                      title={ranksText ? `Lanes won by rank:
${ranksText}` : undefined}
                      className="rounded-control border border-navy-border bg-navy/60 p-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="w-4 shrink-0 text-center text-xs font-black text-text-muted">{i + 1}</span>
                        {/* One hero per line, so long pairs never run into the numbers. */}
                        <div className="min-w-0 flex-1 space-y-1">
                          {heroLink(a, d.role, false)}
                          {heroLink(b, d.role === 1 ? 5 : 4, true)}
                          <p className="text-[11px] font-semibold text-text-muted">{fmt(s.total)} games</p>
                        </div>
                        {/* Wider screens: the numbers sit beside the names. */}
                        <WDL s={s} className="hidden sm:flex" />
                      </div>
                      {/* Second line: the rank badge, and on phones the numbers too, so names keep the full width.
                          It wraps instead of running off the edge on narrow phones. */}
                      <div className={`mt-1.5 flex-wrap items-center gap-2 pl-6 ${best ? "flex" : "flex sm:hidden"}`}>
                        {best && <BestIn />}
                        <WDL s={s} className="ml-auto sm:hidden" />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Best in this rank": the safe lane and off lane duo with the highest lanes won % in the rank being viewed. */
function BestIn() {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gold/60 px-2 py-0.5 text-[10px] font-bold text-gold">
      <Icon name="star" className="h-2.5 w-2.5" />
      Best in this rank
    </span>
  );
}

/**
 * "How to read these numbers": a tap-to-open guide (tooltips don't work on phones), explained with a
 * real example from the list on screen, so "Won 43% · Draw 27% · Lost 21%" means something concrete.
 */
function HowToRead({
  example,
  bestIn = false,
  few,
}: {
  example: { hero: string; other: string; against: boolean; games: number; win: number; draw: number; loss: number };
  /** Also explain the showcase's "Best in" rank badge. */
  bestIn?: boolean;
  /** The "few games" limit for this bracket. */
  few: number;
}) {
  const [open, setOpen] = useState(false);
  const pair = example.against ? `${example.hero} against ${example.other}` : `${example.hero} with ${example.other}`;
  const s = split(example.games, example.win, example.draw, example.loss);

  const items: { label: React.ReactNode; text: React.ReactNode }[] = [
    {
      label: <WDL s={s} />,
      text: (
        <>
          <strong className="text-text">How the lanes went.</strong> {pair}, {fmt(s.total)} games:{" "}
          <span className="text-emerald-400">
            won {fmt(s.won)} ({s.pct[0]}%)
          </span>
          , draw {fmt(s.draw)} ({s.pct[1]}%),{" "}
          <span className="text-red-400">
            lost {fmt(s.lost)} ({s.pct[2]}%)
          </span>
          . The three always add up to the games shown. Many lanes end even, so compare won with lost, not with 50%.
        </>
      ),
    },
    {
      label: <LaneBar win={40} draw={25} loss={35} className="w-28 sm:w-full" />,
      text: (
        <>
          <strong className="text-text">The bar.</strong> The same three numbers side by side: <span className="text-emerald-400">won</span>,
          draw (grey) and <span className="text-red-400">lost</span>.
        </>
      ),
    },
    {
      label: <span className="text-xs font-black text-text-muted">Order</span>,
      text: (
        <>
          {bestIn ? (
            <>
              <strong className="text-text">Highest first.</strong> Each list is ordered by lanes won %, highest to lowest, and
              only shows duos that win more lanes than they lose.
            </>
          ) : (
            <>
              <strong className="text-text">Best first.</strong> Lists are ordered by how much the lane improves compared with
              how that hero's lanes usually go, and Best partners only shows duos that win more lanes than they lose.
            </>
          )}
        </>
      ),
    },
    {
      label: <span className="text-xs font-black text-text-muted">Big lane wins · Game won</span>,
      text: (
        <>
          <strong className="text-text">Big lane wins</strong> (or, in Tough lanes, big losses) are lanes decided by a large
          margin. <strong className="text-text">Game won</strong> is how often the whole game was won after that lane.
        </>
      ),
    },
    {
      label: (
        <span className="rounded bg-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">few games</span>
      ),
      text: (
        <>
          Fewer than {few} games so far: a rough guide, not a sure thing. (A few lanes STRATZ couldn't score are left
          out of every count.)
        </>
      ),
    },
    ...(bestIn
      ? [
          {
            label: (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/60 px-1.5 py-0.5 text-[9px] font-bold text-gold">
                <Icon name="star" className="h-2 w-2" />
                Best in this rank
              </span>
            ),
            text: (
              <>
                <strong className="text-text">Best in this rank.</strong> The safe lane duo and the off lane duo with the highest
                lanes won % in the rank you're viewing. Every rank plays lanes differently, so pick yours in the rank tabs.
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:underline"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gold text-[10px] font-black leading-none">?</span>
        {open ? "Hide the guide" : "How to read these numbers"}
      </button>
      {open && (
        <dl className="mt-3 grid gap-x-6 gap-y-3 rounded-control border border-gold/25 bg-navy/60 p-3 sm:grid-cols-2 sm:p-4">
          {items.map((it, i) => (
            // Phones: the example above its explanation; wider screens: side by side.
            <div key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
              <dt className="flex shrink-0 pt-0.5 sm:w-32 sm:justify-end">{it.label}</dt>
              <dd className="min-w-0 text-xs leading-relaxed text-text-muted">{it.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Footnote({
  updated,
  bracket,
  dates,
  patch,
  boxed = false,
}: {
  updated?: string;
  bracket: string;
  /** The days these games are from. */
  dates: string | null;
  /** The patch the rank brackets cover, if known. */
  patch: string | null;
  boxed?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted ${
        boxed ? "mt-3 px-1" : "mt-4 border-t border-navy-border pt-3"
      }`}
    >
      <span>
        {bracket === "tournaments"
          ? `Data from professional tournament games${dates ? ` played ${dates}` : ""} (match list by OpenDota, lanes scored by STRATZ).`
          : `Data from real public matches${patch ? ` on patch ${patch}` : dates ? ` played ${dates}` : ""}.`}{" "}
        Lane win, draw and loss are REAL results for the laning stage, so many lanes are draws.{" "}
        {updated && `Updated ${new Date(updated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`}
      </span>
      <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-gold hover:underline">
        Know the lane, not how to win it? See 6SLOT <Icon name="arrow" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
