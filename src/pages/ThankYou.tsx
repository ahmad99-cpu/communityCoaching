import { usePageTitle } from "@/lib/usePageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/site/Icons";
import { site } from "@/config/site";
import { useMemberCounts } from "@/lib/memberCounts";
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl, type CalendarEvent } from "@/lib/calendar";
import { countdownParts, formatSessionLocal, SESSION_LENGTH, useNextSession } from "@/lib/sessionTime";

type Step = { title: string; note: string; button: string } & ({ href: string } | { to: string });

const STEPS: Step[] = [
  {
    title: "Join the 6SLOT Discord",
    note: "Do this first, so your role can be added.",
    button: "Join Discord",
    href: site.links.discordInvite,
  },
  {
    title: "Fill the onboarding form",
    note: "2 minutes. Use the same email you paid with on PayPal.",
    button: "Open the form",
    href: site.links.onboardingForm,
  },
  {
    title: "Find your weakest slot",
    note: "Take the 2-minute test, then share your wheel in #introductions with the rank you're chasing.",
    button: "Take the test",
    to: "/how-built-are-you",
  },
];

/** Keeps the page out of search results (it's only for buyers PayPal sends back here). */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

function StepButton({ step, primary }: { step: Step; primary: boolean }) {
  const cls = `${primary ? "btn-gold" : "btn-ghost"} mt-3 w-full py-2.5 sm:w-auto sm:px-5`;
  if ("to" in step) {
    return (
      <Link to={step.to} className={cls}>
        {step.button}
      </Link>
    );
  }
  // A link not filled in yet (src/config/site.ts) shows as a disabled button instead of a dead link.
  if (!step.href) {
    return (
      <button type="button" disabled className={`${cls} cursor-not-allowed opacity-50`}>
        {step.button}
      </button>
    );
  }
  return (
    <a href={step.href} target="_blank" rel="noopener noreferrer" data-umami-event={`Thank-you: ${step.button}`} className={cls}>
      {step.button}
    </a>
  );
}

/** Eixn's welcome video (site.links.welcomeVideo). YouTube loads only on click, to keep the page fast. */
function WelcomeVideo() {
  const [playing, setPlaying] = useState(false);
  const url: string = site.links.welcomeVideo;
  if (!url) return null;

  const youtubeId = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
  const frame = "relative mt-8 aspect-video overflow-hidden rounded-card border border-gold/40 bg-navy shadow-[0_0_40px_-12px_rgba(232,181,74,0.45)]";

  if (!youtubeId) {
    return (
      <div className={frame}>
        <video src={url} controls preload="metadata" playsInline className="h-full w-full" />
      </div>
    );
  }
  return (
    <div className={frame}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title="A welcome message from Eixn"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label="Play the welcome message from Eixn">
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy shadow-lg transition group-hover:scale-105">
              <Icon name="play" className="ml-1 h-7 w-7" />
            </span>
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-bold text-text">
            A welcome message from Eixn
          </span>
        </button>
      )}
    </div>
  );
}

/** First session: the time in the visitor's own timezone, a countdown, and add-to-calendar. */
function FirstSession() {
  const { start, topic, live, msUntil } = useNextSession();
  const { day, time } = formatSessionLocal(start);
  const { d, h, m } = countdownParts(msUntil);
  const event: CalendarEvent = {
    title: "6SLOT live session",
    details: `Weekly 6SLOT group coaching with Eixn, live on Discord.${topic ? ` This week: ${topic}.` : ""} ${site.links.discordInvite}`,
    location: "Discord",
    start,
    end: new Date(start.getTime() + SESSION_LENGTH),
    weekly: true,
  };
  const calBtn =
    "rounded-control border border-navy-border px-2 py-2 text-center text-sm font-semibold text-text transition hover:border-gold/60 hover:text-gold";

  return (
    <div className="card mt-4 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-gold ring-1 ring-navy-border">
          <Icon name="calendar" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-muted">Your first live session</p>
          <p className="mt-0.5 font-extrabold text-text">
            {day} · {time}
          </p>
          <p className="mt-0.5 text-sm text-text-muted">
            {live ? <strong className="text-gold">Live now</strong> : <>Starts in {d}d {h}h {m}m, on Discord</>}
          </p>
          <p className="mt-3 text-xs text-text-muted">Add to calendar (repeats weekly)</p>
          <div className="mt-1.5 grid max-w-xs grid-cols-3 gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={calBtn}>
              Google
            </a>
            <button type="button" onClick={() => downloadIcs(event)} className={calBtn}>
              Apple
            </button>
            <a href={outlookCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={calBtn}>
              Outlook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Referral ask at peak excitement: one line of offer and a ready-made message to copy. */
function BringYourStack() {
  const [copied, setCopied] = useState(false);
  const message = `I just joined 6SLOT, Dota 2 group coaching with Eixn. Members can bring a friend to a live session for free. Come with me: ${window.location.origin}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card mt-4 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-gold ring-1 ring-navy-border">
          <Icon name="users" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-text">Bring your stack</p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">
            Bring a friend to a live session once a month, free. If they join, your next month is on us.
          </p>
          <button type="button" onClick={copy} data-umami-event="Copy invite message" className="btn-ghost mt-3 w-full py-2.5 sm:w-auto sm:px-5">
            {copied ? "Copied. Send it to your friends" : "Copy an invite message"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Post-payment page. PayPal Auto Return sends buyers here. Not linked anywhere on the site.
 * PayPal requires it to confirm the payment and mention the emailed receipt. The rest turns the
 * buyer's excitement into showing up (calendar, timeline), commitment (public goal) and referrals.
 */
export function ThankYou() {
  usePageTitle("You're in");
  useNoIndex();
  // The first 25 buyers are founders; everyone after is a member.
  const { foundersSoldOut } = useMemberCounts();
  const role = foundersSoldOut ? "member" : "Founder";

  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-gold/10 text-gold">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-gold">
            {foundersSoldOut ? "Welcome to 6SLOT" : "Welcome to the founding 25"}
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
            Payment complete. <span className="text-gold">You're in.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-text-muted">
            Your transaction went through and your PayPal receipt has been emailed to you.
          </p>
        </div>

        <WelcomeVideo />

        <h2 className="mt-10 text-sm font-black uppercase tracking-[0.2em] text-text-muted">Do these now</h2>
        <ol className="card mt-3 divide-y divide-navy-border">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 p-5 sm:p-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gold text-sm font-black text-gold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-text">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{s.note}</p>
                <StepButton step={s} primary={i === 0} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-center gap-2 px-1 text-sm text-text-muted">
          <Icon name="clock" className="h-4 w-4 text-gold" />
          Eixn adds your {role} role within 24 hours of your form.
        </p>

        <FirstSession />
        <BringYourStack />

        <p className="mt-10 flex items-start justify-center gap-2 text-center text-sm text-text-muted">
          <Icon name="shield" className="mt-0.5 h-4 w-4 text-gold" />
          <span>
            Not for you after your first session? Get your money back, no questions asked.{" "}
            <Link to="/policies/refund" className="-my-2.5 inline-block py-2.5 underline underline-offset-2 hover:text-text">
              Terms
            </Link>
          </span>
        </p>
      </Container>
    </section>
  );
}
