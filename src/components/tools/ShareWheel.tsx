import { useEffect, useState } from "react";
import { Icon } from "@/components/site/Icons";
import { renderShareCard, renderShareGif, type ShareCardData } from "@/components/tools/shareCard";
import { site } from "@/config/site";

type CopyState = "idle" | "copied" | "failed";

const discordUrl = site.links.socials.find((s) => s.icon === "discord")?.href;
const canCopyImage = typeof window !== "undefined" && "ClipboardItem" in window && !!navigator.clipboard?.write;
/** Phones and tablets: their share sheet includes Discord. On desktop (e.g. Windows) it usually doesn't. */
const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * "Share your build": the still card renders straight away, and the moving GIF (the siege cart
 * rolling, the creep wave running ahead) builds in the background a moment later, so the
 * preview animates and the GIF is ready the moment they want it.
 * PC: Download GIF → drag into Discord, or Copy image → Ctrl+V. Phone: Share GIF.
 */
export function ShareWheel({ data }: { data: Omit<ShareCardData, "url"> }) {
  const [png, setPng] = useState<{ blob: Blob; url: string } | null>(null);
  const [gif, setGif] = useState<{ blob: Blob; url: string } | null>(null);
  const [copy, setCopy] = useState<CopyState>("idle");
  const { name, slotNames, slots, total, weakestIndex } = data;

  useEffect(() => {
    const card = { name, slotNames, slots, total, weakestIndex, url: `${window.location.host}/how-built-are-you` };
    const urls: string[] = [];
    let cancelled = false;
    setPng(null);
    setGif(null);

    renderShareCard(card)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        setPng({ blob, url });
      })
      .catch(() => {});

    // Let the result reveal play first, then build the GIF (under a second of work).
    const timer = window.setTimeout(() => {
      renderShareGif(card)
        .then((blob) => {
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          setGif({ blob, url });
        })
        .catch(() => {});
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [name, slotNames, slots, total, weakestIndex]);

  async function copyImage() {
    if (!png) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png.blob })]);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  }

  async function shareGif() {
    if (!gif) return;
    const file = new File([gif.blob], "my-6slot-build.gif", { type: "image/gif" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `My 6SLOT build: ${total}/60. How built are you?` });
        return;
      } catch {
        return; // closed the share sheet
      }
    }
    downloadUrl(gif.url, "my-6slot-build.gif");
  }

  const preview = gif?.url ?? png?.url;

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[240px_1fr] sm:gap-8">
      <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-control border border-navy-border bg-navy">
        {preview ? (
          <img src={preview} alt="Your shareable 6SLOT build card" className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse bg-navy-raised" />
        )}
        {gif && (
          <span className="absolute bottom-2 right-2 rounded-full bg-navy/85 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-gold">
            GIF
          </span>
        )}
      </div>

      <div className="text-left">
        <h3 className="text-xl font-extrabold sm:text-2xl">Post your build in Discord</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Show where you stand, see where your friends stand, and post again next month when your wheel is rounder.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {isTouch ? (
            <button className="btn-gold px-6 py-3" onClick={shareGif} disabled={!gif}>
              {gif ? "Share GIF" : "Preparing your GIF…"}
            </button>
          ) : (
            <button className="btn-gold px-6 py-3" onClick={() => gif && downloadUrl(gif.url, "my-6slot-build.gif")} disabled={!gif}>
              {gif ? "Download GIF" : "Preparing your GIF…"}
            </button>
          )}
          {!isTouch && canCopyImage ? (
            <button className="btn-ghost px-6 py-3" onClick={copyImage} disabled={!png}>
              {copy === "copied" ? "Copied" : "Copy image"}
            </button>
          ) : (
            <button className="btn-ghost px-6 py-3" onClick={() => png && downloadUrl(png.url, "my-6slot-build.png")} disabled={!png}>
              Save image
            </button>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-text-muted" aria-live="polite">
          {copy === "copied" ? (
            <>
              Image copied. Paste it in any Discord channel with <strong className="text-text">Ctrl + V</strong>.
            </>
          ) : copy === "failed" ? (
            "Your browser blocked copying. Use Download GIF instead."
          ) : isTouch ? (
            "Share the GIF to Discord and your cart rolls right there in the chat."
          ) : (
            "Download the GIF and drag it into any Discord channel. Your cart rolls right there in the chat."
          )}
        </p>

        {discordUrl && (
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-text underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
          >
            Open the 6SLOT Discord
            <Icon name="arrow" className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
