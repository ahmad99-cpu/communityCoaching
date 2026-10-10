# 6SLOT — Get fully built.

Website for **6SLOT**: weekly live Dota 2 group coaching with Eixn, sold as a monthly
subscription. The full brief (brand, copy, tools, payments) is in
[`docs/6SLOT-brief.md`](./docs/6SLOT-brief.md).

## Stack

React + Vite + TypeScript, Tailwind CSS, React Router, Framer Motion. PayPal JS SDK for
subscriptions, Supabase (optional) for storing free-tool leads.

## Pages

| Route | Page |
|---|---|
| `/` | Sales page (no nav links, only Join) |
| `/how-built-are-you` | Wheel test: 12 statements → radar wheel + rolling car |
| `/position-test` | Position test (draft content, see below) |
| `/thank-you` | After payment (PayPal redirects here) |
| `/policies/refund`, `/policies/privacy`, `/policies/giveaway` | Policies |

## Day-to-day updates (Jad)

**The founder counter and giveaway bar update themselves.** Every PayPal payment is recorded
in Supabase and the site reads the live counts (on load, every minute, and on tab focus).
A cancelled, suspended or expired subscription frees its founder spot.

- **Someone paid outside the site** (e.g. a referral deal): Supabase > Table editor >
  `subscriptions` > Insert row with `plan` = founder/member, `status` = active,
  `source` = manual. To remove them later, set `status` = cancelled.

### Admin dashboard (`/admin`)

Sign in at `yoursite/admin` (not linked anywhere on the public site). Pages:

| Page | What you can do |
|---|---|
| Students | Everyone who subscribed, when, last payment and when their month ends. **Orange** = 5 days or less left, **red** = ended. Add students who paid outside the site, mark them paid, end them, add Discord/notes. |
| Giveaway | Current prize (coaching, Dota 2 item, team T-shirt/jacket…), image upload, value, unlock goal; next prize hidden (Aegis) or revealed. |
| Price cards | Names, prices, features, badges, button text, value box, guarantee. ⚠️ The amount charged comes from the PayPal plan, so change it there too. |
| Q&A | Add, edit, reorder, delete questions. |
| How Built Are You? | Rename the 6 slots and their 2 statements each. |
| Position Test | Questions, answers, points per position, and the 5 results. |

Saved changes go live for everyone on their next page load. "Reset to default" restores the
built-in content (`src/content/defaults.ts`).

**Setting up the two admin accounts** (once):

1. Run `supabase/admin.sql` in the Supabase SQL editor (after the other two SQL files).
2. Supabase > Authentication > Users > **Add user** for each of you (email + password).
3. Supabase > Authentication > Sign In / Providers > Email: turn **off** "Allow new users to sign up".
4. In the SQL editor, with your two emails:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email in ('you@example.com', 'brother@example.com');
   ```

Access is enforced by the database (row-level security), not just the page: a signed-in
account that isn't in `admins` can't read students or change anything.

In **`src/config/site.ts`**:

- `links.discordInvite`: members' Discord invite on the thank-you page.
- `firstSessionUtc`: first session date/time.

Policy texts are still in code: `src/pages/Policy.tsx`.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:5174`.

### Payments: PayPal + Supabase

How it works:

1. Clicking the PayPal button calls the `paypal-create-subscription` Edge Function. It holds a
   spot in the database (atomically, so two buyers can never both get the last founder spot),
   then creates the PayPal subscription server-side. Unfinished checkouts release their spot
   after 30 minutes.
2. After payment, the browser calls `paypal-activate`, which re-checks the subscription with
   PayPal and marks it active, so the counter goes up straight away.
3. `paypal-webhook` keeps everything right afterwards (activations, renewals, cancellations,
   suspensions, expiries) and verifies every webhook signature with PayPal.

The $29 Member plan only opens once 20 founders have **paid** (not just started checkout).

Setup (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):

1. In PayPal Business, create two subscription plans: Founder $19/mo and Member $29/mo.
2. In the Supabase SQL editor, run `supabase/leads.sql`, then `supabase/subscriptions.sql`, then `supabase/admin.sql`.
3. Set the Edge Function secrets (all names are listed in `.env.example`) with
   `supabase secrets set NAME=value`.
4. Deploy the three functions. `--no-verify-jwt` is required because PayPal can't send a
   Supabase token:
   ```bash
   supabase functions deploy paypal-create-subscription --no-verify-jwt
   supabase functions deploy paypal-activate --no-verify-jwt
   supabase functions deploy paypal-webhook --no-verify-jwt
   ```
5. In PayPal (Developer > your app > Webhooks), add
   `https://<project>.supabase.co/functions/v1/paypal-webhook` with the events
   BILLING.SUBSCRIPTION.ACTIVATED, RE-ACTIVATED, CANCELLED, SUSPENDED, EXPIRED and
   PAYMENT.SALE.COMPLETED, then set the `PAYPAL_WEBHOOK_ID` secret.
6. Fill in `.env` (Supabase URL + anon key, PayPal client ID).
7. Test with PayPal sandbox accounts first, then switch the secrets and client ID to live.
   Before launch, open checkout in a private window (not logged into PayPal) and confirm the
   "Debit or Credit Card" option shows up.

### Leads (wheel test / position test)

Discord usernames entered before a result are saved to the Supabase `leads` table (step 2
above). Without Supabase the tests still work; leads are only kept in the visitor's browser.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |
