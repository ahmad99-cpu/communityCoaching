/** Subscription period logic for the Students page. Pure functions, so they're easy to test. */

export interface StudentRow {
  id: string;
  created_at: string;
  plan: "founder" | "member";
  status: "pending" | "active" | "cancelled" | "suspended" | "expired";
  source: "paypal" | "manual";
  paypal_subscription_id: string | null;
  payer_email: string | null;
  payer_name: string | null;
  discord: string | null;
  note: string | null;
  activated_at: string | null;
  last_payment_at: string | null;
  next_billing_at: string | null;
}

/** Highlight in orange when this many days (or fewer) are left. */
export const ENDING_SOON_DAYS = 5;

const DAY = 24 * 60 * 60 * 1000;

export function addOneMonth(date: Date) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);
  // Jan 31 + 1 month → Feb 28/29, not Mar 3.
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export type PeriodState = "ok" | "ending_soon" | "ended";

export interface Period {
  /** When they first subscribed. */
  subscribedOn: Date;
  /** Start of the current paid month (last payment). */
  paidOn: Date;
  /** When the current month runs out. */
  endsOn: Date;
  daysLeft: number;
  state: PeriodState;
}

/**
 * Each payment covers 1 month. The current month starts at the last payment (or the
 * subscribe date if no payment is recorded yet). For PayPal subscriptions, PayPal's own
 * next billing date is used when we have it, since that's when the renewal happens.
 */
export function periodFor(row: StudentRow, now = new Date()): Period {
  const subscribedOn = new Date(row.activated_at ?? row.created_at);
  const paidOn = new Date(row.last_payment_at ?? row.activated_at ?? row.created_at);

  let endsOn = addOneMonth(paidOn);
  if (row.source === "paypal" && row.status === "active" && row.next_billing_at) {
    endsOn = new Date(row.next_billing_at);
  }

  const daysLeft = Math.ceil((endsOn.getTime() - now.getTime()) / DAY);
  const state: PeriodState = daysLeft <= 0 ? "ended" : daysLeft <= ENDING_SOON_DAYS ? "ending_soon" : "ok";
  return { subscribedOn, paidOn, endsOn, daysLeft, state };
}
