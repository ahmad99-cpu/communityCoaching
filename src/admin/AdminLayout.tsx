import { useEffect, useState, type FormEvent } from "react";
import { ADMIN_BASE } from "@/admin/basePath";
import { Link, NavLink, Outlet } from "react-router-dom";
import { signIn, signOut, useAdmin } from "@/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

const NAV = [
  { to: ADMIN_BASE, label: "Students", icon: "👥", end: true },
  { to: `${ADMIN_BASE}/next-session`, label: "Next session", icon: "🗓️" },
  { to: `${ADMIN_BASE}/giveaway`, label: "Giveaway", icon: "🎁" },
  { to: `${ADMIN_BASE}/pricing`, label: "Price cards", icon: "💳" },
  { to: `${ADMIN_BASE}/faq`, label: "Q&A", icon: "❓" },
  { to: `${ADMIN_BASE}/wheel-test`, label: "How Built Are You?", icon: "⬡" },
];

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4 py-12">{children}</div>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Centered>
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <img src="/6slot-logo-wordmark-transparent.svg" alt="6SLOT" className="h-8 w-auto" />
        <h1 className="mt-6 text-xl font-extrabold">Admin sign in</h1>
        <div className="mt-6 space-y-3">
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-control border border-navy-border bg-navy px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-control border border-navy-border bg-navy px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-gold mt-5 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Centered>
  );
}

/**
 * Admin dashboard shell: sign-in gate + sidebar. Not linked from the public site;
 * open it at /adminDashboard (ADMIN_BASE). Kept out of search engines with a noindex tag.
 */
export function AdminLayout() {
  const admin = useAdmin();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "6SLOT Admin";
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl font-extrabold">Dashboard not connected</h1>
          <p className="mt-3 text-sm text-text-muted">
            Fill in the Supabase values in <code>.env</code> and run <code>supabase/admin.sql</code> (see README).
          </p>
        </div>
      </Centered>
    );
  }

  if (admin.status === "loading") {
    return (
      <Centered>
        <p className="text-sm text-text-muted">Loading…</p>
      </Centered>
    );
  }

  if (admin.status === "signed_out") return <LoginForm />;

  if (admin.status === "not_admin") {
    return (
      <Centered>
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl font-extrabold">No admin access</h1>
          <p className="mt-3 text-sm text-text-muted">
            {admin.email} is signed in but isn't on the admin list.
          </p>
          <button className="btn-ghost mt-6" onClick={signOut}>
            Sign out
          </button>
        </div>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-navy-border bg-navy-raised/60 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link to="/" title="View the site">
            <img src="/6slot-logo-wordmark-transparent.svg" alt="6SLOT" className="h-7 w-auto" />
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted lg:mt-2">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-control px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-gold/15 text-gold" : "text-text-muted hover:bg-navy hover:text-text"
                }`
              }
            >
              <span aria-hidden className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 py-4 text-xs text-text-muted lg:absolute lg:bottom-0 lg:block">
          <p className="truncate">{admin.session.user.email}</p>
          <button className="mt-2 font-semibold text-text hover:text-gold" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-4 flex justify-end lg:hidden">
          <button className="text-xs font-semibold text-text-muted hover:text-text" onClick={signOut}>
            Sign out ({admin.session.user.email})
          </button>
        </div>
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
