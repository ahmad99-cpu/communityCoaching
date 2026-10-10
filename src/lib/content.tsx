import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT } from "@/content/defaults";
import type { ContentKey, SiteContent } from "@/content/types";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

interface ContentValue {
  content: SiteContent;
  /** Re-read everything from Supabase (used after an admin saves). */
  reload: () => Promise<void>;
}

const ContentContext = createContext<ContentValue | null>(null);

/**
 * Merges a saved section over its default, so a section saved before a new field
 * existed still renders (the new field falls back to its default).
 */
export function mergeSection<K extends ContentKey>(key: K, saved: unknown): SiteContent[K] {
  const fallback = DEFAULT_CONTENT[key];
  if (!saved || typeof saved !== "object") return fallback;
  let source = saved as Record<string, unknown>;
  // Giveaways saved before multi-giveaway support had a single { goal, prize }.
  if (key === "giveaway" && !Array.isArray(source.items) && source.prize) {
    const { goal, prize, ...rest } = source;
    source = { ...rest, items: [{ goal, prize }] };
  }
  const merged = { ...fallback, ...source } as SiteContent[K];
  if (key === "giveaway") {
    const g = merged as SiteContent["giveaway"];
    if (g.items.length === 0) return fallback;
    // Giveaways saved before ids existed get a stable id from their position, so their
    // entries stay linked; the id is stored for good on the next save.
    g.items = g.items.map((item, i) => (item.id ? item : { ...item, id: i === 0 ? "founders-1" : `giveaway-${i + 1}` }));
  }
  // The wheel must always have exactly 6 slots with 2 statements each.
  if (key === "wheel_test") {
    const slots = (merged as SiteContent["wheel_test"]).slots;
    if (!Array.isArray(slots) || slots.length !== 6 || slots.some((s) => s.statements?.length !== 2)) return fallback;
  }
  return merged;
}

/**
 * Admin-editable content (giveaway, pricing, FAQ, tests) from Supabase `site_content`,
 * falling back to src/content/defaults.ts. The site renders the defaults immediately
 * and swaps in saved content once it loads.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await selectRows<{ key: ContentKey; value: unknown }>("site_content", "key, value");
    if (error || !data) {
      console.warn("[content] using built-in content:", error?.message);
      return;
    }
    const next = { ...DEFAULT_CONTENT };
    for (const row of data) {
      if (row.key in next) (next as Record<ContentKey, unknown>)[row.key] = mergeSection(row.key, row.value);
    }
    setContent(next);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ content, reload }), [content, reload]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContentContext() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}

export function useContent<K extends ContentKey>(key: K): SiteContent[K] {
  return useContentContext().content[key];
}

export function useContentReload() {
  return useContentContext().reload;
}
