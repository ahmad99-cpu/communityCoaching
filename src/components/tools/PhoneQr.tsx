import { useEffect, useState } from "react";

/**
 * "Use it on your phone": a QR code of the page the player is on (with their draft), so they can scan
 * it with the phone camera and keep the tool beside the keyboard while Dota stays full screen.
 *
 * The code is drawn here, in the page (qrcode-generator, loaded only when the panel opens): the link
 * never goes to an outside QR service.
 */
export function PhoneQr({
  hint,
  version,
}: {
  hint?: React.ReactNode;
  /** Changes whenever the page updates its address (e.g. a hero picked), so the code follows along. */
  version?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cells, setCells] = useState<boolean[][] | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    let live = true;
    // Next tick: the page writes the new address in its own effect, which runs after this one.
    const t = setTimeout(async () => {
      // The address bar has the current draft, so the phone opens the same setup.
      const link = window.location.href;
      const { default: qrcode } = await import("qrcode-generator");
      if (!live) return;
      setUrl(link);
      const qr = qrcode(0, "M");
      qr.addData(link);
      qr.make();
      const n = qr.getModuleCount();
      setCells(Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c))));
    }, 0);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [open, version]);

  return (
    // Computers only: on a phone the tool is already there.
    <div className="hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:underline"
      >
        <PhoneIcon />
        {open ? "Hide the phone code" : "Drafting in Dota? Use it on your phone"}
      </button>

      {open && (
        <div className="mx-auto mt-3 flex max-w-xl items-center gap-5 rounded-card border border-gold/30 bg-navy-raised/80 p-4 text-left">
          <div className="shrink-0 rounded-md bg-white p-2" aria-label="QR code for this page">
            {cells ? (
              <svg viewBox={`0 0 ${cells.length} ${cells.length}`} width={132} height={132} shapeRendering="crispEdges" role="img">
                <title>Scan to open this page on your phone</title>
                {cells.map((row, r) =>
                  row.map((dark, c) => (dark ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0B1220" /> : null)),
                )}
              </svg>
            ) : (
              <div className="h-[132px] w-[132px] animate-pulse rounded bg-navy-border/40" />
            )}
          </div>
          <div className="min-w-0 text-sm text-text-muted">
            <p className="font-extrabold text-text">Scan with your phone camera</p>
            <p className="mt-1">
              It opens this page on your phone, with your draft. Keep Dota full screen and pick from the phone, no
              alt-tab.
            </p>
            {hint && <p className="mt-2">{hint}</p>}
            <p className="mt-2 truncate text-[11px] text-text-muted/80" title={url}>
              {url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}
