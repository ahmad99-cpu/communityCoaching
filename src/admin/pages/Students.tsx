import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useMemberCounts } from "@/lib/memberCounts";
import { ENDING_SOON_DAYS, periodFor, type Period, type StudentRow } from "@/admin/students";
import { Field, PageHeader, SmallButton, inputClass } from "@/admin/ui";

type Filter = "all" | "ok" | "ending_soon" | "ended";

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Row colours: orange = ending soon, red = ended (the only places these colours are used). */
const ROW_TONE: Record<Period["state"], string> = {
  ok: "",
  ending_soon: "bg-orange-500/10 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-orange-400",
  ended: "bg-red-500/10 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-red-500",
};

function DaysLeft({ period }: { period: Period }) {
  if (period.state === "ended") {
    const ago = Math.abs(period.daysLeft);
    return <span className="font-bold text-red-400">Ended{ago > 0 ? ` ${ago}d ago` : " today"}</span>;
  }
  return (
    <span className={`font-bold ${period.state === "ending_soon" ? "text-orange-400" : "text-text"}`}>
      {period.daysLeft} day{period.daysLeft === 1 ? "" : "s"} left
    </span>
  );
}

function StatusChip({ row }: { row: StudentRow }) {
  const tone =
    row.status === "active"
      ? "border-emerald-500/40 text-emerald-300"
      : row.status === "cancelled" || row.status === "expired"
        ? "border-red-500/40 text-red-300"
        : "border-orange-500/40 text-orange-300";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tone}`}>{row.status}</span>;
}

function AddStudentForm({ onAdded }: { onAdded: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: "", email: "", discord: "", plan: "founder", paidOn: today, note: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() && !form.email.trim() && !form.discord.trim()) {
      return setError("Add at least a name, email or Discord username.");
    }
    setBusy(true);
    const paidAt = new Date(`${form.paidOn}T12:00:00`).toISOString();
    const { error } = await supabase.from("subscriptions").insert({
      plan: form.plan,
      status: "active",
      source: "manual",
      payer_name: form.name.trim() || null,
      payer_email: form.email.trim() || null,
      discord: form.discord.trim() || null,
      note: form.note.trim() || null,
      activated_at: paidAt,
      last_payment_at: paidAt,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setForm({ name: "", email: "", discord: "", plan: "founder", paidOn: today, note: "" });
    setError("");
    onAdded();
  }

  return (
    <form onSubmit={submit} className="card mb-6 p-5">
      <h2 className="text-base font-extrabold">Add a student manually</h2>
      <p className="mt-1 text-sm text-text-muted">For people who paid outside the website (e.g. referral deals). PayPal payments show up here on their own.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => set("name")(e.target.value)} /></Field>
        <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email")(e.target.value)} /></Field>
        <Field label="Discord"><input className={inputClass} value={form.discord} onChange={(e) => set("discord")(e.target.value)} /></Field>
        <Field label="Plan">
          <select className={inputClass} value={form.plan} onChange={(e) => set("plan")(e.target.value)}>
            <option value="founder">Founder</option>
            <option value="member">Member</option>
          </select>
        </Field>
        <Field label="Paid on" hint="Covers 1 month from this date.">
          <input type="date" className={inputClass} value={form.paidOn} onChange={(e) => set("paidOn")(e.target.value)} required />
        </Field>
        <Field label="Note"><input className={inputClass} value={form.note} onChange={(e) => set("note")(e.target.value)} /></Field>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button type="submit" className="btn-gold mt-4 !px-5 !py-2.5" disabled={busy}>
        {busy ? "Adding…" : "Add student"}
      </button>
    </form>
  );
}

function EditRow({ row, onDone }: { row: StudentRow; onDone: () => void }) {
  const [discord, setDiscord] = useState(row.discord ?? "");
  const [note, setNote] = useState(row.note ?? "");
  const [name, setName] = useState(row.payer_name ?? "");

  async function save() {
    const { error } = await supabase
      .from("subscriptions")
      .update({ discord: discord.trim() || null, note: note.trim() || null, payer_name: name.trim() || null })
      .eq("id", row.id);
    if (error) return window.alert(error.message);
    onDone();
  }

  return (
    <tr className="bg-navy">
      <td colSpan={7} className="px-4 py-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Discord"><input className={inputClass} value={discord} onChange={(e) => setDiscord(e.target.value)} /></Field>
          <Field label="Note"><input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
        <div className="mt-3 flex gap-2">
          <SmallButton tone="gold" onClick={save}>Save</SmallButton>
          <SmallButton onClick={onDone}>Cancel</SmallButton>
        </div>
      </td>
    </tr>
  );
}

export function Students() {
  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { refresh: refreshCounts } = useMemberCounts();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .neq("status", "pending")
      .order("activated_at", { ascending: false, nullsFirst: false });
    if (error) return setError(error.message);
    setRows(data as StudentRow[]);
    refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    load();
  }, [load]);

  const withPeriods = useMemo(() => (rows ?? []).map((row) => ({ row, period: periodFor(row) })), [rows]);

  const counts = useMemo(
    () => ({
      ok: withPeriods.filter((x) => x.period.state === "ok").length,
      ending_soon: withPeriods.filter((x) => x.period.state === "ending_soon").length,
      ended: withPeriods.filter((x) => x.period.state === "ended").length,
    }),
    [withPeriods],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withPeriods
      .filter((x) => filter === "all" || x.period.state === filter)
      .filter(
        (x) =>
          !q ||
          [x.row.payer_name, x.row.payer_email, x.row.discord, x.row.note].some((v) => v?.toLowerCase().includes(q)),
      )
      // Most urgent first: ended, then ending soon, then by days left.
      .sort((a, b) => a.period.daysLeft - b.period.daysLeft);
  }, [withPeriods, filter, search]);

  async function markPaidToday(row: StudentRow) {
    if (!window.confirm(`Mark ${row.payer_name || row.payer_email || "this student"} as paid today? This starts a new month.`)) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "active", last_payment_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) return window.alert(error.message);
    load();
  }

  async function endSubscription(row: StudentRow) {
    if (!window.confirm(`End ${row.payer_name || row.payer_email || "this student"}'s subscription? They stop counting as a member.`)) return;
    const { error } = await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", row.id);
    if (error) return window.alert(error.message);
    load();
  }

  const FILTERS: { key: Filter; label: string; count?: number; tone?: string }[] = [
    { key: "all", label: "All", count: withPeriods.length },
    { key: "ok", label: "Active", count: counts.ok },
    { key: "ending_soon", label: `Ending soon (≤${ENDING_SOON_DAYS} days)`, count: counts.ending_soon, tone: "text-orange-400" },
    { key: "ended", label: "Ended", count: counts.ended, tone: "text-red-400" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Students"
          description="Everyone who subscribed. Each payment covers 1 month. Orange = ending soon, red = ended."
        />
        <button className="btn-ghost !px-4 !py-2" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "+ Add student"}
        </button>
      </div>

      {showAdd && <AddStudentForm onAdded={() => { setShowAdd(false); load(); }} />}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Active</p>
          <p className="mt-1 text-2xl font-black">{counts.ok}</p>
        </div>
        <div className="card border-orange-500/40 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Ending soon</p>
          <p className="mt-1 text-2xl font-black text-orange-400">{counts.ending_soon}</p>
        </div>
        <div className="card border-red-500/40 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">Ended</p>
          <p className="mt-1 text-2xl font-black text-red-400">{counts.ended}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              filter === f.key ? "border-gold bg-gold/15 text-gold" : `border-navy-border hover:border-text-muted ${f.tone ?? "text-text-muted"}`
            }`}
          >
            {f.label} · {f.count}
          </button>
        ))}
        <input
          className={`${inputClass} ml-auto !w-full sm:!w-64`}
          placeholder="Search name, email, Discord…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="card p-4 text-sm text-red-400">{error}</p>}
      {!rows && !error && <p className="text-sm text-text-muted">Loading students…</p>}
      {rows && visible.length === 0 && (
        <p className="card p-8 text-center text-sm text-text-muted">
          {rows.length === 0 ? "No students yet. They'll appear here as soon as someone pays." : "No students match this filter."}
        </p>
      )}

      {visible.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-navy-border text-xs uppercase tracking-widest text-text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Student</th>
                <th className="px-4 py-3 font-bold">Plan</th>
                <th className="px-4 py-3 font-bold">Subscribed</th>
                <th className="px-4 py-3 font-bold">Last paid</th>
                <th className="px-4 py-3 font-bold">Month ends</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ row, period }) => (
                <FragmentRow
                  key={row.id}
                  row={row}
                  period={period}
                  editing={editing === row.id}
                  onEdit={() => setEditing(editing === row.id ? null : row.id)}
                  onEditDone={() => { setEditing(null); load(); }}
                  onPaid={() => markPaidToday(row)}
                  onEnd={() => endSubscription(row)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentRow({
  row,
  period,
  editing,
  onEdit,
  onEditDone,
  onPaid,
  onEnd,
}: {
  row: StudentRow;
  period: Period;
  editing: boolean;
  onEdit: () => void;
  onEditDone: () => void;
  onPaid: () => void;
  onEnd: () => void;
}) {
  return (
    <>
      <tr className={`border-b border-navy-border/60 align-top ${ROW_TONE[period.state]}`}>
        <td className="px-4 py-3">
          <p className="font-bold text-text">{row.payer_name || row.payer_email || row.discord || "Unknown"}</p>
          {row.payer_email && row.payer_name && <p className="text-xs text-text-muted">{row.payer_email}</p>}
          {row.discord && <p className="text-xs text-text-muted">Discord: {row.discord}</p>}
          {row.note && <p className="mt-1 text-xs italic text-text-muted">{row.note}</p>}
        </td>
        <td className="px-4 py-3">
          <span className={row.plan === "founder" ? "font-bold text-gold" : "text-text"}>
            {row.plan === "founder" ? "Founder" : "Member"}
          </span>
          <p className="text-xs text-text-muted">{row.source === "manual" ? "Added by admin" : "PayPal"}</p>
        </td>
        <td className="px-4 py-3 text-text">{fmtDate(period.subscribedOn)}</td>
        <td className="px-4 py-3 text-text">{fmtDate(period.paidOn)}</td>
        <td className="px-4 py-3">
          <p className="text-text">{fmtDate(period.endsOn)}</p>
          <p className="text-xs"><DaysLeft period={period} /></p>
        </td>
        <td className="px-4 py-3"><StatusChip row={row} /></td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap justify-end gap-1.5">
            <SmallButton onClick={onEdit}>{editing ? "Close" : "Edit"}</SmallButton>
            {row.source === "manual" && (
              <SmallButton tone="gold" onClick={onPaid} title="Start a new month from today">Paid today</SmallButton>
            )}
            {row.status === "active" && row.source === "manual" && (
              <SmallButton tone="danger" onClick={onEnd}>End</SmallButton>
            )}
          </div>
        </td>
      </tr>
      {editing && <EditRow row={row} onDone={onEditDone} />}
    </>
  );
}
