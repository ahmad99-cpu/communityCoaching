import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { site } from "@/config/site";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface Counts {
  /** Active founder subscriptions. */
  founders: number;
  /** All active subscriptions (founders + members). Drives the giveaway. */
  members: number;
}

interface MemberCountsValue extends Counts {
  founderSpotsLeft: number;
  foundersSoldOut: boolean;
  /** True once real numbers have loaded from Supabase (false = config fallback). */
  live: boolean;
  refresh: () => Promise<void>;
}

// Until Supabase is connected the site shows the fallback number from src/config/site.ts.
const FALLBACK: Counts = {
  founders: Math.min(site.fallbackMemberCount, site.founderSpots),
  members: site.fallbackMemberCount,
};

const MemberCountsContext = createContext<MemberCountsValue | null>(null);

/**
 * Live founder/member counts from Supabase (get_member_counts, see supabase/subscriptions.sql).
 * Each PayPal payment marks a subscription active server-side, so the counter goes up on
 * every claim. Refreshes on load, every minute, and when the tab regains focus.
 */
export function MemberCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>(FALLBACK);
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.rpc("get_member_counts");
    if (error || !data) {
      console.warn("[counts] could not load live member counts:", error?.message);
      return;
    }
    const d = data as { founders: number; members: number };
    setCounts({ founders: d.founders, members: d.members });
    setLive(true);
  }, []);

  useEffect(() => {
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
    const founderSpotsLeft = Math.max(0, site.founderSpots - counts.founders);
    return { ...counts, founderSpotsLeft, foundersSoldOut: founderSpotsLeft === 0, live, refresh };
  }, [counts, live, refresh]);

  return <MemberCountsContext.Provider value={value}>{children}</MemberCountsContext.Provider>;
}

export function useMemberCounts() {
  const ctx = useContext(MemberCountsContext);
  if (!ctx) throw new Error("useMemberCounts must be used inside <MemberCountsProvider>");
  return ctx;
}
