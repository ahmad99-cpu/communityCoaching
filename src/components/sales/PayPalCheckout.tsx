import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isPayPalConfigured, loadPayPal } from "@/lib/paypal";
import { invokeFunction, isSupabaseConfigured } from "@/lib/supabaseRest";
import { useMemberCounts } from "@/lib/memberCounts";
import { track } from "@/lib/analytics";

type Plan = "founder" | "member";

class SpotUnavailableError extends Error {}

/**
 * Asks our server to hold a spot and create the PayPal subscription
 * (supabase/functions/paypal-create-subscription). Founder spots are capped there,
 * atomically, so the 26th founder can't get through even if two people pay at once.
 */
async function createSubscription(plan: Plan): Promise<string> {
  track("Start subscription", { plan });
  const { data, error } = await invokeFunction<{ subscriptionId?: string; error?: string }>(
    "paypal-create-subscription",
    { plan },
  );
  if (data?.subscriptionId) return data.subscriptionId;

  // Non-2xx responses still carry the function's { error: code } body on data.
  const code = data?.error;
  if (code === "founder_sold_out" || code === "member_not_open") throw new SpotUnavailableError(code);
  throw new Error(code ?? error?.message ?? "create_failed");
}

/**
 * PayPal subscription buttons for one plan. PayPal shows both its own button and
 * "Debit or Credit Card", which is why the site says "card or PayPal" (brief §8).
 * After approval, the subscription is verified with PayPal server-side (counter goes up)
 * and the buyer is sent to /thank-you.
 */
export function PayPalCheckout({ plan }: { plan: Plan }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { refresh } = useMemberCounts();
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "sold_out" | "finishing">("loading");

  const ready = isPayPalConfigured && isSupabaseConfigured;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let buttons: { close(): Promise<void> } | null = null;

    loadPayPal()
      .then((paypal) => {
        if (cancelled || !containerRef.current) return;
        const instance = paypal.Buttons({
          style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
          createSubscription: async () => {
            try {
              return await createSubscription(plan);
            } catch (e) {
              if (e instanceof SpotUnavailableError) {
                setStatus("sold_out");
                refresh();
              }
              throw e;
            }
          },
          onApprove: async (data) => {
            setStatus("finishing");
            if (data.subscriptionID) {
              // Best effort: if this fails the PayPal webhook still records the payment.
              await invokeFunction("paypal-activate", { subscriptionId: data.subscriptionID });
            }
            await refresh();
            navigate("/thank-you");
          },
          onError: () => setStatus((s) => (s === "sold_out" ? s : "error")),
        });
        buttons = instance;
        return instance.render(containerRef.current).then(() => !cancelled && setStatus("ready"));
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      buttons?.close().catch(() => {});
    };
  }, [plan, ready, navigate, refresh]);

  if (!ready) {
    return (
      <p className="rounded-control border border-dashed border-navy-border p-4 text-center text-sm text-text-muted">
        Checkout opens soon. Payments aren't connected yet (PayPal + Supabase values in <code>.env</code>).
      </p>
    );
  }

  return (
    <div>
      {status === "loading" && <p className="py-4 text-center text-sm text-text-muted">Loading secure checkout…</p>}
      {status === "finishing" && (
        <p className="py-4 text-center text-sm font-semibold text-text">Payment received. Setting up your spot…</p>
      )}
      {status === "sold_out" && (
        <p className="mb-3 rounded-control border border-navy-border bg-navy p-3 text-center text-sm text-text">
          {plan === "founder"
            ? "The last founder spots are being claimed right now. If someone doesn't finish checkout, the spot opens again within 30 minutes."
            : "The Member plan isn't open yet. Founder spots are still available."}
        </p>
      )}
      {status === "error" && (
        <p className="py-4 text-center text-sm text-red-400">
          Checkout couldn't load. Please refresh the page or message Eixn on Discord.
        </p>
      )}
      {/* PayPal renders into a white-backed iframe; give it a light panel so it doesn't look broken on navy. */}
      <div
        ref={containerRef}
        className={status === "ready" ? "rounded-control bg-white p-3" : status === "finishing" ? "hidden" : ""}
      />
    </div>
  );
}
