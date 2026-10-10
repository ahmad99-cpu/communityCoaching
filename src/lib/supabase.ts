import { createClient } from "@supabase/supabase-js";

// Used only for storing free-tool leads (see src/lib/leads.ts and supabase/leads.sql).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "test leads will only be kept in the visitor's browser until .env is filled in.",
  );
}

// `||` not `??`: an empty line like `VITE_SUPABASE_URL=` in .env gives "", which would
// otherwise reach createClient and crash the whole site.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
