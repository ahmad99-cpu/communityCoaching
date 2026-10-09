// Called by the PayPal button's createSubscription. Holds a spot first (atomically, so the
// founder cap can't be exceeded), then creates the PayPal subscription server-side and
// returns its id to the browser, which opens PayPal's approval popup for it.
import { cors, db, json, paypal, planIdFor, type Plan } from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let plan: Plan;
  try {
    const body = (await req.json()) as { plan?: string };
    if (body.plan !== "founder" && body.plan !== "member") return json({ error: "invalid_plan" }, 400);
    plan = body.plan;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const supabase = db();
  const { data: reservationId, error } = await supabase.rpc("reserve_spot", { p_plan: plan });
  if (error) return json({ error: "reserve_failed", detail: error.message }, 500);
  if (!reservationId) {
    return json({ error: plan === "founder" ? "founder_sold_out" : "member_not_open" }, 409);
  }

  try {
    const sub = await paypal<{ id: string }>("/v1/billing/subscriptions", {
      method: "POST",
      body: {
        plan_id: planIdFor(plan),
        // Lets the webhook find our row even before we've stored the PayPal id.
        custom_id: reservationId,
        application_context: {
          brand_name: "6SLOT",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
        },
      },
    });

    await supabase.from("subscriptions").update({ paypal_subscription_id: sub.id }).eq("id", reservationId);
    return json({ subscriptionId: sub.id });
  } catch (e) {
    // Release the held spot so a failed PayPal call doesn't block anyone.
    await supabase.from("subscriptions").delete().eq("id", reservationId);
    return json({ error: "paypal_failed", detail: String(e) }, 502);
  }
});
