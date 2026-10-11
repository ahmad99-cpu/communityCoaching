import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { NextSessionBar } from "@/components/site/NextSessionBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { scrollToJoin } from "@/lib/scrollToJoin";

/** Scrolls to `#hash` targets (e.g. the Join button → /#pricing), otherwise to the top on page change. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section exists after a route change.
      const id = requestAnimationFrame(() => {
        if (hash === "#pricing") scrollToJoin();
        else document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <NextSessionBar />
      <SiteHeader />
      <main className="flex-1">
        {/* Lazy pages (App.tsx) load inside the layout, so the header and footer never flash. */}
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
