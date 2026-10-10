import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type AdminState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "not_admin"; email: string }
  | { status: "admin"; session: Session };

/**
 * Current admin session. Being signed in isn't enough: the account must also be in
 * the `admins` table (checked with is_admin(), the same rule the database enforces).
 */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ status: "signed_out" });
      return;
    }
    let cancelled = false;

    async function check(session: Session | null) {
      if (!session) return !cancelled && setState({ status: "signed_out" });
      const { data, error } = await supabase.rpc("is_admin");
      if (cancelled) return;
      if (error || data !== true) setState({ status: "not_admin", email: session.user.email ?? "" });
      else setState({ status: "admin", session });
    }

    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase inside this callback can deadlock the auth client.
      setTimeout(() => check(session), 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  await supabase.auth.signOut();
}
