import { useEffect } from "react";

/** Sets the browser tab title while a page is open (shows in tabs, history and bookmarks). */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · 6SLOT`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
