import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type LeadSource = "wheel_test" | "position_test";

/**
 * Saves a free-tool lead (Discord username + result) so Jad can follow up
 * (brief §5 step 3, §6). Table schema: supabase/leads.sql.
 *
 * Never blocks the visitor: if Supabase isn't configured or the insert fails,
 * the result is still shown and the lead is kept in localStorage as a backup.
 */
export async function saveLead(source: LeadSource, discord: string, result: unknown) {
  const lead = { source, discord: discord.trim(), result, created_at: new Date().toISOString() };

  try {
    const key = "6slot:leads";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    localStorage.setItem(key, JSON.stringify([...existing, lead].slice(-20)));
  } catch {
    // Storage unavailable (private mode etc.) — fine, Supabase is the real store.
  }

  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from("leads").insert({
    source: lead.source,
    discord: lead.discord,
    result: lead.result,
  });
  if (error) console.warn("[leads] insert failed:", error.message);
}
