/**
 * Scrolls to the membership card (id="join"), lined up just below the sticky header, so the
 * price and the button are fully in view. Falls back to the pricing section. Returns false when
 * neither is on the page (e.g. on another route), so the caller can navigate instead.
 */
export function scrollToJoin() {
  const target = document.getElementById("join") ?? document.getElementById("pricing");
  if (!target) return false;
  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  return true;
}
