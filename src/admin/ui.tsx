import { useEffect, useState, type ReactNode } from "react";
import type { ContentKey, SiteContent } from "@/content/types";
import { patchContent, resetContent, saveContent, useContent, useContentReload } from "@/lib/content";

/** Shared form building blocks for the admin dashboard. */

export const inputClass =
  "w-full rounded-control border border-navy-border bg-navy px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-gold focus:outline-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-text-muted/80">{hint}</span>}
    </label>
  );
}

export function TextInput(props: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input className={inputClass} value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
  );
}

export function TextArea(props: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      className={`${inputClass} resize-y leading-relaxed`}
      rows={props.rows ?? 3}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function NumberInput(props: { value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <input
      type="number"
      className={inputClass}
      value={Number.isFinite(props.value) ? props.value : ""}
      min={props.min ?? 0}
      step={props.step ?? 1}
      onChange={(e) => props.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
    />
  );
}

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-text">{title}</h2>
          {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function SmallButton({
  children,
  onClick,
  tone = "neutral",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger" | "gold";
  disabled?: boolean;
  title?: string;
}) {
  const tones = {
    neutral: "border-navy-border text-text hover:border-text-muted",
    danger: "border-red-500/40 text-red-300 hover:border-red-400",
    gold: "border-gold/60 text-gold hover:border-gold",
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-control border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/** Editable list of strings (features, heroes…). */
export function StringList({ items, onChange, placeholder, addLabel = "Add item" }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string }) {
  const update = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: -1 | 1) => onChange(moveItem(items, i, d));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className={inputClass} value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          <SmallButton onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</SmallButton>
          <SmallButton onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Move down">↓</SmallButton>
          <SmallButton tone="danger" onClick={() => onChange(items.filter((_, j) => j !== i))} title="Remove">✕</SmallButton>
        </div>
      ))}
      <SmallButton onClick={() => onChange([...items, ""])}>+ {addLabel}</SmallButton>
    </div>
  );
}

/** Moves item i up/down in a list. */
export function moveItem<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * Local draft of one content section + save/reset to Supabase. The live site updates
 * for every visitor on their next page load.
 */
export function useSectionDraft<K extends ContentKey>(key: K) {
  const live = useContent(key);
  const reload = useContentReload();
  const [draft, setDraft] = useState<SiteContent[K]>(live);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });

  // Follow the live content until the admin starts editing.
  useEffect(() => {
    if (!dirty) setDraft(live);
  }, [live, dirty]);

  function update(next: SiteContent[K]) {
    setDraft(next);
    setDirty(true);
    setStatus({ kind: "idle" });
  }

  /**
   * `prepare` runs on the draft against the latest saved version just before saving,
   * e.g. to keep a giveaway winner that was published from another tab meanwhile.
   */
  async function save(
    validate?: (v: SiteContent[K]) => string | null,
    prepare?: (draft: SiteContent[K], latest: SiteContent[K]) => SiteContent[K],
  ) {
    const problem = validate?.(draft);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "saving" });
    try {
      if (prepare) await patchContent(key, (latest) => prepare(draft, latest));
      else await saveContent(key, draft);
      await reload();
      setDirty(false);
      setStatus({ kind: "saved", message: "Saved. It's live on the site." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  async function reset() {
    if (!window.confirm("Go back to the built-in default content for this section? Your saved changes here will be removed.")) return;
    setStatus({ kind: "saving" });
    try {
      await resetContent(key);
      await reload();
      setDirty(false);
      setStatus({ kind: "saved", message: "Back to the default content." });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  function discard() {
    setDraft(live);
    setDirty(false);
    setStatus({ kind: "idle" });
  }

  return { draft, update, dirty, status, save, reset, discard };
}

/** Sticky save bar shown at the bottom of every editor. */
export function SaveBar({
  dirty,
  status,
  onSave,
  onDiscard,
  onReset,
}: {
  dirty: boolean;
  status: { kind: "idle" | "saving" | "saved" | "error"; message?: string };
  onSave: () => void;
  onDiscard: () => void;
  onReset: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-navy-border bg-navy/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-gold !px-5 !py-2.5" disabled={!dirty || status.kind === "saving"} onClick={onSave}>
          {status.kind === "saving" ? "Saving…" : "Save changes"}
        </button>
        {dirty && (
          <button className="text-sm font-semibold text-text-muted hover:text-text" onClick={onDiscard}>
            Discard
          </button>
        )}
        <span
          className={`text-sm ${status.kind === "error" ? "text-red-400" : status.kind === "saved" ? "text-emerald-400" : "text-text-muted"}`}
          role="status"
        >
          {status.message ?? (dirty ? "Unsaved changes" : "")}
        </span>
        <button className="ml-auto text-xs font-semibold text-text-muted underline-offset-4 hover:text-text hover:underline" onClick={onReset}>
          Reset to default
        </button>
      </div>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-black text-text">{title}</h1>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
    </header>
  );
}
