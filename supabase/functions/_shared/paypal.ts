// Shared helpers for the 6SLOT PayPal Edge Functions (Deno runtime).
import { createClient } from "npm:@supabase/supabase-js@2";

export type Plan = "founder" | "member";

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret ${name}`);
  return value;
}

/** https://api-m.sandbox.paypal.com while testing, https://api-m.paypal.com for launch. */
const PAYPAL_API = () => Deno.env.get("PAYPAL_API_BASE") ?? "https://api-m.sandbox.paypal.com";

export function planIdFor(plan: Plan) {
  return plan === "founder" ? env("PAYPAL_FOUNDER_PLAN_ID") : env("PAYPAL_MEMBER_PLAN_ID");
}

export function planFromPlanId(planId: string): Plan | null {
  if (planId === env("PAYPAL_FOUNDER_PLAN_ID")) return "founder";
  if (planId === env("PAYPAL_MEMBER_PLAN_ID")) return "member";
  return null;
}

/** Service-role client: bypasses RLS. Never exposed to the browser. */
export const db = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

async function accessToken() {
  const res = await fetch(`${PAYPAL_API()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env("PAYPAL_CLIENT_ID")}:${env("PAYPAL_CLIENT_SECRET")}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function paypal<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${PAYPAL_API()}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new Error(`PayPal ${path} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export interface PayPalSubscription {
  id: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  plan_id: string;
  custom_id?: string;
  subscriber?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  billing_info?: { last_payment?: { time?: string }; next_billing_time?: string };
}

/** Maps a PayPal subscription status to our row status (null = leave as is). */
export function rowStatus(status: PayPalSubscription["status"]) {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "SUSPENDED":
      return "suspended";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return null;
  }
}

/**
 * Writes the latest PayPal state of a subscription into our table. Looks the row up by
 * PayPal id, falling back to custom_id (our reservation id). If neither exists (e.g. a
 * reservation expired but the buyer still paid), inserts a row so the payment always counts.
 */
export async function syncSubscription(sub: PayPalSubscription) {
  const supabase = db();
  const status = rowStatus(sub.status);
  const plan = planFromPlanId(sub.plan_id);
  if (!plan) return { ignored: "unknown plan" };

  const fields: Record<string, unknown> = { paypal_subscription_id: sub.id };
  if (status) fields.status = status;
  if (sub.subscriber?.email_address) fields.payer_email = sub.subscriber.email_address;
  if (sub.billing_info?.last_payment?.time) fields.last_payment_at = sub.billing_info.last_payment.time;
  if (sub.billing_info?.next_billing_time) fields.next_billing_at = sub.billing_info.next_billing_time;
  const name = [sub.subscriber?.name?.given_name, sub.subscriber?.name?.surname].filter(Boolean).join(" ");
  if (name) fields.payer_name = name;

  const byPaypal = await supabase.from("subscriptions").select("id").eq("paypal_subscription_id", sub.id).maybeSingle();
  let rowId = byPaypal.data?.id as string | undefined;

  if (!rowId && sub.custom_id) {
    const byCustom = await supabase.from("subscriptions").select("id").eq("id", sub.custom_id).maybeSingle();
    rowId = byCustom.data?.id as string | undefined;
  }

  if (rowId) {
    const { error } = await supabase.from("subscriptions").update(fields).eq("id", rowId);
    if (error) throw error;
    return { updated: rowId, status };
  }

  if (!status) return { ignored: "no row and not active yet" };
  const { error } = await supabase.from("subscriptions").insert({ ...fields, plan, source: "paypal" });
  if (error) throw error;
  return { inserted: sub.id, status };
}

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
