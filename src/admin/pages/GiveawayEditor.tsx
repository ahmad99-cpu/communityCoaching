import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PRIZE_CATEGORY_LABELS, type GiveawayItem, type Prize, type PrizeCategory } from "@/content/types";
import { prizeTitle } from "@/content/prize";
import { Field, NumberInput, PageHeader, Panel, SaveBar, SmallButton, TextInput, inputClass, moveItem, useSectionDraft } from "@/admin/ui";
import { GiveawayDraw } from "@/admin/pages/GiveawayDraw";
import { useContent } from "@/lib/content";

const MAX_IMAGE_MB = 5;

/** Uploads to the public `site-assets` bucket and returns the public URL. */
async function uploadImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `giveaway/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-assets").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}

function ImagePicker({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Pick an image file (PNG, JPG, WebP…).");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Image is too big (max ${MAX_IMAGE_MB} MB).`);
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-control border border-dashed border-navy-border bg-navy">
        {url ? <img src={url} alt="" className="h-full w-full object-contain p-1" /> : <span className="text-xs text-text-muted">No image</span>}
      </div>
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex flex-wrap gap-2">
          <SmallButton tone="gold" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
          </SmallButton>
          {url && <SmallButton tone="danger" onClick={() => onChange("")}>Remove</SmallButton>}
        </div>
        <p className="text-xs text-text-muted">Square PNG with a transparent background looks best. Max {MAX_IMAGE_MB} MB.</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

function PrizeFields({ prize, onChange }: { prize: Prize; onChange: (p: Prize) => void }) {
  const set = <K extends keyof Prize>(k: K, v: Prize[K]) => onChange({ ...prize, [k]: v });
  const needsTeam = prize.category === "tshirt" || prize.category === "jacket";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select className={inputClass} value={prize.category} onChange={(e) => set("category", e.target.value as PrizeCategory)}>
            {Object.entries(PRIZE_CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Value (USD)" hint="Shown as “($55 value)”. 0 hides it.">
          <NumberInput value={prize.value} onChange={(v) => set("value", v)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Item name"
          hint={prize.category === "dota_item" ? "e.g. Arcana: Fiery Soul of the Slayer" : prize.category === "coaching" ? "e.g. Free 1-on-1 coaching session with Eixn" : "e.g. 2025 Pro Jersey"}
        >
          <TextInput value={prize.name} onChange={(v) => set("name", v)} />
        </Field>
        <Field label={needsTeam ? "Team" : "Team (optional)"} hint="e.g. Team Liquid. Added in front of the name.">
          <TextInput value={prize.team} onChange={(v) => set("team", v)} />
        </Field>
      </div>
      <Field label="Image">
        <ImagePicker url={prize.imageUrl} onChange={(url) => set("imageUrl", url)} />
      </Field>
      {prize.name && (
        <p className="text-sm text-text-muted">
          Shows on the site as: <strong className="text-text">{prizeTitle(prize)}</strong>
          {prize.value > 0 && ` ($${prize.value} value)`}
        </p>
      )}
    </>
  );
}

export function GiveawayEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("giveaway");
  const items = draft.items;
  const setItems = (next: GiveawayItem[]) => update({ ...draft, items: next });
  const setItem = (i: number, patch: Partial<GiveawayItem>) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const [tab, setTab] = useState<"prizes" | "draw">("prizes");
  const liveIds = new Set(useContent("giveaway").items.map((g) => g.id));
  const hasUnsavedNew = items.some((g) => !liveIds.has(g.id));

  return (
    <div>
      <PageHeader
        title="Giveaway"
        description="The prize card under the hero. Add more than one giveaway and it becomes a carousel. Progress fills automatically from the live member count."
      />

      <div className="mb-6 flex gap-1 border-b border-navy-border" role="tablist">
        {(
          [
            ["prizes", "Prizes"],
            ["draw", "🎡 Draw winner"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              tab === key ? "border-gold text-gold" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "draw" ? (
        <GiveawayDraw hasUnsavedNew={hasUnsavedNew} />
      ) : (
        <>
          <div className="space-y-5">
            {items.map((item, i) => (
              <Panel
                key={item.id}
                title={items.length > 1 ? `Giveaway ${i + 1} of ${items.length}` : "Current giveaway"}
                description={items.length > 1 ? "Order here = order in the carousel." : undefined}
                actions={
                  items.length > 1 && (
                    <div className="flex gap-1.5">
                      <SmallButton onClick={() => setItems(moveItem(items, i, -1))} disabled={i === 0} title="Move up">↑</SmallButton>
                      <SmallButton onClick={() => setItems(moveItem(items, i, 1))} disabled={i === items.length - 1} title="Move down">↓</SmallButton>
                      <SmallButton
                        tone="danger"
                        onClick={() => window.confirm("Remove this giveaway?") && setItems(items.filter((_, j) => j !== i))}
                      >
                        Remove
                      </SmallButton>
                    </div>
                  )
                }
              >
                <Field label="Unlocks at (members)">
                  <NumberInput value={item.goal} min={1} onChange={(goal) => setItem(i, { goal })} />
                </Field>
                <PrizeFields prize={item.prize} onChange={(prize) => setItem(i, { prize })} />
              </Panel>
            ))}

            <SmallButton
              tone="gold"
              onClick={() =>
                setItems([
                  ...items,
                  { id: crypto.randomUUID(), goal: items[items.length - 1]?.goal ?? 20, prize: { category: "dota_item", name: "", team: "", value: 0, imageUrl: "" } },
                ])
              }
            >
              + Add another giveaway
            </SmallButton>

            <Panel
              title="Next giveaway (teaser)"
              description="The small card beside the main giveaway: a preview of what's coming, not a live giveaway (you can't draw a winner for it). Keep it hidden to show the blacked-out Aegis with a “?”, or reveal it. When it should go live, use “Make it a current giveaway”."
              actions={
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#E8B54A]"
                    checked={draft.next.revealed}
                    onChange={(e) => update({ ...draft, next: { ...draft.next, revealed: e.target.checked } })}
                  />
                  Revealed
                </label>
              }
            >
              <Field label="Unlocks at (members)">
                <NumberInput value={draft.next.goal} min={1} onChange={(v) => update({ ...draft, next: { ...draft.next, goal: v } })} />
              </Field>
              <PrizeFields prize={draft.next.prize} onChange={(prize) => update({ ...draft, next: { ...draft.next, prize } })} />
              {draft.next.prize.name.trim() && (
                <div className="flex flex-wrap items-center gap-3 border-t border-navy-border pt-4">
                  <SmallButton
                    tone="gold"
                    onClick={() => {
                      if (!window.confirm(`Move “${prizeTitle(draft.next.prize)}” into the current giveaways? The teaser goes back to the hidden Aegis.`)) return;
                      update({
                        ...draft,
                        items: [...draft.items, { id: crypto.randomUUID(), goal: draft.next.goal, prize: draft.next.prize, winner: null }],
                        next: {
                          revealed: false,
                          goal: draft.next.goal,
                          prize: { category: "dota_item", name: "", team: "", value: 0, imageUrl: "" },
                        },
                      });
                    }}
                  >
                    ↑ Make it a current giveaway
                  </SmallButton>
                  <span className="text-xs text-text-muted">Then click Save changes. It will show up in the carousel and in 🎡 Draw winner.</span>
                </div>
              )}
            </Panel>
          </div>

          <SaveBar
            dirty={dirty}
            status={status}
            onDiscard={discard}
            onReset={reset}
            onSave={() =>
              save((g) => {
                if (g.items.length === 0) return "Add at least one giveaway.";
                for (const [i, item] of g.items.entries()) {
                  const label = g.items.length > 1 ? `Giveaway ${i + 1}` : "The current giveaway";
                  if (!item.prize.name.trim()) return `${label} needs an item name.`;
                  if (item.goal < 1) return `${label}: “Unlocks at” must be at least 1 member.`;
                }
                if (g.next.revealed && !g.next.prize.name.trim()) return "Give the next giveaway a name before revealing it.";
                return null;
              },
              // Winners are published from the Draw tab; keep whatever is live right now.
              (draft, latest) => {
                const winners = new Map(latest.items.map((g) => [g.id, g.winner ?? null]));
                return { ...draft, items: draft.items.map((g) => ({ ...g, winner: winners.get(g.id) ?? null })) };
              })
            }
          />
        </>
      )}
    </div>
  );
}
