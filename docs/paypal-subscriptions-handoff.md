# Switching 6SLOT to PayPal subscriptions: hand-off

Status on 2026-10-19. Goal: members pay through monthly PayPal **subscriptions** ($19 founder,
$27 member) instead of the one-time Pay Links, with the founder cap, member counter and dashboard
updating automatically.

The code for this was built earlier and has never been switched on:

- `supabase/subscriptions.sql`: the `subscriptions` table, `reserve_spot()` (holds a spot
  atomically, so the founder cap can't be exceeded) and `get_member_counts()`.
- `supabase/functions/`: `paypal-create-subscription`, `paypal-activate`, `paypal-webhook`,
  plus `_shared/paypal.ts`.
- `src/components/sales/PayPalCheckout.tsx` and `src/lib/paypal.ts`: the subscribe buttons.
  **Live on 6slot.gg since 2026-10-19.** The one-time Pay Links and `PayButton` were removed.

## Done (PayPal side, live account)

| What | Value |
|---|---|
| Product | `6SLOT Coaching` (ID `6SLOT-COACHING`). Ignore the old product "6Slot Group Coaching". |
| Founder plan, $19/month, ON | `P-3U064443BM362580MNLLB27I` |
| Member plan, $27/month, ON | `P-6DM02014GE924243GNLLB4UI` |
| REST app | `Default App` (live) |
| Client ID (public) | `BAAB67V9N21MorwodKepgmXmBCP_Ja4AFLQr5UrsmcSqlkfyiRuwJ9vrAACTw5HXGPeBEsfxJL8xvfxtT4` |
| Live webhook ID | `6SF76916U76188639` |
| Webhook URL | `https://fhblahgnhqnenqxwzefh.supabase.co/functions/v1/paypal-webhook` |
| Webhook events | all "Billing subscription" events + "Payment sale completed" |

The Pay Links stay live until the switch: $19 `MCNF7AWJ6KX6N` (inventory 25),
$27 `9G53UTFCUR5RY`.

## To do

Supabase project ref: `fhblahgnhqnenqxwzefh`.

### 1. Log in to the Supabase CLI (a person does this, in a browser)

```bash
npx supabase login
```

### 2. Edge Function secrets

The PayPal **client secret** is set by a person, never pasted into chat or committed. Get it from
developer.paypal.com > Apps & Credentials > Live > Default App > Secret.

```bash
npx supabase secrets set PAYPAL_CLIENT_SECRET=PASTE_SECRET_HERE --project-ref fhblahgnhqnenqxwzefh
```

The rest are not secret:

```bash
npx supabase secrets set --project-ref fhblahgnhqnenqxwzefh PAYPAL_CLIENT_ID=BAAB67V9N21MorwodKepgmXmBCP_Ja4AFLQr5UrsmcSqlkfyiRuwJ9vrAACTw5HXGPeBEsfxJL8xvfxtT4 PAYPAL_FOUNDER_PLAN_ID=P-3U064443BM362580MNLLB27I PAYPAL_MEMBER_PLAN_ID=P-6DM02014GE924243GNLLB4UI PAYPAL_WEBHOOK_ID=6SF76916U76188639 PAYPAL_API_BASE=https://api-m.paypal.com
```

`PAYPAL_API_BASE` matters: without it the functions talk to the PayPal **sandbox**.
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to Edge Functions automatically.

### 3. Database

In the Supabase SQL editor, run `supabase/subscriptions.sql` (after `leads.sql`, if that hasn't
been run), then `supabase/founder_cap_25.sql`. Check the cap in the SQL matches
`founderCap: 25` in `src/config/site.ts`.

### 4. Deploy the functions

```bash
npx supabase functions deploy paypal-create-subscription --project-ref fhblahgnhqnenqxwzefh
npx supabase functions deploy paypal-activate --project-ref fhblahgnhqnenqxwzefh
npx supabase functions deploy paypal-webhook --no-verify-jwt --project-ref fhblahgnhqnenqxwzefh
```

`--no-verify-jwt` on the webhook is required: PayPal doesn't send a Supabase token. The function
checks PayPal's signature itself.

### 5. Switch the site over (code)

- Add `VITE_PAYPAL_CLIENT_ID` (the Client ID above) to `.env` and to the host's environment
  variables (Render: the Blueprint already asks for it).
- On the sales page, replace the Pay Link buttons (`PayButton`) with
  `<PayPalCheckout plan="founder" />`, or `"member"` once founders are sold out.
- Make the member counter read `get_member_counts()` from Supabase instead of the hand-edited
  `foundersTaken` / `membersTaken` in `src/config/site.ts` (see `src/lib/memberCounts.tsx`;
  today it only reads `countsUrl`).
- Small fix: a comment in `PayPalCheckout.tsx` still says "21st founder"; the cap is 25.
- Keep the sales funnel working in Umami (`src/lib/analytics.ts`): when someone starts a
  subscription, call `track("Open PayPal", { plan })` (in `createSubscription`), the same event the
  Pay Link button sends today.

### 6. Test with real money

Subscribe once at $19 from a second PayPal account. Check that:
- the buyer lands on `/thank-you`,
- a row appears in `subscriptions` with status `active`,
- the founder counter on the site goes up by 1,
- PayPal > Developer > Event Logs shows the webhook delivered with a 200.

Then cancel the subscription in PayPal and refund the payment. Check the row turns `cancelled`
and the counter goes back down.

### 7. After the switch

Disable or delete the two Pay Links in PayPal, so nobody buys the old one-time way.

## Rules for this project

- Never use the word "homework" in any 6SLOT text (site, PayPal, Discord).
- No emojis on the site.
- The site must work on 6slot.gg before PayPal redirects anyone there.

## Follow-up: stop duplicate subscriptions (server side)

Members sometimes come back and subscribe a second time by mistake. The site now hides the
checkout on the device they paid from (`src/lib/membership.ts`) and tells everyone "already a
member? no need to pay again", but a member on a new device can still pay twice. Safety net, in
the Edge Functions (`paypal-activate` and `paypal-webhook`, shared code in `_shared/paypal.ts`):

1. When a subscription becomes ACTIVE, look up other `subscriptions` rows with the same
   `payer_email` and status `active`.
2. If one exists, this new one is a duplicate:
   - cancel it at PayPal right away (`POST /v1/billing/subscriptions/{id}/cancel` with a
     reason like "Duplicate: already a member"), so it never charges again;
   - mark the row (e.g. `note = 'duplicate of <older id>'`, status `cancelled`) so it doesn't
     count towards the founder cap or the member counter;
   - Jad refunds the first payment of the duplicate in PayPal (or automate it later with
     the sale refund API: subscription payments are "sales", `POST /v1/payments/sale/{sale_id}/refund`,
     with the sale id from the PAYMENT.SALE.COMPLETED event).
3. Show duplicates in the dashboard's Students page so nothing is missed.

Then redeploy the two functions (`npx supabase functions deploy paypal-activate` and
`paypal-webhook --no-verify-jwt`, project `fhblahgnhqnenqxwzefh`).
