import { Field, PageHeader, SaveBar, SmallButton, TextArea, TextInput, moveItem, useSectionDraft } from "@/admin/ui";

export function FaqEditor() {
  const { draft, update, dirty, status, save, reset, discard } = useSectionDraft("faq");
  const items = draft.items;
  const setItems = (next: typeof items) => update({ ...draft, items: next });

  return (
    <div>
      <PageHeader title="Q&A" description="The questions accordion near the bottom of the sales page. Order here = order on the site." />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Question {i + 1}</span>
              <div className="flex gap-1.5">
                <SmallButton onClick={() => setItems(moveItem(items, i, -1))} disabled={i === 0} title="Move up">↑</SmallButton>
                <SmallButton onClick={() => setItems(moveItem(items, i, 1))} disabled={i === items.length - 1} title="Move down">↓</SmallButton>
                <SmallButton
                  tone="danger"
                  onClick={() => window.confirm("Delete this question?") && setItems(items.filter((_, j) => j !== i))}
                >
                  Delete
                </SmallButton>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              <Field label="Group" hint="The small title it sits under, e.g. “How 6SLOT works”. Same text = same group.">
                <TextInput value={item.group ?? ""} onChange={(group) => setItems(items.map((x, j) => (j === i ? { ...x, group } : x)))} />
              </Field>
              <Field label="Question">
                <TextInput value={item.q} onChange={(q) => setItems(items.map((x, j) => (j === i ? { ...x, q } : x)))} />
              </Field>
              <Field label="Answer">
                <TextArea value={item.a} rows={3} onChange={(a) => setItems(items.map((x, j) => (j === i ? { ...x, a } : x)))} />
              </Field>
            </div>
          </div>
        ))}
        <SmallButton tone="gold" onClick={() => setItems([...items, { q: "", a: "", group: items[items.length - 1]?.group ?? "" }])}>+ Add question</SmallButton>
      </div>

      <SaveBar
        dirty={dirty}
        status={status}
        onDiscard={discard}
        onReset={reset}
        onSave={() =>
          save((f) => {
            const bad = f.items.findIndex((x) => !x.q.trim() || !x.a.trim());
            return bad >= 0 ? `Question ${bad + 1} needs both a question and an answer.` : null;
          })
        }
      />
    </div>
  );
}
