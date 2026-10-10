import { Field, PageHeader, Panel, SaveBar, TextInput, inputClass, useSectionDraft } from "@/admin/ui";
import { formatSessionLocal } from "@/lib/sessionTime";

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO (UTC) → value for <input type="datetime-local">, in the admin's own timezone. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NextSessionEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("next_session");
  const start = new Date(draft.startsAt);
  const valid = !Number.isNaN(start.getTime());
  const local = valid ? formatSessionLocal(start) : null;

  return (
    <div>
      <PageHeader
        title="Next session"
        description="The bar at the very top of the site: this week's topic, the time in each visitor's own timezone, and a countdown."
      />

      <div className="space-y-5">
        <Panel title="This week">
          <Field label="Date & time" hint="In your own timezone. Visitors see it converted to theirs.">
            <input
              type="datetime-local"
              className={`${inputClass} [color-scheme:dark]`}
              value={toLocalInput(draft.startsAt)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                if (!Number.isNaN(d.getTime())) update({ ...draft, startsAt: d.toISOString() });
              }}
            />
          </Field>
          {local && (
            <p className="text-xs text-text-muted">
              Shows as <strong className="text-text">{local.day} · {local.time}</strong> for you. Every visitor sees it in their own
              timezone.
            </p>
          )}
          <Field label="Topic" hint="Empty shows “Topic drops soon”.">
            <TextInput value={draft.topic} onChange={(topic) => update({ ...draft, topic })} placeholder="e.g. Laning: winning the first 10 minutes" />
          </Field>
        </Panel>

        <p className="text-xs leading-relaxed text-text-muted">
          Forgot to update it? Once a session is over, the site moves the card to the same time next week by itself and
          shows “Topic drops soon” until you set the new topic.
        </p>
      </div>

      <SaveBar
        dirty={dirty}
        status={status}
        onDiscard={discard}
        onReset={reset}
        onSave={() => save((v) => (Number.isNaN(new Date(v.startsAt).getTime()) ? "Pick a date and time." : null))}
      />
    </div>
  );
}
