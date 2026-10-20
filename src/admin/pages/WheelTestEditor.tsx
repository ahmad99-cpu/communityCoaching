import { Field, PageHeader, Panel, SaveBar, SmallButton, TextInput, useSectionDraft } from "@/admin/ui";

/**
 * The wheel is a hexagon, so there are always exactly 6 slots with 2 statements each.
 * Admins can reword everything but not add/remove slots (that would break the wheel).
 */
export function WheelTestEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("wheel_test");

  function setSlot(i: number, patch: Partial<(typeof draft.slots)[number]>) {
    update({ ...draft, slots: draft.slots.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  }

  return (
    <div>
      <PageHeader
        title="How Built Are You?"
        description="The 6 slots of the wheel, their 2 statements each, and the videos or posts that teach each slot (shown on the result as “Learn this slot”, weakest slot first)."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {draft.slots.map((slot, i) => (
          <Panel key={i} title={`Slot ${i + 1}`}>
            <Field label="Slot name" hint="Shown on the wheel. Keep it short; “A & B” wraps onto two lines.">
              <TextInput value={slot.name} onChange={(name) => setSlot(i, { name })} />
            </Field>
            {slot.statements.map((text, k) => (
              <Field key={k} label={`Statement ${k + 1}`}>
                <TextInput
                  value={text}
                  onChange={(v) => {
                    const statements: [string, string] = [...slot.statements];
                    statements[k] = v;
                    setSlot(i, { statements });
                  }}
                />
              </Field>
            ))}
            <Field label="Learn this slot" hint="Videos, posts or session replays. Shown on the result; leave empty to hide.">
              <div className="space-y-2">
                {(slot.resources ?? []).map((r, k) => (
                  <div key={k} className="flex flex-wrap gap-2">
                    <div className="min-w-[140px] flex-1">
                      <TextInput
                        value={r.title}
                        placeholder="Title, e.g. How to win a hard lane"
                        onChange={(title) =>
                          setSlot(i, { resources: (slot.resources ?? []).map((x, j) => (j === k ? { ...x, title } : x)) })
                        }
                      />
                    </div>
                    <div className="min-w-[180px] flex-[2]">
                      <TextInput
                        value={r.url}
                        placeholder="https://youtube.com/…"
                        onChange={(url) =>
                          setSlot(i, { resources: (slot.resources ?? []).map((x, j) => (j === k ? { ...x, url } : x)) })
                        }
                      />
                    </div>
                    <SmallButton
                      tone="danger"
                      title="Remove"
                      onClick={() => setSlot(i, { resources: (slot.resources ?? []).filter((_, j) => j !== k) })}
                    >
                      ✕
                    </SmallButton>
                  </div>
                ))}
                <SmallButton onClick={() => setSlot(i, { resources: [...(slot.resources ?? []), { title: "", url: "" }] })}>
                  + Add link
                </SmallButton>
              </div>
            </Field>
          </Panel>
        ))}
      </div>

      <SaveBar
        dirty={dirty}
        status={status}
        onDiscard={discard}
        onReset={reset}
        onSave={() =>
          save((w) => {
            const bad = w.slots.findIndex((s) => !s.name.trim() || s.statements.some((t) => !t.trim()));
            return bad >= 0 ? `Slot ${bad + 1} needs a name and both statements.` : null;
          })
        }
      />
    </div>
  );
}
