# 6SLOT Website Brief

**What this is:** everything needed to build the 6SLOT website: brand, page structure, all final copy, interactive tools, and payment setup. All copy below is final unless marked as a placeholder like `[X]`.

**What 6SLOT is:** weekly live Dota 2 group coaching with Eixn (Jad Hammoud), run on Discord, sold as a monthly subscription. Its own standalone website (separate from eixn-dota.com), but visually part of the Eixn family.

**Launch date:** first session Saturday, October 31, 2026.

---

## 1. Brand

- **Name:** 6SLOT (logo: the "6" in gold, "SLOT" in white)
- **Tagline:** Get fully built.
- **Meaning:** "six-slotted" = a fully built hero in Dota. Each weekly topic is one "slot" of your game.
- **Language:** English only

### Colors: navy and gold (matches eixn-dota.com)

| Use | Color | Hex |
|---|---|---|
| Page background | Navy | `#0E1724` |
| Cards / sections | Lighter navy | `#16212F` |
| Borders / dividers | Navy border | `#24324A` |
| Accent (buttons, highlights, logo "6") | Gold | `#E8B54A` |
| Main text | Off-white | `#F5F5F5` |
| Secondary text | Muted blue-grey | `#8FA0B5` |

**Color rules**
- Gold only for what matters: CTA buttons, the founder counter, key words in headlines, the logo "6". If everything is gold, nothing stands out.
- Buttons: gold background, navy text.
- Red and green only when they carry meaning (correct/wrong, warnings). Never decoration.
- Fonts: match eixn-dota.com for consistency.

---

## 2. Site map

**Launch (Phase 1)**
1. **Home / sales page** (main page, one job: get people to join)
2. **How Built Are You?** (wheel test, free for everyone)
3. **Position test** (free, optional tool)
4. **Thank-you page** (after payment)
5. **Policies:** refund and cancellation, privacy, giveaway rules (Jad will provide the text)

**Later**
- Coming soon: Meta picks page (spec in section 7, build after launch)
- Phase 2: Find a team form (posts into a Discord channel)
- Phase 3: Counter picker tool
- Later: MMR leaderboard
- After week one: a proof strip of 6SLOT member results under the hero (testimonials collected after the first sessions)

**Important:** the sales page has **no navigation links** except the Join button. Free tools and policies are linked in the footer only, so nothing pulls people away before they join.

---

## 3. Sales page: sections in order

### 3.1 Header
- Left: **6SLOT** logo + small tagline "Get fully built."
- Right: gold **Join** button (scrolls to pricing)

### 3.2 Hero

> *Tier 1 Analyst · The International x3 & Riyadh Masters* (small gold line above headline)
>
> # STUCK AT THE SAME RANK? FIX IT ONE TOPIC AT A TIME.
> ("FIX IT ONE TOPIC AT A TIME." in gold)
>
> Every week, one topic. Submit your replays, and Eixn breaks them down live. You drill it, leave with homework, and actually understand it. Plus special guests along the way.
>
> **[ CLAIM MY FOUNDER SPOT ]** (gold button)
>
> $19/month locked forever · Try your first session risk-free · Cancel anytime
>
> **First session: Saturday, October 31 · 12:00 UTC**
> Every Saturday, 2 to 3 hours. Times can shift based on a weekly member survey, and every session is recorded.
>
> 500+ players coached · 11,000 MMR · 🔥 **[X] of 20 founder spots left**
>
> *Not sure where you stand?* **Check how built you are (2 min) →** (secondary link to the wheel test)

**Dev notes**
- **Session time must display in the visitor's local timezone automatically** (convert from 12:00 UTC using their browser timezone). Show "your time" next to it.
- Founder spots counter: needs to be easy for Jad to update (a single config value is fine).

### 3.3 Giveaway widget

> 🎁 **FOUNDERS GIVEAWAY**
> **Free 1-on-1 coaching session with Eixn** ($55 value)
> Unlocks at **20 members**
> [progress bar] **[13] / 20**
> *[7] more members and one founder wins it.*
>
> **NEXT GIVEAWAY** 🔒
> [Aegis silhouette, blacked out, big "?"]
> *Revealed soon.*

**Dev notes**
- Progress bar is based on **member count**, not a timer. Easy for Jad to update.
- Next goals after 20 can be set later (for example 35, then 50).
- Aegis image: fully blacked out silhouette with a "?" until the reveal.

### 3.4 What you get

**Heading:** What you get
**Subheading:** One topic a week, learned three ways: broken down, drilled live, and taken into your games.

**4 cards (2x2 grid):**

**🎙️ Weekly live session**
2 to 3 hours on Discord with Eixn, every week, one topic. Matchups, laning, itemization, teamfights, map movement, positioning, farming patterns and much more. You go deep on one thing until it actually clicks.

**🎯 Your replays, broken down**
Submit your replays before each session. Eixn breaks them down live, so you see exactly what you're doing and what it should look like.

**⚔️ Live drills**
You don't just listen, you practice. 2v2 lane battles for laning week, recreated teamfights for positioning week and much more, done together during the session.

**📋 Homework & progress**
Leave every session with specific tasks, post your progress in the homework check-in channel, and track your climb. Members who improve the most get rewarded.

**Also included**
- ✓ **Start Here kit:** everything you need to get set up, ready the moment you join
- ✓ **The Session Vault:** every session recorded, rewatch anytime
- ✓ **Stack partners:** find teammates to grind with in the members-only Discord
- ✓ **10% off sessions with Eixn**

**Special events**
- ⭐ Guest pro players
- 📺 Watch parties with live analysis of tournament games
- 🎁 Giveaways, digital and physical

### 3.5 Meet your coach

**Heading:** Meet Your Coach

Jad Hammoud, known as **Eixn**, played professionally for years and competed at the highest level. But the coaching didn't start when Eixn retired. It started long before that.

Through his entire playing career, he was coaching. No platform, no audience. Just teammates, friends and players in his circle trying to figure their game out.

That instinct took over when Eixn found himself helping the young players on the **PSG Quest** roster. The team went on to reach Tier 1, Top 4 at the **Bali Major**, Top 6 at the **Esports World Cup**, and a qualification to **The International**.

Since then, Eixn has helped **500+ players** climb out of their rank through 1-on-1 coaching. **6SLOT** is how he brings that same approach to more players at once: one topic a week, real replays, real drills, and a community grinding the same way you are.

**Stats row:**
**11K** MMR · **Tier 1** Analyst *(3× The International · Riyadh Masters)* · **500+** Students · **23K** Hours

*Design note: highlight names in gold, same as eixn-dota.com (Jad Hammoud, Eixn, PSG Quest, Bali Major, Esports World Cup, The International, 500+ players, 6SLOT).*

### 3.6 Is 6SLOT for you?

> # Is 6SLOT for you?
>
> **It's not for you if:**
> ✗ You want someone to play your games for you
> ✗ You're looking for a quick trick to gain 1,000 MMR overnight
> ✗ You're not willing to do the homework
>
> **It's for you if:**
> ✓ You've been stuck at the same rank and you're tired of guessing why
> ✓ You want to actually understand the game, not just copy builds
> ✓ You're ready to put in the work between sessions

### 3.7 Pricing

**Heading:** Claim your spot
**Subheading:** Every member gets the full 6SLOT experience. Founders just pay less, forever.

**Card 1: FOUNDER** (highlighted with gold border, "🔥 LIMITED" badge)
> **$19 / month**
> Locked in forever. First 20 members only.
>
> ✓ Weekly 2 to 3 hour live sessions
> ✓ Your replays broken down live
> ✓ Live drills every session
> ✓ Homework & progress rewards
> ✓ Start Here kit
> ✓ The Session Vault
> ✓ Members-only Discord & stack partners
> ✓ Special events: guest pros, watch parties, giveaways
> ✓ 10% off sessions with Eixn
> ✓ **Founder perks:** gold Founder role and a vote on every month's topics
>
> **[ CLAIM MY FOUNDER SPOT ]**
> 🔥 [X] of 20 spots left

**Card 2: MEMBER**
> **$29 / month**
> Available once founder spots are gone.
>
> ✓ Everything in Founder (except founder perks)
>
> **[ UNLOCKS AFTER 20 FOUNDERS ]** (greyed out until founder spots sell out, then becomes **JOIN 6SLOT** with the $29 subscription)

**Value box (under the cards):**
> 💡 **A single 1-on-1 session with Eixn costs $55.** As a founder, you get 4 live sessions a month, 2 to 3 hours each, plus everything above, for $19.

**Guarantee strip:**
> 🛡️ **Try your first session. Not for you? Full refund, no questions asked.**

**Small print:**
> Cancel anytime. Founders who cancel lose their $19 price permanently.

### 3.8 Referral: Bring your stack

> **Bring your stack.**
> Bring a friend to try a live session for free. If they join, their first month is $19, and you get a month on us.

### 3.9 FAQs (accordion)

**Who is 6SLOT for?**
Players who've been stuck at the same rank for months or even years. You know a lot about Dota, you watch the tournaments and the guides, but you still can't see what's actually costing you games. If you're ready to find out and put in the work, this is for you.

**Which positions does it cover?**
All five. Each topic is broken down for every role, so whether you play carry or hard support, you'll know what it means for you.

**I've watched tons of guides already. Why is this different?**
Guides show you what good players do. They don't show you what *you're* doing wrong. 6SLOT breaks down real member replays, then you practice the fix live in drills. Watching teaches you, practicing changes your games.

**Will I actually get attention in a group?**
Yes. You can ask questions live, submit replays every week, and get feedback in the Discord between sessions. And as 6SLOT grows, it grows with you: more sessions, more pro guests, more events.

**How fast will I see results?**
It depends on where you start and how much you put into the homework. Most players notice they're thinking differently about the game after the first session. The rank follows when you apply it consistently.

**When are the sessions?**
Every Saturday, 2 to 3 hours on Discord, starting October 31 at 12:00 UTC. Times can shift based on a weekly member survey so they work for as many people as possible.

**What if I can't make it live?**
Every session is recorded and saved in the Session Vault. Watch it whenever it works for you.

**How do replay submissions work?**
Before each session, submit a replay that fits that week's topic in the replay channel. Eixn picks the replays that best show the topic and breaks them down live, so even when it's not your game, it's your mistake being fixed.

**Do I have to join the drills?**
No, but you should. Drills are where the topic goes from "I understand it" to "I can actually do it."

**Who are the guest pro players?**
From time to time, pro players join sessions as special guests to share how they think about the game and answer member questions. Guests are announced in Discord ahead of time. Stay tuned, the first names are coming soon.

**How do giveaways work?**
Giveaways unlock as 6SLOT grows. Every member is entered automatically, and winners are announced in Discord. The next one is still a secret. Stay tuned.

**Why is the founder price so low?**
Because founders are the first ones in. They help shape the sessions, the topics and the community from day one, and in return they keep $19/month for as long as they stay subscribed. Once the 20 founder spots are gone, the price is $29.

**How does the referral program work?**
Invite a friend to 6SLOT. If they join, their first month is $19 instead of $29, and you get one free month. The free month can be earned once per member. Just make sure your friend mentions your name when they message Eixn.

**Can I bring a friend to try a session?**
Yes. Every member can bring one friend to try a live session for free. Message Eixn on Discord before the session with your friend's Discord username, and they'll get access for that session.

**What do I need to join?**
Dota 2, Discord, and a card or PayPal account. A mic is optional but useful for drills and questions.

**How do I get access after paying?**
Instantly. After you pay, you're taken straight to the Discord invite and the Start Here kit. Message Eixn with the email you paid with, and your full member access is unlocked within 24 hours.

**What language are the sessions in?**
English.

**Can I cancel anytime?**
Yes, cancel anytime. If your subscription isn't renewed before the next session, your access ends. Founders who cancel lose the $19 price permanently.

**Is there a refund?**
Yes. Try your first session, and if 6SLOT isn't for you, ask for a full refund before your second session. No questions asked.

**What's the difference between 6SLOT and 1-on-1 coaching?**
6SLOT teaches the fundamentals everyone struggles with, every week, at a low price. 1-on-1 coaching goes deep on your games only. Members get 10% off sessions with Eixn whenever they want that extra push.

### 3.10 Final CTA banner

> # YOUR NEXT SLOT STARTS THIS WEEK.
> One topic. Your replays. Live drills. Join before the founder spots are gone.
>
> **[ CLAIM MY FOUNDER SPOT ]**
> $19/month locked forever · Try your first session risk-free · 🔥 [X] of 20 spots left

### 3.11 Footer

- 6SLOT logo · *Get fully built.* · *Dota 2 group coaching with Eixn.*
- Free tools: **How Built Are You?** · **Position Test**
- Coming soon (greyed): Meta Picks · Counter Picker · Find a Team
- Policies: Refund & Cancellation · Privacy · Giveaway Rules
- Social icons (same as eixn-dota.com)
- Disclaimer: *Not affiliated with or endorsed by Valve Corporation. Dota 2 and its game assets are property of Valve.*

**The CTA button must appear at least 3 times:** hero, pricing, final banner. Never more than one scroll away.

---

## 4. Thank-you page (after payment)

> # You're in. Welcome to 6SLOT.
>
> **Step 1:** Join the Discord: **[ JOIN 6SLOT DISCORD ]**
> **Step 2:** Message Eixn with the email you paid with to unlock your member role.
> **Step 3:** Open the Start Here channel to get set up before your first session.

The PayPal subscription buttons must redirect here after a successful payment.

---

## 5. How Built Are You? (wheel test)

Free for everyone on the website. Also used by members: at onboarding as their starting wheel, and retaken every month to track progress.

### The six slots

| Slot | Covers |
|---|---|
| 1. Role & Drafting | Main and secondary role, hero pool, counters |
| 2. Laning | Matchups, resource management, pulling, lane equilibrium |
| 3. Farming & Itemization | Build choices, item timings |
| 4. Map Movement & Positioning | Where to be, when, and why |
| 5. Teamfights & Objectives | Fight role, targets, Roshan, towers |
| 6. Mindset & Decisions | Tilt control, communication, learning from losses |

### The 12 statements
Player rates each from **0 (never) to 10 (always)**.

**Role & Drafting**
1. I know how to play my main role, and a secondary role when I don't get my main
2. My hero pool is big enough to play any game, including picking counters

**Laning**
3. I know how to win or go even in a hard matchup
4. I understand resource management, pulling, and lane equilibrium

**Farming & Itemization**
5. I change my build based on the enemy heroes, not a guide
6. I hit my item timings on time, not delayed

**Map Movement & Positioning**
7. I'm never walking around the map doing nothing, I always know where I should be next
8. I'm always in the right place on the map based on the game time and the next objective

**Teamfights & Objectives**
9. I know my job in a fight and hit the right targets
10. I know when to take Roshan, push a tower, or back off

**Mindset & Decisions**
11. I stay calm and keep communicating after mistakes or bad teammates
12. I can explain why I lost a game, beyond blaming my team

### Scoring
- Each slot score = average of its 2 statements (0 to 10)
- Total = sum of the 6 slots (0 to 60)
- Weakest slot = lowest slot score

### Flow
1. Intro screen: "How built are you? 12 quick questions. Find out which slot is holding your MMR back." **[ Start ]**
2. 12 statements (one per screen or all on one page, 0 to 10 slider or buttons)
3. **Before showing the result:** ask for their Discord username ("Where should we send your full result?"). Save it so Jad can follow up. This is lead capture.
4. Result screen

### Result screen
1. **The wheel:** a six-sided radar chart.
   - **Filled gold shape** = where they are now
   - **Dashed gold outline** = fully built (10 on every slot)
   - Each slot label shows the score and the gap, e.g. "Laning 6/10 · +4"
2. **The car:** a car rolling on a road, using **their wheel shape as its wheels**. Low slots create flat spots, so the car bounces. A fully built wheel rolls smoothly.
   - Logic: each wheel is a hexagon whose 6 corner distances come from the 6 slot scores. As the wheel rotates, the car body's height = the distance from wheel center to the lowest point touching the road. Uneven wheels = bumpy ride.
3. **Summary text:**
   *"You're [31]/60 built, [29] points from fully built. Biggest gap: [Farming & Itemization] (+[7]). A wheel with a flat spot doesn't roll. That's where your MMR keeps getting stuck."*
4. **CTA:** *"6SLOT covers one slot every week, starting October 31."* **[ CLAIM MY FOUNDER SPOT ]**

**Members' monthly retake:** add a third shape, **last month's wheel as a faint outline**, so they see where they were, where they are now, and where they need to be.

*A working prototype of the wheel and car was built in the planning chat. Ask Jad for screenshots.*

---

## 6. Position test (optional free tool)

- **Purpose:** for players who don't know which position fits them best. Optional, not part of onboarding.
- **Format:** 12 questions about temperament and how they think in game. No right answers.
- **Result:** best position, why, and heroes to try.
- **Lead capture:** ask for Discord username before showing the result.
- **Result CTA:** point to 6SLOT and to The Real Problem Diagnostic.
- **Transparency note** on the intro screen: "Where the questions come from: built from years of coaching all five positions."
- **Content:** questions and results still to be written by Jad. Build the page so questions, answers and result text are easy to edit.

---

## 7. Meta picks page (COMING SOON, not part of launch)

At launch, only show it as a greyed "coming soon" item in the footer. Build it after launch using this spec:


- **Heading:** Eixn's Meta Picks · Patch [X]
- **Layout:** 5 rows (Carry, Mid, Offlane, Support, Hard Support), 5 ranked heroes per row, hero image + name.
- **Short note on some heroes** (2 to 4 words, e.g. "Vessel = broken") and an optional note per row.
- **CTA at the bottom:** *"Know what to pick, but not how to play it? That's what we cover every week."* **[ JOIN 6SLOT ]**
- Jad updates it every patch, so it must be easy to edit.
- A `!meta` command on Jad's stream will link to this page.
- **Content:** picks and notes still to come from Jad.

---

## 8. Payments (PayPal Business)

- **Founder plan:** $19/month subscription
- **Member plan:** $29/month subscription (button only active after 20 founders)
- Both buttons redirect to the **thank-you page** after successful payment.
- **On the site, say "card or PayPal,"** not just PayPal.
- **Test before launch:** open the checkout in a private window, not logged into PayPal, and confirm the card option shows up for subscriptions.
- **Referral payments** (friend's $19 first month) are handled individually by Jad, not on the site.

---

## 9. Operations (Jad's side, not for the website build)

**Discord**
- Roles: gold Founder, Member, Guest
- Channels: announcements, Start Here, replay submissions, homework check-ins, stack partners, Session Vault, topic voting (founders only)

**Start Here kit:** wheel test (starting wheel), position test link, short onboarding video

**Access:** member role assigned manually within 24 hours. Removed manually when a subscription isn't renewed before the next session.

**Referral flow**
1. Members can bring 1 friend to 1 session (temporary Guest role, removed after)
2. If the friend joins: first month $19 (handled individually), then $29
3. Referrer gets 1 free month, once per member: Jad pauses/suspends their subscription for a month (access kept), no cancelling needed
4. Ask every new member "Did someone refer you?" and log it

**Exit question:** when someone cancels, ask: "What would have made you stay?"

**Numbers to track:** members, cancellations, referrals, wheel test takers, and how many wheel test takers become members.

---

## 10. Before launch checklist

- [ ] Buy domains: **6slot.gg** and **sixslot.gg** (point one to the other)
- [ ] Claim social handles
- [ ] Policies written and linked: refund & cancellation, privacy, giveaway rules
- [ ] PayPal plans created and card checkout tested
- [ ] Discord roles and channels set up
- [ ] Test session with friends: screen share, sound, recording, 2v2 drills
- [ ] Start Here kit ready
- [ ] Position test questions written
- [ ] Giveaway: prize photo + Aegis silhouette
- [ ] Month 1 topics chosen (Jad picks month 1, founders vote from month 2)
- [ ] Warm list messaged 48 hours before public launch (past students, Metafy clients, DM leads)
- [ ] Founder counter and giveaway progress set to real numbers

---

## 11. Placeholders to fill

| Placeholder | Where |
|---|---|
| `[X] of 20 founder spots left` | Hero, pricing, final CTA |
| `[13] / 20` giveaway progress | Giveaway widget |
| Aegis silhouette image | Giveaway widget |
| Social links | Footer |
| Discord invite link | Thank-you page |
| Policy texts | Footer pages |
| Position test content | Position test page |
