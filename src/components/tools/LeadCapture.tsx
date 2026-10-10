import { useState } from "react";

/**
 * Asks for a Discord username before showing a free-tool result (brief §5 step 3, §6).
 * The parent saves the lead; this component only collects and validates it.
 */
export function LeadCapture({
  onSubmit,
  eyebrow = "Your result is ready",
  title = "Where should we send your full result?",
  body = "Drop your Discord username and we'll follow up with your breakdown.",
  button = "Show my result",
}: {
  onSubmit: (discord: string) => Promise<void> | void;
  eyebrow?: string;
  title?: string;
  body?: string;
  button?: string;
}) {
  const [discord, setDiscord] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = discord.trim().length >= 2;

  return (
    <form
      className="card mx-auto max-w-lg p-6 text-center sm:p-10"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || busy) return;
        setBusy(true);
        await onSubmit(discord);
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-text-muted">{body}</p>

      <label htmlFor="discord" className="sr-only">
        Discord username
      </label>
      <input
        id="discord"
        autoFocus
        autoComplete="username"
        maxLength={64}
        placeholder="Discord username"
        value={discord}
        onChange={(e) => setDiscord(e.target.value)}
        className="mt-6 w-full rounded-control border border-navy-border bg-navy px-4 py-3.5 text-text placeholder:text-text-muted/60 focus:border-gold focus:outline-none"
      />
      <button type="submit" className="btn-gold mt-4 w-full" disabled={!valid || busy}>
        {busy ? "Loading…" : button}
      </button>
    </form>
  );
}
