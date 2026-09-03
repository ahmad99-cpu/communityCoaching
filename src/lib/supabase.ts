import { createClient } from "@supabase/supabase-js";

// Per SPEC.md §11: a dedicated Supabase project for this platform, separate from
// eixnSystem/Coach OS. Create the project, run the (not-yet-written) schema, and
// fill in .env before this client will actually work.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Expected during early scaffolding — no Supabase project exists yet.
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "copy .env.example to .env once the Supabase project exists.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
);
