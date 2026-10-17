import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { site } from "@/config/site";

interface Counts {
  /** Founders who have paid. */
  founders: number;
  /** All paying members, founders included. Drives the Battle Pass. */
  members: number;
}

interface MemberCountsValue extends Counts {
  founderSpotsLeft: number;
  foundersSoldOut: boolean;
  /** True once numbers have loaded from `site.join.countsUrl` (false = the hand-updated config numbers). */
  live: boolean;
  refresh: () => Promise<void>;
}

const { founderCap, foundersTaken, membersTaken, countsUrl } = site.join;
const clampFounders = (n: number) => Math.min(Math.max(0, Math.floor(n)), founderCap);

// The hand-updated numbers in src/config/site.ts. Used until (or whenever) countsUrl can't be read.
const FALLBACK: Counts = {
  founders: clampFounders(foundersTaken),
  members: Math.max(membersTaken, foundersTaken),
};

const MemberCountsContext = createContext<MemberCountsValue | null>(null);

/**
 * Founder and member counts. Today: the numbers in site.join (updated by hand). Later: a URL
 * returning {"foundersTaken": 12} (optionally "membersTaken"), read on load, every minute and
 * when the tab regains focus. If the URL fails, the config numbers stay.
 */
export function MemberCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>(FALLBACK);
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!countsUrl) return;
    try {
      const res = await fetch(countsUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { foundersTaken?: unknown; membersTaken?: unknown };
      const founders = Number(data.foundersTaken);
      if (!Number.isFinite(founders)) throw new Error("no foundersTaken in the response");
      const members = Number(data.membersTaken);
      setCounts({
        founders: clampFounders(founders),
        members: Math.max(Number.isFinite(members) ? members : 0, founders),
      });
      setLive(true);
    } catch (err) {
      console.warn("[counts] could not load counts, using the config numbers:", (err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!countsUrl) return;
    refresh();
    const id = window.setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const value = useMemo<MemberCountsValue>(() => {
    const founderSpotsLeft = Math.max(0, founderCap - counts.founders);
    return { ...counts, founderSpotsLeft, foundersSoldOut: founderSpotsLeft === 0, live, refresh };
  }, [counts, live, refresh]);

  return <MemberCountsContext.Provider value={value}>{children}</MemberCountsContext.Provider>;
}

export function useMemberCounts() {
  const ctx = useContext(MemberCountsContext);
  if (!ctx) throw new Error("useMemberCounts must be used inside <MemberCountsProvider>");
  return ctx;
}
