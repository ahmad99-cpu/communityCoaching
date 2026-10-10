import { Field, PageHeader, Panel, SaveBar, TextInput, useSectionDraft } from "@/admin/ui";

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
        description="The 6 slots of the wheel and their 2 statements each. Players rate each statement from 0 (never) to 10 (always)."
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
