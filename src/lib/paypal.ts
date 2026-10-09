import { site } from "@/config/site";

/** Minimal typing for the slice of the PayPal JS SDK we use (subscription buttons). */
interface PayPalButtons {
  render(container: HTMLElement): Promise<void>;
  close(): Promise<void>;
  isEligible(): boolean;
}

interface PayPalNamespace {
  Buttons(options: {
    style?: Record<string, string | number | boolean>;
    createSubscription: (
      data: unknown,
      actions: { subscription: { create(o: { plan_id: string }): Promise<string> } },
    ) => Promise<string>;
    onApprove: (data: { subscriptionID?: string | null }) => void;
    onError?: (err: unknown) => void;
  }): PayPalButtons;
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

export const isPayPalConfigured = Boolean(site.paypal.clientId);

let sdkPromise: Promise<PayPalNamespace> | null = null;

/**
 * Loads the PayPal SDK once, in subscription mode. `vault=true&intent=subscription`
 * is what makes the card option ("Debit or Credit Card") appear for subscriptions.
 */
export function loadPayPal(): Promise<PayPalNamespace> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      "client-id": site.paypal.clientId,
      vault: "true",
      intent: "subscription",
      currency: "USD",
    });
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?${params}`;
    script.async = true;
    script.onload = () =>
      window.paypal ? resolve(window.paypal) : reject(new Error("PayPal SDK missing"));
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load PayPal"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}
