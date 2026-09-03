# [Brand Name TBD] — Arab Dota 2 Community Platform

Content & product spec. Modeled on [dotaflix.com.br](https://www.dotaflix.com.br/) (Brazilian
Dota 2 coaching platform), rebuilt as a **new, standalone brand** for the Arab/MENA Dota 2
community — bilingual **Arabic + English** from day one, not a single-language site with a
translated layer bolted on. Brand new visual design, not a reskin of Dotaflix.

**Eixn is part of this** — Eixn (Jad) is one coach on the platform's roster, not excluded from
it. But the platform is bigger than any single coach: it's built around a **roster**, and the
headline draw is **group coaching hosted by recognizable Dota 2 pro players** — named so far:
**GH**, **Omar**, **Ammar**. That roster model, more than bilingual support alone, is what
actually separates this from Dotaflix (which is built around one coach's personal methodology).
See §3 (Coaches / Roster) and §4.6.

Last updated: 2026-09-03.

---

## 1. What Dotaflix actually is (the reference model)

Worth being precise about, since we're borrowing the *model*, not the brand:

Dotaflix is a coaching-content subscription platform built around **one coach's** methodology
("Astini"). It's not a news site or a forum — it's closer to **Netflix for Dota 2 lessons**,
with a coaching-marketplace and community layer bolted on.

Core pieces:
- **Lesson library** (500+ videos) organized by hero / position / rank
- **Live group coaching sessions**, recorded and archived after
- **Replay analysis** — pro matches broken down, plus community-submitted ranked replays
- **Written guides** — macro theory, hero guides, patch-meta articles
- **Tiered subscriptions**: free sample tier → mid tier → pro tier (more live analysis,
  higher giveaway odds)
- **Community layer**: Discord/WhatsApp groups, profiles, live chat during broadcasts
- **Giveaways** (in-game cosmetics) as a subscriber perk
- **Live tournament viewer** with scores/drafts, news aggregator
- **Coaching marketplace** — pay-per-session 1:1 analysis, separate from the subscription
- **Gamified sponsor system** ("advertiser territory map") — a novelty ad-sales mechanic
- **Social proof bar**: student count, lesson count, hours of content, matches analyzed

Pricing reference: free tier (9 sample lessons) → ~R$40/mo mid tier → ~R$120/mo pro tier.

**Key structural difference for us**: Dotaflix's whole brand is one coach's face and
methodology. Ours is a multi-coach roster — closer to "a stable of pros" than "one
personality's course." That changes the trust story (credibility from real competitive
résumés, not one person's track record), the content model (each coach's own sessions/style),
and the business model (revenue share across multiple paid talent, not one owner-operator).

---

## 2. What we keep (the parts of this model that just work)

| Feature | Why it stays |
|---|---|
| Lesson library by hero/position/rank | Core value prop — this is what people are paying for |
| Live group coaching, archived after | High perceived value, low marginal cost per viewer |
| Replay analysis (pro + community) | Makes content feel current and personal, not generic |
| Patch-reactive meta content | Dota's meta shifts every patch; stale content kills trust |
| Free sample tier | Lets people evaluate before paying — critical for cold traffic |
| Tiered subscriptions | Predictable recurring revenue, clear upgrade path |
| Community chat layer | Retention driver — people stay subscribed for the group, not just content |
| Giveaways as a subscriber perk | Cheap, effective engagement/retention lever |
| 1:1 coaching marketplace | Separate revenue stream, doesn't cannibalize subscriptions |
| Social proof stats bar | Builds trust fast for new visitors |
| Live tournament/news aggregation | Keeps people returning between lesson-watching sessions |

---

## 3. Coaches / Roster (the core differentiator)

Unlike Dotaflix's single-coach model, this platform is built around **multiple named coaches**,
each running their own group coaching sessions under the platform umbrella.

### 3.1 Roster (as specified so far)

| Coach | Role | Status |
|---|---|---|
| **Eixn (Jad)** | Coach | Existing coach/brand, joining this platform as one member of the roster — separate from any of his existing private business tooling, which is out of scope here |
| **GH** | Pro player, group coaching | Likely **Ghaddar "GH" Eid** — Lebanese support player, Team Liquid, TI7 (2017) champion. **Verify this is the intended GH and confirm current involvement/rights before publishing** — a name this recognizable is a major credibility asset if confirmed, and a liability if wrong or unauthorized. |
| **Omar** | Pro player, group coaching | Identity/bio not yet confirmed on my end — need full name, role/position, team history, and confirmed agreement to be listed, before this goes in any public copy. |
| **Ammar** | Pro player, group coaching | Same as above — need confirmed identity, bio, and agreement before publishing. |

**Do not publish player names/likenesses without their explicit agreement and a clear
arrangement (§4.6).** Using a known pro's name to market a paid product without a deal in
place is both a legal and reputational risk — this is the single highest-priority item to
lock down before any marketing copy goes out.

### 3.2 Why this matters more than it looks like
- **Credibility engine**: Dotaflix has to build trust around one coach's claimed results.
  Real, checkable pro competitive history (tournament results, team history) does that
  instantly and is much harder to challenge.
- **Content variety**: different playstyles/roles/personalities across the roster means the
  library isn't "one person's opinion" — a support main, a mid player, etc. can each own their
  lane instead of one generalist trying to cover everything.
- **Marketing surface**: each coach brings their own existing fanbase/audience (stream
  followers, social following) — this is organic distribution Dotaflix's single-coach model
  doesn't get for free.
- **Scheduling capacity**: live group coaching scales better with more hosts — one coach can
  only run so many live sessions a week before burning out or capping subscriber growth.

---

## 4. What we add or change for the Arab community

### 4.1 True bilingual parity (headline UX difference)
- Every page exists in **Arabic (RTL) and English (LTR)**, fully, not just marketing copy —
  video subtitles/dubbing, guides, UI, payment flow, support, all of it.
- Language is a **toggle, not a redirect to a different subdomain** — a user should be able
  to flip a lesson from Arabic to English mid-video without losing their place.
- RTL is a first-class layout mode, not a CSS mirror applied late. Icons, charts, video
  scrubbers, and stat bars all need RTL-aware variants.
- **Open decision**: Modern Standard Arabic (MSA) for written lessons/guides (broad reach,
  professional tone) vs. a lighter dialect flavor for community/social content (Gulf tends
  to read as "neutral" across MENA, but worth deciding deliberately rather than defaulting).

### 4.2 Regional scene coverage — "Scene" page (Dotaflix has no equivalent)

MENA has real Dota 2 org presence — worth building into its own dedicated page, not a passing
mention, since it gives people a reason to return between lesson-watching sessions the same
way Dotaflix's tournament-news aggregator does, just pointed at teams this audience actually
follows.

- **Named orgs to cover**: e.g. **Team Falcons** and **Twisted Minds** (Saudi), **Nigma
  Galaxy** (UAE). *(Verify current rosters/active game titles before publishing — esports
  orgs reshuffle often, and this is separate from whether any roster coach (§3) is affiliated
  with one of these orgs — check for conflicts/overlaps before publishing anything about them.)*
- **Team profile pages** — roster, recent results, brief history, socials.
- **Match results & standings tracker** for the events these teams play in, not just a news
  blurb when something big happens.
- **News feed** — signings, roster changes, tournament announcements — the actual
  return-visit driver.
- Dedicated coverage of the **regional server** (many Arab players are on Dubai/SEA servers)
  — ping, matchmaking pool quality, regional MMR distribution content Dotaflix doesn't need
  because Brazil has its own stable server.
- Local LAN/community tournament coverage, not just international bracket news.

**Content-ops note**: unlike most of this spec, this is a recurring editorial commitment, not
a one-time build — rosters and org affiliations shift often enough that stale team info
actively hurts credibility. Needs someone assigned to keep it current (see §10), or it should
stay a lighter news feed rather than a maintained roster database.

### 4.3 Community platform choice
- **Telegram alongside or instead of Discord/WhatsApp** — Telegram has much higher
  penetration than WhatsApp-for-communities across the Arab world; large public/broadcast
  channels are a better fit than Discord for a content-drop audience.

### 4.4 Scheduling awareness
- Live session scheduling should account for **Ramadan** (shifted sleep/activity schedules)
  and regional weekend (Fri–Sat in the Gulf vs Sat–Sun elsewhere) — a Sao-Paulo-timezone
  assumption baked into Dotaflix doesn't translate.
- With multiple coaches now running sessions (§3), scheduling also needs to avoid **collisions
  between coaches' live sessions** competing for the same subscriber base's attention.

### 4.5 Multi-country nuance
- MENA isn't one market — Gulf, Levant, and North Africa differ in income levels, payment
  access, and preferred community platforms. The pricing and payment section below reflects
  this; content localization (dialect, examples, streamer shoutouts) should too, eventually.

### 4.6 Coach compensation model (new — required because of the roster model)
Dotaflix doesn't need this because it's one owner-operator. We do, because GH/Omar/Ammar
(once confirmed) are presumably being paid or revenue-shared for hosting sessions under the
platform, separate from Eixn's existing arrangement. Needs a decision before build:
- **Revenue share per coach** (e.g. subscriber revenue split by which coach's sessions a
  member actually attends) vs. **flat appearance fee per session** vs. **hybrid**.
- Whether subscriptions are **platform-wide** (one price, access to all coaches) or
  **per-coach passes** (pay for a specific coach's sessions) — affects both pricing (§6) and
  the site's information architecture (§7).
- Exclusivity: are GH/Omar/Ammar coaching *only* here, or is this one of several places they
  coach? Affects marketing claims.

---

## 5. Signature features (what makes this special, beyond Dotaflix)

Dotaflix's feature set (§1–§2) is the *baseline*. These are additions that don't exist on
Dotaflix and would give this platform its own identity, not just a translated version of
someone else's product. Grouped by what they actually accomplish, roughly in priority order.

### 5.1 The two highest-leverage additions
- **Arabic-language co-casting of majors/TI.** There is essentially no dedicated
  Arabic-language commentary for top-tier Dota right now — a real content gap. Roster pros
  (§3) co-casting international majors in Arabic would be a genuine acquisition spike during
  the exact weeks the whole Dota audience is already paying attention, funneling straight into
  subscriptions. Bigger production lift than most items on this list, but the highest ceiling.
- **"[Brand] Wrapped"** — an annual/seasonal personalized stats recap (Spotify-Wrapped style),
  pulling from OpenDota/Stratz APIs, delivered in Arabic, built to be shared on social. Free,
  highly shareable, effectively does marketing for you — every member who posts theirs is a
  free ad with the brand name on it.

### 5.2 Learning tools beyond a static video library
- **Auto-imported match history** (OpenDota/Stratz) so a member's profile fills itself in —
  removes the friction of manually uploading replays for analysis.
- **"Weakness detector"** — flags specific recurring mistakes from a member's recent matches
  (e.g. low last-hits by 10 minutes, poor ward coverage) and points to the exact lesson that
  addresses it, instead of a generic library browse. Makes the free lesson library feel
  personalized even before anyone pays for 1:1 time.
- **Draft/counter-pick tool** with real Arabic explanations of *why* a counter works, not just
  a raw win-rate stat table — ties the tool back into the lesson content instead of being a
  disconnected utility.

### 5.3 Community/competitive layer (somewhere to apply what's learned)
- **In-house scrims/league**, subscriber-only, optionally refereed or cast by roster coaches —
  gives paying members a venue to apply lessons, not just watch more of them. This is also a
  strong retention lever: people stay subscribed to keep their league spot.
- **Squad/party finder** matched by rank + region + language — safer and more relevant than
  public LFG, and only viable because there's a trusted membership base to match within.
- **Verified-member leaderboard** (weekly MMR gain, most improved) — social proof generated by
  your own community, not a marketing claim about it.

### 5.4 Trust/credibility features
- **Per-coach public track record** (average MMR gain per coach, verified) rather than one
  aggregate platform stat — reinforces the roster model (§3) instead of hiding it behind a
  single number, and lets each coach build their own reputation on the platform.

### 5.5 Business-model extensions (once there's traction)
- **Merch** (jerseys/sleeves) — makes more sense here than it would for Dotaflix, because the
  platform is presenting a roster of pros, not one coach's personal course.
- **Regional sponsorships** (peripherals, energy drinks, gaming cafés) — viable specifically
  *because* real pro names on the roster carry sponsor value that a single-coach brand
  wouldn't attract on its own.
- **Referral program** — free month for successful invites; cheap to build, standard for a
  reason.

**Sequencing note**: this list is intentionally broader than what should be built at launch —
see §9 (Roadmap) for what's MVP vs. later. Building all of §5 before launch would delay the
platform for features that only prove their value once there's a real subscriber base to
serve.

---

## 6. Payments

Per your direction: paid access is centered on **joining giveaways, watching live group
coaching (now: coaching hosted by named pros, per §3), and similar gated perks** — i.e.
subscription-gated *access*, not just a paywall on static lesson videos.

### 6.1 What paid tiers unlock
Draft tiers (mirrors Dotaflix's free → mid → pro shape, adjust pricing once brand/market and
the coach compensation model in §4.6 are set):

| Tier | Unlocks |
|---|---|
| **Free** | Sample lessons, articles/guides, news, read-only community access |
| **Member** | Full lesson library, monthly live group coaching (any roster coach), giveaway entries, community chat access |
| **Pro** | Everything in Member + priority/more live session slots, higher giveaway odds, discounted 1:1 coaching, access to in-house league/scrims (§5.3) |
| **1:1 coaching** | Pay-per-session marketplace with a specific coach — separate purchase, not tied to a subscription tier |

**Open question flowing from §4.6**: should there also be a **per-coach add-on pass** (e.g.
member pays extra to guarantee a seat in *GH's* sessions specifically, if demand for one
coach outstrips capacity)? Worth deciding once real demand signal exists post-launch rather
than pre-building it.

### 6.2 Payment methods (pan-Arab / MENA coverage)
Since this is a standalone brand meant for the wider Arab community, not one country:

| Method | Coverage | Notes |
|---|---|---|
| **Cards (Visa/Mastercard)** via Stripe or Tap Payments | Everywhere | Baseline, always offer this |
| **Tap Payments** (aggregator: Mada, KNET, QPay, Benefit) | Gulf-wide (SA, KW, QA, BH, UAE) | Best single integration for Gulf local rails |
| **STC Pay** | Saudi Arabia | Very high penetration, worth a direct integration if SA is a priority market |
| **Fawry / Vodafone Cash** | Egypt | Egypt has a huge Dota/gaming population but lower card penetration — cash-voucher and mobile-wallet rails matter more here than elsewhere |
| **PayPal** | Diaspora / international | Covers Arab players living abroad, and gives a familiar fallback |
| **Crypto (USDT) — optional, evaluate later** | Anywhere | Consider only if bank/card access is a real blocker for part of the audience (e.g. certain sanctioned regions); adds compliance overhead, don't default to this |

### 6.3 Currency display
Price the subscription in **USD as the base unit** (consistent, easy to reason about
internally), then display converted local-currency estimates (SAR / AED / EGP / QAR / KWD)
at checkout.

---

## 7. Site structure (nav)

Adapted from Dotaflix's nav (Jogar / Partidas / Aprender / Comunidade / Team) with bilingual
routing, plus new pages for the roster model and signature features (§5):

- **Home** — hero section, stats bar, latest content, roster highlight
- **Coaches** — roster page: Eixn, GH, Omar, Ammar (and future additions), each with a bio,
  résumé/results, session schedule, verified track record (§5.4), and content library filtered
  to that coach
- **Learn** — lesson library (filter by hero / position / rank / coach / language), draft tool,
  weakness detector (§5.2)
- **Matches** — live tournament viewer, Arabic co-casting during majors (§5.1), community
  replay feed, submit-a-replay
- **Scene** — MENA team profiles, rosters, match results/standings, regional news feed (§4.2)
- **League** — in-house scrims/league, squad finder, verified-member leaderboard (§5.3) — Pro
  tier
- **Community** — Telegram/Discord links, live chat, profiles, giveaways
- **Coaching** — 1:1 marketplace, live group session schedule across all coaches
- **Pricing** — tier comparison, payment methods
- **[Brand] Wrapped** — seasonal personalized recap (§5.1), publicly shareable page per member

Routing: `/ar/...` and `/en/...` with a persistent language toggle, not IP-based redirect
(lets diaspora Arabic-speakers and Arabic-learning English speakers both choose freely).

---

## 8. Design direction (brand new, not a Dotaflix reskin)

Dotaflix leans on hero art + ranked-medal iconography + testimonial galleries — fine for its
audience, but "brand new design" means picking our own visual identity rather than following
that template. Considerations specific to this project:

- **Dark theme by default** — matches Dota's own visual language and how the audience
  actually plays/watches (streaming, late-night sessions).
- **Coach-forward design**: since real named pros are the credibility engine (§3.2), their
  photos/likenesses (once rights are confirmed, §3.1) should be central to the homepage and
  marketing — closer to how esports orgs present a roster page than how Dotaflix presents one
  coach's personal brand.
- **Typography**: needs a paired Arabic/Latin font family that both look intentional, not
  like Arabic was bolted onto a Latin design. Candidates to evaluate: **IBM Plex Sans
  Arabic** or **Cairo** paired with **Inter** or **Poppins** for Latin text — test actual
  Arabic readability at body-text size before committing, not just headline size.
- **Color**: Dota's own Radiant (green) vs Dire (red) split is an obvious, recognizable
  motif to riff on for an accent palette — worth exploring rather than an unrelated brand
  color.
- **RTL-native components**: stat bars, video scrubbers, tier-comparison tables, and nav all
  need to mirror correctly, not just text-align differently.
- **"Wrapped" page needs to be built shareable-first** (§5.1) — designed for a screenshot/story
  crop from the start, not a desktop-only stats page that happens to also work on mobile.
- **A public, energetic esports/community identity** — bold, dark, game-driven visuals; this
  is a consumer product competing for attention, not a quiet internal tool, so the design
  should lean toward that energy rather than minimalism for its own sake.

---

## 9. Roadmap (what's launch vs. later)

The full feature set across §2–§5 is more than a v1 needs. Rough phasing to avoid delaying
launch chasing every idea:

| Phase | Scope |
|---|---|
| **Phase 1 — MVP** | Bilingual site (§4.1), lesson library, live group coaching, roster/coach pages (§3), Free/Member/Pro tiers, core payment rails (cards + Tap Payments + PayPal), Telegram community, giveaways |
| **Phase 2 — Retention layer** | In-house league/scrims, squad finder, verified-member leaderboard (§5.3), per-coach track records (§5.4), weakness detector + match-history auto-import (§5.2), regional "Scene" page as a light news feed (§4.2) |
| **Phase 3 — Signature moments** | Arabic co-casting for majors/TI (§5.1), "[Brand] Wrapped" (§5.1), merch, regional sponsorships (§5.5) |

Phase 3 items are the biggest differentiators but also the most production-heavy (co-casting
needs a broadcast setup and rights/coordination; Wrapped needs a full season of usage data to
be worth building) — sequencing them after Phase 1/2 is about capability, not priority.

---

## 10. Open decisions (need your input before this becomes a build spec)

- **Confirm roster identities and rights** (§3.1) — highest priority, blocks any public
  marketing copy. Need full names, bios, competitive history, and explicit agreement from
  GH, Omar, and Ammar to be featured.
- **Coach compensation model** (§4.6) — revenue share, flat fee, or hybrid; platform-wide vs.
  per-coach passes; exclusivity terms.
- **Brand name.** Needs to work in both Arabic and English, and ideally in Latin script for
  URLs/socials. Dota-lore-adjacent options worth considering: something built around an
  iconic term (Aegis, Roshan, Rapier, Ancient) — but do a trademark/availability check before
  committing to any candidate.
- **MSA vs. dialect** for written/community content (§4.1).
- **Priority launch market** — Gulf first, Egypt first, or simultaneous pan-Arab launch?
  Affects which payment rails to build first (§6.2).
- **Price points** — needs local purchasing-power research per country before locking tiers.
- **Free tier depth** — how many free lessons, matching or beating Dotaflix's 9.
- **Co-casting feasibility** (§5.1) — does the roster include anyone with casting/broadcast
  experience, or would this need hiring a dedicated Arabic caster/analyst?
- **Which Phase 2/3 items (§9) actually matter to you** — the list in §5 is a menu, not a
  commitment; worth trimming before it becomes a backlog.
- **Who owns "Scene" page upkeep** (§4.2) — the only recurring editorial commitment in this
  spec (rosters/results go stale fast); needs an owner or it should launch as a light news
  feed rather than a maintained team database.

---

## 11. Tech notes

This is a **standalone project**: its own repo, its own database, its own hosting/accounts —
not sharing infrastructure with anything else. Considerations below are scoped only to what
this platform itself needs.

### 11.1 Database recommendation: Supabase
**Supabase** (managed Postgres + Auth + Storage + Realtime) is a solid fit here, on its own
merits:
- **Row-Level Security maps naturally onto tiered access** — Free / Member / Pro / coach /
  admin roles are a normal RLS pattern (policy checks a subscription-tier column against
  what a row requires).
- **Built-in Auth** covers signup without building one from scratch — including phone/OTP,
  worth considering seriously here since email-first signup isn't universal across every
  MENA market the way it might be elsewhere.
- **Realtime** is genuinely used by this spec specifically — live chat during co-casting
  (§5.1), live leaderboard updates (§5.3), live session seat counts (§6.1) — not a nice-to-have.

Things to plan for, specific to this project's scale (public product, real growth target, not
a two-user internal tool):
- **Budget for Supabase Pro (~$25/mo) from day one**, not the free tier — needed for no
  project-pausing, connection pooling under real concurrent public traffic, and automatic
  backups. This is a paying-customer product; losing data isn't an acceptable risk to defer.
- **RLS policies need real design work** — multiple roles and tiers (§6.1) is a bigger policy
  surface than a single "authenticated users only" rule.
- **Don't use Supabase Storage for the video lesson library or live streaming** — it's not
  built for video delivery at that scale. Use a dedicated service (Mux, Cloudflare Stream, or
  Bunny Stream) for video, and let Supabase hold everything else (users, subscriptions, chat,
  metadata, payment records).
- **Payments aren't native to Supabase** — Stripe/Tap Payments webhooks write subscription
  status into a Supabase table via an Edge Function or small serverless handler; standard
  pattern, but needs building, not assuming.

### 11.2 Other build considerations
- i18n routing + RTL-aware styling (Tailwind's RTL logical properties, or a dedicated i18n
  framework) is a bigger lift than a typical bilingual site because of full content parity
  (§4.1), not just UI strings.
- Video hosting/streaming for the lesson library and live sessions is a separate cost center
  from the rest of the stack — budget for it explicitly once volume estimates exist. Live
  co-casting (§5.1) adds real-time streaming infrastructure on top of on-demand video, which is
  a different (and pricier) problem.
- Payment integration in §6.2 likely means **multiple** gateway integrations (Tap Payments +
  Stripe/PayPal at minimum), not one processor covering everything.
- Multi-coach model (§3) implies the data model needs a **coach entity** from day one (bio,
  schedule, content ownership, revenue-share config) rather than bolting it on later.
- OpenDota/Stratz API integration (§5.2, §5.1) needs each member to link a Steam/Dota account
  — plan the auth/linking flow as part of onboarding, not as an afterthought bolted onto an
  existing profile page.
