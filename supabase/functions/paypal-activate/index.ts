// Called from the browser right after PayPal's onApprove, so the counter updates
// immediately instead of waiting for the webhook. Never trusts the browser: it re-reads
// the subscription from PayPal and only counts it if PayPal says it's ACTIVE.
import { cors, json, paypal, syncSubscription, type PayPalSubscription } from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let subscriptionId: string;
  try {
    const body = (await req.json()) as { subscriptionId?: string };
    if (!body.subscriptionId || !/^I-[A-Z0-9]+$/.test(body.subscriptionId)) {
      return json({ error: "invalid_subscription_id" }, 400);
    }
    subscriptionId = body.subscriptionId;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  try {
    const sub = await paypal<PayPalSubscription>(`/v1/billing/subscriptions/${subscriptionId}`);
    const result = await syncSubscription(sub);
    // PayPal can take a few seconds to flip APPROVED → ACTIVE; the webhook finishes the job then.
    return json({ status: sub.status, result });
  } catch (e) {
    return json({ error: "sync_failed", detail: String(e) }, 502);
  }
});
