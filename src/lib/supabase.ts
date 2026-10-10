import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabaseRest";

// Full supabase-js client: admin dashboard only (auth, storage, writes). The public site uses the
// lightweight src/lib/supabaseRest.ts so visitors never download this SDK.
export { isSupabaseConfigured };

// `||` not `??`: an empty line like `VITE_SUPABASE_URL=` in .env gives "", which would
// otherwise reach createClient and crash the whole site.
export const supabase = createClient(
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://placeholder.supabase.co",
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "placeholder-anon-key",
);
