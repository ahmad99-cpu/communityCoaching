import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useContent, useContentReload } from "@/lib/content";
import { patchContent } from "@/admin/content";
import { prizeTitle } from "@/content/prize";
import { PRIZE_CATEGORY_LABELS, type GiveawayItem, type Prize, type PrizeCategory } from "@/content/types";
import { Panel, SmallButton, inputClass } from "@/admin/ui";

interface Entry {
  id: string;
  name: string;
  name_key: string;
  created_at: string;
}

interface Draw {
  id: string;
  prize: Prize;
  winner_name: string;
  entries_count: number;
  drawn_at: string;
  drawn_by: string | null;
}

/**
 * Same rule as the `name_key` column in supabase/giveaway_draws.sql, so the instant
 * check here and the database's unique constraint always agree.
 */
function nameKey(name: string) {
  return name.trim().replace(/^@+/, "").replace(/\s+/g, " ").toLowerCase();
}

/** Unbiased random index using the browser's cryptographic random generator. */
function randomIndex(n: number) {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % n;
}

/** Splits pasted text into names: one per line, or comma separated. */
function splitNames(text: string) {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

type Notice = { kind: "ok" | "warn" | "error"; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const tone = notice.kind === "ok" ? "text-emerald-400" : notice.kind === "warn" ? "text-orange-400" : "text-red-400";
  return (
    <p className={`text-sm ${tone}`} role="status">
      {notice.text}
    </p>
  );
}

/** Slot-machine style reel: flicks through names, slowing down, and stops on the winner. */
function useSpinReel() {
  const [display, setDisplay] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const spin = useCallback((names: string[], winner: string) => {
    return new Promise<void>((resolve) => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setSpinning(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ticks = reduce ? 1 : 32;
      let t = 0;
      for (let i = 0; i < ticks; i++) {
        // Ease-out: gaps grow from ~50ms to ~350ms, about 4 seconds in total.
        t += reduce ? 0 : 50 + 300 * Math.pow(i / ticks, 2.2);
        const last = i === ticks - 1;
        timers.current.push(
          window.setTimeout(() => {
            setDisplay(last ? winner : names[Math.floor(Math.random() * names.length)]);
            if (last) {
              setSpinning(false);
              resolve();
            }
          }, t),
        );
      }
    });
  }, []);

  return { display, spinning, spin };
}

function DrawPanel({
  giveaway,
  userId,
  onChanged,
}: {
  giveaway: GiveawayItem;
  userId: string | null;
  /** Called after entries or draws change (refreshes the picker counts). */
  onChanged: () => void;
}) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadError, setLoadError] = useState("");
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [skipPastWinners, setSkipPastWinners] = useState(true);
  const [winner, setWinner] = useState<{ name: string; poolSize: number; drawnAt: string; saved: boolean; error?: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const reloadContent = useContentReload();
  const reel = useSpinReel();

  const load = useCallback(async () => {
    const [e, d] = await Promise.all([
      supabase.from("giveaway_entries").select("id, name, name_key, created_at").eq("giveaway_id", giveaway.id).order("created_at"),
      supabase.from("giveaway_draws").select("*").eq("giveaway_id", giveaway.id).order("drawn_at", { ascending: false }),
    ]);
    if (e.error || d.error) {
      setLoadError((e.error ?? d.error)!.message);
      return;
    }
    setLoadError("");
    setEntries(e.data as Entry[]);
    setDraws(d.data as Draw[]);
    onChanged();
  }, [giveaway.id, onChanged]);

  // The panel is keyed by giveaway id, so switching giveaway starts fresh.
  useEffect(() => {
    load();
  }, [load]);

  const byKey = useMemo(() => new Map((entries ?? []).map((e) => [e.name_key, e])), [entries]);

  /** Adds names, skipping ones already entered (here or in the database). */
  async function addNames(names: string[]) {
    const seen = new Set<string>();
    const fresh: string[] = [];
    const dupes: string[] = [];
    for (const raw of names) {
      const key = nameKey(raw);
      if (!key) continue;
      if (byKey.has(key) || seen.has(key)) dupes.push(raw);
      else {
        seen.add(key);
        fresh.push(raw.trim());
      }
    }
    if (fresh.length === 0) {
      setNotice({
        kind: "warn",
        text:
          dupes.length === 1
            ? `“${dupes[0]}” is already entered (as “${byKey.get(nameKey(dupes[0]))?.name ?? dupes[0]}”).`
            : `All ${dupes.length} names are already entered.`,
      });
      return false;
    }

    setBusy(true);
    // ignoreDuplicates: if the other admin added the same name a second ago, the
    // database's unique rule skips it instead of failing the whole batch.
    const { data, error } = await supabase
      .from("giveaway_entries")
      .upsert(
        fresh.map((name) => ({ giveaway_id: giveaway.id, name })),
        { onConflict: "giveaway_id,name_key", ignoreDuplicates: true },
      )
      .select("id");
    setBusy(false);
    if (error) {
      setNotice({ kind: "error", text: error.message });
      return false;
    }
    const added = data?.length ?? 0;
    const raced = fresh.length - added;
    const skipped = dupes.length + raced;
    setNotice({
      kind: skipped ? "warn" : "ok",
      text:
        `Added ${added} name${added === 1 ? "" : "s"}.` +
        (skipped ? ` Skipped ${skipped} already entered${dupes.length ? `: ${dupes.slice(0, 5).join(", ")}${dupes.length > 5 ? "…" : ""}` : ""}.` : ""),
    });
    await load();
    return true;
  }

  async function submitSingle(e: FormEvent) {
    e.preventDefault();
    if (!single.trim()) return;
    if (await addNames([single])) setSingle("");
  }

  async function submitBulk() {
    const names = splitNames(bulk);
    if (names.length === 0) return;
    if (await addNames(names)) {
      setBulk("");
      setShowBulk(false);
    }
  }

  async function removeEntry(entry: Entry) {
    if (!window.confirm(`Remove “${entry.name}” from this giveaway?`)) return;
    const { error } = await supabase.from("giveaway_entries").delete().eq("id", entry.id);
    if (error) return setNotice({ kind: "error", text: error.message });
    setNotice({ kind: "ok", text: `Removed “${entry.name}”.` });
    load();
  }

  const pastWinnerKeys = useMemo(() => new Set(draws.map((d) => nameKey(d.winner_name))), [draws]);
  const pool = useMemo(
    () => (entries ?? []).filter((e) => !(skipPastWinners && pastWinnerKeys.has(e.name_key))),
    [entries, skipPastWinners, pastWinnerKeys],
  );

  async function spin() {
    if (pool.length === 0 || reel.spinning) return;
    setWinner(null);
    setNotice(null);
    const picked = pool[randomIndex(pool.length)];
    await reel.spin(
      pool.map((e) => e.name),
      picked.name,
    );
    const { data, error } = await supabase
      .from("giveaway_draws")
      .insert({
        giveaway_id: giveaway.id,
        prize: giveaway.prize,
        winner_name: picked.name,
        entries_count: pool.length,
      })
      .select("drawn_at")
      .single();
    setWinner({
      name: picked.name,
      poolSize: pool.length,
      drawnAt: (data as { drawn_at: string } | null)?.drawn_at ?? new Date().toISOString(),
      saved: !error,
      error: error?.message,
    });
    load();
  }

  /** Shows (or hides, with null) a winner on the public giveaway card. */
  async function setPublicWinner(w: { name: string; drawnAt: string } | null) {
    const ask = w
      ? `Show “${w.name}” as the winner of ${prizeTitle(giveaway.prize)} on the website? Everyone will be able to see it.`
      : "Hide the winner from the website?";
    if (!window.confirm(ask)) return;
    setPublishing(true);
    try {
      await patchContent("giveaway", (g) => ({
        ...g,
        items: g.items.map((item) => (item.id === giveaway.id ? { ...item, winner: w } : item)),
      }));
      await reloadContent();
      setNotice({ kind: "ok", text: w ? `“${w.name}” is now shown on the website.` : "Winner hidden from the website." });
    } catch (e) {
      setNotice({ kind: "error", text: (e as Error).message });
    } finally {
      setPublishing(false);
    }
  }

  const shownKey = giveaway.winner ? nameKey(giveaway.winner.name) : null;

  const visible = useMemo(() => {
    const q = nameKey(search);
    return (entries ?? []).filter((e) => !q || e.name_key.includes(q));
  }, [entries, search]);

  if (loadError) {
    return (
      <p className="card p-5 text-sm text-red-400">
        Couldn't load entries: {loadError}. If this says the table doesn't exist, run <code>supabase/giveaway_draws.sql</code> in
        the Supabase SQL editor.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {giveaway.winner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold/50 bg-gold/10 px-5 py-3">
          <p className="text-sm text-text">
            🌟 Showing on the website: <strong className="text-gold">{giveaway.winner.name}</strong>
          </p>
          <SmallButton onClick={() => setPublicWinner(null)} disabled={publishing}>
            Hide from site
          </SmallButton>
        </div>
      )}

      {/* ---- Spin ---- */}
      <section className="card overflow-hidden">
        <div className="relative flex min-h-[200px] flex-col items-center justify-center bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgba(232,181,74,0.14),transparent_70%)] px-6 py-10 text-center">
          {reel.display ? (
            <>
              {!reel.spinning && winner && <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">🎉 Winner</p>}
              <p
                className={`mt-2 break-all text-4xl font-black sm:text-5xl ${reel.spinning ? "text-text-muted" : "text-gold"}`}
                aria-live={reel.spinning ? "off" : "assertive"}
              >
                {reel.display}
              </p>
              {!reel.spinning && winner && (
                <p className="mt-3 text-sm text-text-muted">
                  wins <strong className="text-text">{prizeTitle(giveaway.prize)}</strong> · picked from {winner.poolSize} entr{winner.poolSize === 1 ? "y" : "ies"}
                </p>
              )}
              {!reel.spinning && winner && (
                <p className={`mt-1 text-xs ${winner.saved ? "text-emerald-400" : "text-red-400"}`}>
                  {winner.saved ? "Saved to the draw history." : `Not saved: ${winner.error}`}
                </p>
              )}
              {!reel.spinning && winner?.saved && shownKey !== nameKey(winner.name) && (
                <button
                  className="btn-ghost mt-5 !border-gold/60 !px-6 !py-2.5 !text-gold hover:!border-gold"
                  onClick={() => setPublicWinner({ name: winner.name, drawnAt: winner.drawnAt })}
                  disabled={publishing}
                >
                  {publishing ? "Publishing…" : "✨ Display winner on site"}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-text-muted">Ready to draw</p>
              <p className="mt-2 text-lg font-bold text-text">{prizeTitle(giveaway.prize)}</p>
              <p className="mt-1 text-sm text-text-muted">
                {entries === null ? "Loading entries…" : `${pool.length} name${pool.length === 1 ? "" : "s"} in the draw`}
              </p>
            </>
          )}

          <button className="btn-gold mt-6 !px-10 !py-4 text-base" onClick={spin} disabled={reel.spinning || pool.length === 0}>
            {reel.spinning ? "Spinning…" : winner ? "Spin again" : "Spin"}
          </button>
          {draws.length > 0 && (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#E8B54A]"
                checked={skipPastWinners}
                onChange={(e) => setSkipPastWinners(e.target.checked)}
                disabled={reel.spinning}
              />
              Leave out people who already won this giveaway
            </label>
          )}
        </div>
      </section>

      {/* ---- Entries ---- */}
      <Panel
        title={`Entries · ${entries?.length ?? "…"}`}
        description="Names are saved as you add them, so you can keep adding over days. The same name can't be entered twice (capitals, spaces and a leading @ don't count)."
        actions={<SmallButton onClick={() => setShowBulk((v) => !v)}>{showBulk ? "Close" : "Paste a list"}</SmallButton>}
      >
        <form onSubmit={submitSingle} className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Add a name (Discord username)…"
            value={single}
            maxLength={100}
            onChange={(e) => {
              setSingle(e.target.value);
              const existing = byKey.get(nameKey(e.target.value));
              setNotice(existing ? { kind: "warn", text: `“${existing.name}” is already entered.` } : null);
            }}
          />
          <button type="submit" className="btn-gold shrink-0 !px-5 !py-2.5" disabled={busy || !single.trim() || byKey.has(nameKey(single))}>
            Add
          </button>
        </form>

        {showBulk && (
          <div className="space-y-2">
            <textarea
              className={`${inputClass} resize-y`}
              rows={6}
              placeholder={"One name per line (or separated by commas)\nghosty\neixn\nplayer123"}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
            />
            <button className="btn-gold !px-5 !py-2.5" onClick={submitBulk} disabled={busy || !bulk.trim()}>
              Add {splitNames(bulk).length || ""} names
            </button>
          </div>
        )}

        <NoticeLine notice={notice} />

        {entries && entries.length > 8 && (
          <input className={inputClass} placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)} />
        )}

        {entries && entries.length === 0 && <p className="text-sm text-text-muted">No names yet.</p>}

        {visible.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {visible.map((e) => {
              const won = pastWinnerKeys.has(e.name_key);
              return (
                <li
                  key={e.id}
                  title={`Added ${fmtDateTime(e.created_at)}`}
                  className={`group flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5 text-sm ${
                    won ? "border-gold/60 text-gold" : "border-navy-border text-text"
                  }`}
                >
                  {won && <span aria-label="Past winner">🏆</span>}
                  {e.name}
                  <button
                    onClick={() => removeEntry(e)}
                    aria-label={`Remove ${e.name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition hover:bg-red-500/20 hover:text-red-300"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* ---- History ---- */}
      <Panel title="Draw history" description="Every spin is saved and can't be edited or deleted.">
        {draws.length === 0 ? (
          <p className="text-sm text-text-muted">No draws yet.</p>
        ) : (
          <ol className="divide-y divide-navy-border/60">
            {draws.map((d, i) => (
              <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <p className="font-bold text-text">
                    {i === 0 && <span className="mr-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-gold">Latest</span>}
                    🏆 {d.winner_name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {prizeTitle(d.prize)} · from {d.entries_count} entries · spun by {d.drawn_by && d.drawn_by === userId ? "you" : "the other admin"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <time className="text-xs text-text-muted" dateTime={d.drawn_at}>
                    {fmtDateTime(d.drawn_at)}
                  </time>
                  {shownKey === nameKey(d.winner_name) ? (
                    <span className="text-xs font-bold text-gold">🌟 On site</span>
                  ) : (
                    <SmallButton
                      tone="gold"
                      disabled={publishing}
                      onClick={() => setPublicWinner({ name: d.winner_name, drawnAt: d.drawn_at })}
                    >
                      Display on site
                    </SmallButton>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}

const PICK_GROUPS: { label: string; icon: string; categories: PrizeCategory[] }[] = [
  { label: "Coaching", icon: "🎙️", categories: ["coaching"] },
  { label: "Dota 2 items", icon: "🗡️", categories: ["dota_item"] },
  { label: "Team merch", icon: "👕", categories: ["tshirt", "jacket"] },
  { label: "Other", icon: "🎁", categories: ["other"] },
];

interface GiveawayStats {
  entries: number;
  draws: number;
}

const LAST_PICK_KEY = "6slot:admin:draw-giveaway";

/** Step 1 of the draw: pick which giveaway (coaching, an item…) you're drawing for. */
function GiveawayPicker({
  items,
  selectedId,
  stats,
  onSelect,
}: {
  items: GiveawayItem[];
  selectedId: string | undefined;
  stats: Record<string, GiveawayStats>;
  onSelect: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">1 · Choose the giveaway</h2>
      <div className="mt-3 space-y-4">
        {PICK_GROUPS.map((group) => {
          const inGroup = items.filter((g) => group.categories.includes(g.prize.category));
          if (inGroup.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="mb-2 text-sm font-bold text-text">
                <span aria-hidden>{group.icon}</span> {group.label}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label={group.label}>
                {inGroup.map((g) => {
                  const selected = g.id === selectedId;
                  const s = stats[g.id];
                  return (
                    <button
                      key={g.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onSelect(g.id)}
                      className={`flex items-center gap-3 rounded-card border-2 p-3 text-left transition ${
                        selected ? "border-gold bg-gold/10" : "border-navy-border bg-navy-raised hover:border-text-muted"
                      }`}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-control border border-navy-border bg-navy">
                        {g.prize.imageUrl ? (
                          <img src={g.prize.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <span className="text-2xl" aria-hidden>{group.icon}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-extrabold ${selected ? "text-gold" : "text-text"}`}>
                          {prizeTitle(g.prize) || "Untitled giveaway"}
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {PRIZE_CATEGORY_LABELS[g.prize.category]}
                          {g.prize.value > 0 && ` · $${g.prize.value}`} · goal {g.goal}
                        </p>
                        <p className="mt-1 text-xs">
                          <span className="text-text">{s ? `${s.entries} name${s.entries === 1 ? "" : "s"}` : "…"}</span>
                          {g.winner ? (
                            <span className="text-gold"> · 🌟 {g.winner.name} on site</span>
                          ) : s && s.draws > 0 ? (
                            <span className="text-text-muted"> · drawn {s.draws}×</span>
                          ) : null}
                        </p>
                      </div>
                      {selected && (
                        <span className="text-lg text-gold" aria-hidden>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** "Draw winner" tab of the admin Giveaway page. */
export function GiveawayDraw({ hasUnsavedNew }: { hasUnsavedNew: boolean }) {
  const { items, next } = useContent("giveaway");
  const [selectedId, setSelectedId] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(LAST_PICK_KEY) ?? undefined;
    } catch {
      return undefined;
    }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, GiveawayStats>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Entry and draw counts for every giveaway, for the picker cards.
  const loadStats = useCallback(async () => {
    const [e, d] = await Promise.all([
      supabase.from("giveaway_entries").select("giveaway_id"),
      supabase.from("giveaway_draws").select("giveaway_id"),
    ]);
    if (e.error || d.error) return;
    const next: Record<string, GiveawayStats> = {};
    for (const g of items) next[g.id] = { entries: 0, draws: 0 };
    for (const row of e.data as { giveaway_id: string }[]) if (next[row.giveaway_id]) next[row.giveaway_id].entries++;
    for (const row of d.data as { giveaway_id: string }[]) if (next[row.giveaway_id]) next[row.giveaway_id].draws++;
    setStats(next);
  }, [items]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const selected = items.find((g) => g.id === selectedId) ?? items[0];

  function select(id: string) {
    setSelectedId(id);
    try {
      localStorage.setItem(LAST_PICK_KEY, id);
    } catch {
      // Remembering the last pick is just a convenience.
    }
  }

  return (
    <div className="space-y-6">
      {hasUnsavedNew && (
        <p className="rounded-control border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-orange-200">
          You have unsaved changes in Prizes. New giveaways show up here after you save them.
        </p>
      )}

      <GiveawayPicker items={items} selectedId={selected?.id} stats={stats} onSelect={select} />

      {next.revealed && next.prize.name.trim() && (
        <p className="rounded-control border border-navy-border bg-navy-raised p-3 text-sm text-text-muted">
          <strong className="text-text">Looking for {prizeTitle(next.prize)}?</strong> It's set as the <em>Next giveaway</em>{" "}
          teaser, not a current giveaway, so it can't be drawn yet. In <strong className="text-text">Prizes</strong>, click{" "}
          <strong className="text-gold">“↑ Make it a current giveaway”</strong> on the Next giveaway panel, then save.
        </p>
      )}

      {selected && (
        <section>
          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
            2 · Draw for <span className="text-gold">{prizeTitle(selected.prize) || "Untitled giveaway"}</span>
          </h2>
          <DrawPanel key={selected.id} giveaway={selected} userId={userId} onChanged={loadStats} />
        </section>
      )}
    </div>
  );
}
