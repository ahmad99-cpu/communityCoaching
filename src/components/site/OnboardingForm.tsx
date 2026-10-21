import { useState, type ReactNode } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";

/**
 * The onboarding questions, right on the thank-you page, so buyers can't skip them by leaving for a
 * Google Form tab. Answers still go to that same Google Form (site.links.onboardingForm), so they land
 * in the same response sheet as before. If the form's questions change in Google Forms, update the
 * entry ids and options below (they must match exactly, or Google drops the answer).
 */
const ENTRY = {
  email: "entry.590372277",
  discord: "entry.1333823093",
  region: "entry.1898272916",
  positions: "entry.324592894",
  rank: "entry.388533182",
  goal: "entry.1568535056",
  source: "entry.1931590649",
};

const OTHER = "Other";
const REGIONS = ["North America", "South America", "EU", "SEA", "Australia", "Africa", "The Middle East", "Russia", OTHER];
const POSITIONS = ["Carry", "Mid", "Offlane", "Soft Support", "Hard support"];
const RANKS = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
const SOURCES = ["Facebook", "Instagram", "Tiktok", "Discord", "Youtube", "eixn-dota.com", "A friend", OTHER];

const DONE_KEY = "6slot.onboarded";

/** The Discord name sent from this device, so coming back to the page shows "done". */
export function loadOnboarded(): string | null {
  try {
    return localStorage.getItem(DONE_KEY);
  } catch {
    return null;
  }
}

/** A choice with an "Other" text box, sent the way Google Forms expects it. */
function addChoice(body: URLSearchParams, entry: string, choice: string, other: string) {
  if (choice === OTHER) {
    body.append(entry, "__other_option__");
    body.append(`${entry}.other_option_response`, other.trim());
  } else body.append(entry, choice);
}

const inputCls =
  "w-full rounded-control border border-navy-border bg-navy px-3.5 py-3 text-text placeholder:text-text-muted/60 focus:border-gold focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-text">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${value ? "" : "text-text-muted/60"}`}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="text-text">
          {o}
        </option>
      ))}
    </select>
  );
}

export function OnboardingForm({ onDone }: { onDone: (discord: string) => void }) {
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [region, setRegion] = useState("");
  const [regionOther, setRegionOther] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [rank, setRank] = useState("");
  const [goal, setGoal] = useState("");
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [checked, setChecked] = useState(false);

  // What's still missing, in plain words, shown after the first press of the button.
  const missing = [
    !/^\S+@\S+\.\S+$/.test(email.trim()) && (email.trim() ? "a full email (like name@gmail.com)" : "your email"),
    discord.trim().length < 2 && "your Discord username",
    (region === "" || (region === OTHER && !regionOther.trim())) && "where you're based",
    positions.length === 0 && "at least one position",
    rank === "" && "your current rank",
    goal === "" && "your goal rank",
    (source === "" || (source === OTHER && !sourceOther.trim())) && "how you found 6SLOT",
  ].filter((m): m is string => Boolean(m));
  const valid = missing.length === 0;

  const togglePosition = (p: string) =>
    setPositions((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : POSITIONS.filter((x) => x === p || cur.includes(x))));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setChecked(true);
    if (!valid) return;
    setBusy(true);
    setFailed(false);
    const body = new URLSearchParams();
    body.append(ENTRY.email, email.trim());
    body.append(ENTRY.discord, discord.trim());
    addChoice(body, ENTRY.region, region, regionOther);
    for (const p of positions) body.append(ENTRY.positions, p);
    body.append(ENTRY.rank, rank);
    body.append(ENTRY.goal, goal);
    addChoice(body, ENTRY.source, source, sourceOther);
    try {
      // Google doesn't allow reading the reply from another site ("no-cors"), so a sent request
      // counts as success; every question is checked above so Google accepts it.
      await fetch(site.links.onboardingForm.replace(/\/viewform.*$/, "/formResponse"), { method: "POST", mode: "no-cors", body });
      try {
        localStorage.setItem(DONE_KEY, discord.trim());
      } catch {
        // Storage blocked: the answers are sent anyway.
      }
      track("Onboarding form sent");
      onDone(discord.trim());
    } catch {
      // Offline or blocked by an extension: offer the Google Form itself.
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 space-y-4">
      <Field label="Email you paid with on PayPal">
        <input type="email" autoComplete="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
      </Field>
      <Field label="Discord username">
        <input autoComplete="username" maxLength={64} value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="e.g. eixn" className={inputCls} />
      </Field>
      <Field label="Where are you based?">
        <Select value={region} onChange={setRegion} options={REGIONS} placeholder="Choose your region" />
        {region === OTHER && (
          <input maxLength={60} value={regionOther} onChange={(e) => setRegionOther(e.target.value)} placeholder="Your country" className={`${inputCls} mt-2`} />
        )}
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-text">Your main position(s)</legend>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => {
            const on = positions.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() => togglePosition(p)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  on ? "border-gold bg-gold/15 text-gold" : "border-navy-border text-text-muted hover:border-gold/60 hover:text-text"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Current rank">
          <Select value={rank} onChange={setRank} options={RANKS} placeholder="Rank" />
        </Field>
        <Field label="Goal rank">
          <Select value={goal} onChange={setGoal} options={RANKS} placeholder="Goal" />
        </Field>
      </div>
      <Field label="How did you find 6SLOT?">
        <Select value={source} onChange={setSource} options={SOURCES} placeholder="Choose one" />
        {source === OTHER && (
          <input maxLength={80} value={sourceOther} onChange={(e) => setSourceOther(e.target.value)} placeholder="Where?" className={`${inputCls} mt-2`} />
        )}
      </Field>
      <button type="submit" disabled={busy} className="btn-gold w-full py-3">
        {busy ? "Sending…" : "Send to Eixn"}
      </button>
      {checked && !valid && (
        <p role="alert" className="text-sm text-gold">
          Almost there. Still missing: {missing.join(", ")}.
        </p>
      )}
      {failed && (
        <p className="text-sm text-text-muted">
          That didn't go through.{" "}
          <a href={site.links.onboardingForm} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">
            Open the form here instead
          </a>
          .
        </p>
      )}
    </form>
  );
}
