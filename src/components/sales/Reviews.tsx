import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/common/Reveal";
import { METAFY_PROFILE_URL, REVIEWS, type Review } from "@/content/reviews";

function Score() {
  return (
    <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[11px] font-black text-gold">
      10/10
    </span>
  );
}

function Byline({ review }: { review: Review }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-bold text-text">{review.name}</p>
        <p className="text-xs text-text-muted">Verified Metafy review · {review.date}</p>
      </div>
      <Score />
    </div>
  );
}

/**
 * Proof right under the hero: Eixn's public 1-on-1 reviews on Metafy, word for word.
 * Labelled as 1-on-1 reviews on purpose, so nothing is passed off as 6SLOT results.
 */
export function Reviews() {
  const [featured, ...rest] = REVIEWS;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">
            What players say after <span className="text-gold">a session with Eixn</span>
          </h2>
        </Reveal>

        {/* Featured review */}
        <Reveal className="card mx-auto mt-12 max-w-4xl p-6 sm:p-10">
          <span aria-hidden className="block font-display text-6xl leading-none text-gold/70">
            &ldquo;
          </span>
          <blockquote className="-mt-4 text-lg leading-relaxed text-text sm:text-xl">{featured.text}</blockquote>
          <div className="mt-6 border-t border-navy-border pt-5">
            <Byline review={featured} />
          </div>
        </Reveal>

        {/* The rest, masonry-style so short and long reviews sit together without gaps */}
        <div className="mx-auto mt-4 max-w-4xl gap-4 sm:columns-2">
          {rest.map((r, i) => (
            <Reveal key={r.name} delay={(i % 2) * 0.06} className="card mb-4 break-inside-avoid p-6">
              <blockquote className="text-sm leading-relaxed text-text sm:text-base">&ldquo;{r.text}&rdquo;</blockquote>
              <div className="mt-5">
                <Byline review={r} />
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-sm">
          <a
            href={METAFY_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-text underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
          >
            Read every review on Metafy ↗
          </a>
        </p>
      </Container>
    </section>
  );
}
