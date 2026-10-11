import { WideContainer } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { METAFY_PROFILE_URL, REVIEWS, type Review } from "@/content/reviews";

function Score() {
  return (
    <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[11px] font-black text-gold">
      10/10
    </span>
  );
}

/** Highlight line, always starting with a capital letter. */
const pull = (h: string) => h.charAt(0).toUpperCase() + h.slice(1);

/** Initials in a gold ring: an honest stand-in for a photo (Metafy reviews don't include one). */
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-navy text-sm font-black text-gold"
    >
      {initials}
    </span>
  );
}

function Byline({ review }: { review: Review }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={review.name} />
        <div className="min-w-0">
          <p className="truncate font-bold text-text">{review.name}</p>
          <p className="text-xs text-text-muted">Verified Metafy review · {review.date}</p>
        </div>
      </div>
      <Score />
    </div>
  );
}

/**
 * Proof right under the hero: Eixn's public 1-on-1 reviews on Metafy, word for word.
 * Same wide layout as the hero, as a bento grid: the featured review spans two columns and
 * the rest fill the rows exactly, so nothing is left empty. Labelled as 1-on-1 reviews on purpose, so nothing is
 * passed off as 6SLOT results.
 */
export function Reviews() {
  const [featured, ...rest] = REVIEWS;

  // 2 columns on tablets: the featured review spans both, so an odd remainder leaves the last card alone; let it span too.
  const lastSpansOnTablet = rest.length % 2 === 1;

  return (
    <section className="py-20 sm:py-24">
      <WideContainer>
        {/* Title across the top, link to every review on the right */}
        <Reveal className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">What players say after a session with Eixn</p>
            <h2 className="section-heading mt-3">
              Real players. <span className="text-gold">Real progress.</span>
            </h2>
          </div>
          <a
            href={METAFY_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="-my-2.5 inline-block shrink-0 py-2.5 text-sm font-bold text-text underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
          >
            Read every review on Metafy ↗
          </a>
        </Reveal>

        {/* Bento grid: featured review spans 2 of 3 columns, the rest fill the rows exactly (1 + 3 + 3). */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="card flex h-full flex-col border-gold/40 p-6 sm:col-span-2 sm:p-8">
            <p className="text-2xl font-extrabold leading-snug text-text sm:text-3xl">{pull(featured.headline)}</p>
            <blockquote className="mt-3 leading-relaxed text-text-muted">&ldquo;{featured.text}&rdquo;</blockquote>
            <div className="mt-auto border-t border-navy-border pt-5">
              <Byline review={featured} />
            </div>
          </Reveal>

          {rest.map((r, i) => (
            <Reveal
              key={r.name}
              delay={(i % 3) * 0.06}
              className={`card flex h-full flex-col p-6 ${lastSpansOnTablet && i === rest.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <p className="text-lg font-extrabold leading-snug text-text">{pull(r.headline)}</p>
              <blockquote className="mt-2 text-sm leading-relaxed text-text-muted">&ldquo;{r.text}&rdquo;</blockquote>
              <div className="mt-auto pt-5">
                <Byline review={r} />
              </div>
            </Reveal>
          ))}
        </div>
      </WideContainer>
    </section>
  );
}
