import { mergeSection } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import type { ContentKey, SiteContent } from "@/content/types";

// Content writers live in the admin bundle so the public site never loads supabase-js.

/** Admin only (enforced by row-level security): saves one section. */
export async function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]) {
  const { error } = await supabase.from("site_content").upsert({ key, value });
  if (error) throw new Error(error.message);
}

/**
 * Admin only: re-reads one section fresh from the database, applies `change`, and saves.
 * Used for small targeted updates (like publishing a giveaway winner) so they never
 * overwrite something the other admin saved in the meantime.
 */
export async function patchContent<K extends ContentKey>(key: K, change: (current: SiteContent[K]) => SiteContent[K]) {
  const { data, error } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  const current = mergeSection(key, data?.value);
  await saveContent(key, change(current));
}

/** Admin only: removes a saved section so the site goes back to the built-in default. */
export async function resetContent(key: ContentKey) {
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) throw new Error(error.message);
}
