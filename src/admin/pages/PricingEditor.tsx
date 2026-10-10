import type { PlanCard } from "@/content/types";
import { Field, NumberInput, PageHeader, Panel, SaveBar, StringList, TextArea, TextInput, useSectionDraft } from "@/admin/ui";

function PlanFields({ plan, onChange }: { plan: PlanCard; onChange: (p: PlanCard) => void }) {
  const set = <K extends keyof PlanCard>(k: K, v: PlanCard[K]) => onChange({ ...plan, [k]: v });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name"><TextInput value={plan.name} onChange={(v) => set("name", v)} /></Field>
        <Field label="Price (USD / month)"><NumberInput value={plan.price} onChange={(v) => set("price", v)} /></Field>
        <Field label="Badge" hint="Pill on the card. Empty = none."><TextInput value={plan.badge} onChange={(v) => set("badge", v)} /></Field>
      </div>
      <Field label="Subtitle"><TextInput value={plan.subtitle} onChange={(v) => set("subtitle", v)} /></Field>
      <Field label="Features (✓ list)">
        <StringList items={plan.features} onChange={(v) => set("features", v)} addLabel="Add feature" />
      </Field>
      <Field label="Highlighted line" hint="Last ✓ line. Text before the first “:” is gold, e.g. “Founder perks: …”. Empty = none.">
        <TextInput value={plan.highlight} onChange={(v) => set("highlight", v)} />
      </Field>
      <Field label="Button text"><TextInput value={plan.buttonLabel} onChange={(v) => set("buttonLabel", v)} /></Field>
    </>
  );
}

export function PricingEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("pricing");

  return (
    <div>
      <PageHeader title="Price cards" description="The “Claim your spot” section. The hero and final banner use the Founder price too." />

      <div className="mb-5 rounded-card border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-200">
        <strong>Changing a price here only changes what the site shows.</strong> The amount people are actually charged
        comes from the PayPal plan. To charge a new price, update the plan in PayPal (or create a new plan and update the
        plan ID secret) at the same time.
      </div>

      <div className="space-y-5">
        <Panel title="Section heading">
          <Field label="Heading"><TextInput value={draft.heading} onChange={(v) => update({ ...draft, heading: v })} /></Field>
          <Field label="Subheading"><TextInput value={draft.subheading} onChange={(v) => update({ ...draft, subheading: v })} /></Field>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Founder card" description="Gold card. Becomes “Sold out” automatically after 20 founders.">
            <PlanFields plan={draft.founder} onChange={(founder) => update({ ...draft, founder })} />
          </Panel>
          <Panel title="Member card" description="Locked until founder spots are gone.">
            <PlanFields plan={draft.member} onChange={(member) => update({ ...draft, member })} />
          </Panel>
        </div>

        <Panel title="Under the cards">
          <Field label="💡 Value box: bold line"><TextInput value={draft.valueBoxTitle} onChange={(v) => update({ ...draft, valueBoxTitle: v })} /></Field>
          <Field label="💡 Value box: text"><TextArea value={draft.valueBox} onChange={(v) => update({ ...draft, valueBox: v })} /></Field>
          <Field label="🛡️ Guarantee"><TextInput value={draft.guarantee} onChange={(v) => update({ ...draft, guarantee: v })} /></Field>
          <Field label="Small print"><TextInput value={draft.smallPrint} onChange={(v) => update({ ...draft, smallPrint: v })} /></Field>
        </Panel>
      </div>

      <SaveBar
        dirty={dirty}
        status={status}
        onDiscard={discard}
        onReset={reset}
        onSave={() =>
          save((p) => {
            for (const plan of [p.founder, p.member]) {
              if (!plan.name.trim()) return "Each card needs a name.";
              if (!(plan.price > 0)) return `${plan.name}: price must be more than 0.`;
              if (!plan.buttonLabel.trim()) return `${plan.name}: button text can't be empty.`;
            }
            return null;
          })
        }
      />
    </div>
  );
}
