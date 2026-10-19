// PayPal webhook: the long-term source of truth. Activations add to the counter,
// cancellations/suspensions/expiries free the spot, renewals record the last payment.
//
// Subscribe the webhook (PayPal Developer > Apps > your app > Webhooks) to:
//   BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.RE-ACTIVATED,
//   BILLING.SUBSCRIPTION.CANCELLED, BILLING.SUBSCRIPTION.SUSPENDED,
//   BILLING.SUBSCRIPTION.EXPIRED, PAYMENT.SALE.COMPLETED
import { json, paypal, syncSubscription, type PayPalSubscription } from "../_shared/paypal.ts";

interface WebhookEvent {
  event_type: string;
  resource: { id?: string; billing_agreement_id?: string };
}

/** Asks PayPal to confirm this request really came from PayPal for our webhook. */
async function verify(req: Request, event: unknown) {
  const h = (name: string) => req.headers.get(name) ?? "";
  const result = await paypal<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: h("paypal-auth-algo"),
      cert_url: h("paypal-cert-url"),
      transmission_id: h("paypal-transmission-id"),
      transmission_sig: h("paypal-transmission-sig"),
      transmission_time: h("paypal-transmission-time"),
      webhook_id: Deno.env.get("PAYPAL_WEBHOOK_ID"),
      webhook_event: event,
    },
  });
  return result.verification_status === "SUCCESS";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Real PayPal deliveries always carry these; anything without them isn't from PayPal.
  const signed = ["paypal-transmission-id", "paypal-transmission-sig", "paypal-cert-url"].every((h) => req.headers.get(h));
  if (!signed) return json({ error: "missing_signature_headers" }, 400);

  let event: WebhookEvent;
  try {
    event = (await req.json()) as WebhookEvent;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  // If PayPal itself can't be reached, verify() throws and the 500 makes PayPal retry later.
  if (!(await verify(req, event))) return json({ error: "invalid_signature" }, 401);

  // Subscription events carry the subscription as the resource; sale events point to it.
  const subscriptionId = event.event_type.startsWith("BILLING.SUBSCRIPTION.")
    ? event.resource.id
    : event.event_type === "PAYMENT.SALE.COMPLETED"
      ? event.resource.billing_agreement_id
      : undefined;

  if (!subscriptionId) return json({ ignored: event.event_type });

  try {
    // Always re-fetch: the event payload may be stale or arrive out of order.
    const sub = await paypal<PayPalSubscription>(`/v1/billing/subscriptions/${subscriptionId}`);
    return json(await syncSubscription(sub));
  } catch (e) {
    // Non-2xx makes PayPal retry the delivery later.
    return json({ error: "sync_failed", detail: String(e) }, 500);
  }
});
