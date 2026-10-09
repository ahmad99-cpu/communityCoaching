import { useState } from "react";

/**
 * Asks for a Discord username before showing a free-tool result (brief §5 step 3, §6).
 * The parent saves the lead; this component only collects and validates it.
 */
export function LeadCapture({ onSubmit }: { onSubmit: (discord: string) => Promise<void> | void }) {
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
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Your result is ready</p>
      <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Where should we send your full result?</h2>
      <p className="mt-3 text-sm text-text-muted">Drop your Discord username and we'll follow up with your breakdown.</p>

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
        {busy ? "Loading…" : "Show my result"}
      </button>
    </form>
  );
}
