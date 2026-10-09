import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { GiveawayCard } from "./GiveawayCard";

// Official Dota 2 trailer used as the intro video — verified via YouTube's
// oEmbed API (author_name: "dota2", the official Dota 2 channel), not a fan
// upload. "The International Returns" was chosen as a TI moment rather than
// the base game trailer. Swap the ID here if a different clip is preferred.
const TRAILER_VIDEO_ID = "C_Ci07NwOyc";
const BG_PLAYER_ID = "hero-trailer-bg-player";

// Minimal shape of the YouTube IFrame Player API we actually use. We build
// the player entirely through the JS API (videoId + playerVars) rather than
// a hand-written iframe src — that's what actually gets controls=0 to stick.
// Two earlier attempts still showed player chrome: (1) the src `loop=1&
// playlist=<id>` trick makes YouTube treat a single video as a "playlist"
// and draw its previous/pause/next scrub overlay regardless of controls=0;
// (2) handing an *existing* custom iframe to `new YT.Player(existingIframe)`
// lets the API silently re-normalize it and drop params like mute, leaving
// autoplay blocked and the paused/play button showing. Letting YT.Player
// create the iframe itself from playerVars avoids both.
interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  mute: () => void;
}
interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}
interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      width?: string | number;
      height?: string | number;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

// The video itself costs us nothing — it streams from YouTube's own CDN via
// the iframe embed, not our hosting — but it does cost the *visitor* real
// mobile data to load YouTube's player + stream. Given a lot of the
// community will be on mobile data, only autoplay it on larger screens with
// a normal connection; everyone else gets the static thumbnail (already
// loading anyway as the fallback) with a light CSS-only zoom instead.
function useCanAutoplayVideo() {
  const [canAutoplay, setCanAutoplay] = useState(false);

  useEffect(() => {
    const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveData = nav.connection?.saveData === true;
    setCanAutoplay(isLargeScreen && !prefersReducedMotion && !saveData);
  }, []);

  return canAutoplay;
}

// Loads the YouTube IFrame API once, builds the background player from
// scratch (videoId + playerVars — see the interface comment above for why),
// and restarts the clip on `ended` so it loops without ever touching the
// playlist param.
function useBackgroundPlayer(elementId: string, videoId: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    function createPlayer() {
      if (cancelled || !window.YT || !document.getElementById(elementId)) return;
      new window.YT.Player(elementId, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      createPlayer();
    };

    return () => {
      cancelled = true;
    };
  }, [elementId, videoId, enabled]);
}

export function CinematicHero() {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const [videoOpen, setVideoOpen] = useState(false);
  const canAutoplayVideo = useCanAutoplayVideo();
  useBackgroundPlayer(BG_PLAYER_ID, TRAILER_VIDEO_ID, canAutoplayVideo);

  return (
    <section className="relative min-h-[620px] overflow-hidden border-b border-ink-border lg:min-h-[720px]">
      {/* True autoplaying video background — muted/looped YouTube embed, sized
          via the "scale to cover" trick (177.78vh / 56.25vw at 16:9) so it
          always fills the section regardless of viewport ratio. Only loaded
          on desktop/normal-connection visitors (see useCanAutoplayVideo);
          the static thumbnail is always shown underneath, both as an instant
          paint and as the whole background on mobile/data-saver. Clicking
          "watch trailer" opens the same video, unmuted, in TrailerModal
          below, regardless of whether the background video is loaded. */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={`https://i.ytimg.com/vi/${TRAILER_VIDEO_ID}/maxresdefault.jpg`}
          alt=""
          className={"h-full w-full object-cover" + (canAutoplayVideo ? "" : " animate-kenburns")}
        />
        {canAutoplayVideo && (
          // Wrapper owns the "scale to cover" sizing/positioning and blocks
          // all pointer events; the inner div is just a mount point that
          // YT.Player replaces with its own iframe (sized 100% of this
          // wrapper via the width/height constructor options below), so our
          // layout classes never depend on whatever attributes YouTube
          // assigns to the iframe it generates.
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2">
            <div id={BG_PLAYER_ID} className="h-full w-full" />
          </div>
        )}
        {/* Lighter than before, on purpose — the video is the point, these
            just keep the text/card legible without flattening it into a
            dark slab. Left-to-right gradient carries the contrast for the
            text at the start edge and fades to nothing by the far end. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
      </div>

      {/* Full-bleed content row — text pinned to the start edge, giveaway
          card pinned to the far end edge (mirrors automatically under
          dir="rtl" since flex/justify-between operate on the logical
          start/end axis, not literal left/right). */}
      <div className="relative flex flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-16 lg:py-24 xl:px-24">
        <div className="max-w-xl">
          {/* Quote-style introduction (SPEC.md §3.1: Eixn-forward). */}
          <motion.div initial="hidden" animate="show">
            <motion.span
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-paper-muted backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-aegis" />
              {t("home.hero.eyebrow")}
            </motion.span>

            <motion.blockquote
              custom={1}
              variants={fadeUp}
              className="mt-5 text-3xl font-bold italic leading-snug text-paper sm:text-4xl lg:text-5xl"
            >
              <span className="text-crimson not-italic">&ldquo;</span>
              {t("home.hero.quote")}
              <span className="text-crimson not-italic">&rdquo;</span>
            </motion.blockquote>

            <motion.p
              custom={1.6}
              variants={fadeUp}
              className="mt-4 text-sm font-semibold uppercase tracking-wide text-aegis"
            >
              — {t("home.hero.titleAccent")}
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-4 max-w-xl text-base text-paper-muted sm:text-lg"
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={`/${lang}/pricing`}
                  className="inline-block rounded-control bg-crimson px-5 py-2.5 text-sm font-semibold text-paper shadow-lg shadow-crimson/20 transition-colors hover:bg-crimson-light"
                >
                  {t("home.hero.ctaPrimary")}
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={`/${lang}/coaches`}
                  className="inline-block rounded-control border border-ink-border bg-ink/50 px-5 py-2.5 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-ink-raised"
                >
                  {t("home.hero.ctaSecondary")}
                </Link>
              </motion.div>

              <motion.button
                type="button"
                onClick={() => setVideoOpen(true)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="group flex items-center gap-3 text-sm font-semibold text-paper-muted transition-colors hover:text-paper"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-aegis/60 bg-ink/60 backdrop-blur">
                  <span className="absolute inset-0 rounded-full border border-aegis/60 animate-pulse-ring" />
                  <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-[1px] fill-aegis">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {t("home.hero.watchTrailer")}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Giveaway — pinned to the far end edge, carousels itself when
            there's more than one prize (SPEC.md §2/§5.3: giveaways as a
            Member/Pro subscriber perk). */}
        <div className="w-full max-w-sm lg:shrink-0">
          <GiveawayCard />
        </div>
      </div>

      <AnimatePresence>
        {videoOpen && <TrailerModal onClose={() => setVideoOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function TrailerModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="aspect-video w-full max-w-4xl overflow-hidden rounded-card border border-ink-border shadow-2xl"
      >
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${TRAILER_VIDEO_ID}?autoplay=1`}
          title="Dota 2 — The International Returns"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-ink-border bg-ink/80 text-paper transition-colors hover:bg-ink-raised"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
