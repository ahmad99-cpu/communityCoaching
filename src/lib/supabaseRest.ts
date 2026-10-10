// Tiny fetch-based Supabase client for the public site. It covers the few anonymous calls the
// public pages make (read content, live counts, insert a lead, call an Edge Function), so
// visitors don't download the full supabase-js SDK (~60 KB gzipped: auth, realtime, storage).
// The admin dashboard still uses supabase-js (src/lib/supabase.ts) in its own lazy bundle.

// Trailing slash stripped so paths never become "//rest/v1".
const supabaseUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || "").replace(/\/+$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "test leads will only be kept in the visitor's browser until .env is filled in.",
  );
}

export type RestResult<T> = { data: T | null; error: { message: string; status?: number } | null };

async function request<T>(path: string, init: RequestInit = {}): Promise<RestResult<T>> {
  try {
    const res = await fetch(`${supabaseUrl}${path}`, {
      ...init,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!res.ok) {
      const message =
        (body as { message?: string; error?: string } | null)?.message ??
        (body as { error?: string } | null)?.error ??
        `HTTP ${res.status}`;
      // Keep the parsed body on data too: Edge Functions return { error: code } with non-2xx.
      return { data: body as T, error: { message, status: res.status } };
    }
    return { data: body as T, error: null };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
  }
}

/** `select` from a table (PostgREST). `columns` like "key, value". */
export function selectRows<T>(table: string, columns: string) {
  return request<T[]>(`/rest/v1/${table}?select=${encodeURIComponent(columns.replace(/\s+/g, ""))}`);
}

/** Calls a Postgres function exposed through PostgREST. */
export function rpc<T>(fn: string, args: Record<string, unknown> = {}) {
  return request<T>(`/rest/v1/rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
}

/** Inserts one row without reading it back (anon users usually can't select what they insert). */
export function insertRow(table: string, row: Record<string, unknown>) {
  return request<null>(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}

/** Invokes a Supabase Edge Function with a JSON body. */
export function invokeFunction<T>(name: string, body: unknown) {
  return request<T>(`/functions/v1/${name}`, { method: "POST", body: JSON.stringify(body) });
}
