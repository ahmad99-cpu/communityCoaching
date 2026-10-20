import { useEffect, useState } from "react";
import { site } from "@/config/site";

/**
 * "This browser belongs to a member", without accounts: saved on the device right after a
 * successful subscription (or when someone taps "hide checkout on this device"). The site then shows the
 * Discord instead of the checkout, so members don't subscribe twice by mistake. It's a convenience,
 * not a login: another device won't know, so the checkout also says "already a member? no need to
 * pay again".
 */
export interface Membership {
  plan: "founder" | "member";
  /** ISO date the device was marked. */
  since: string;
}

const KEY = "6slot.member";
const EVENT = "6slot:membership";

function read(): Membership | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Membership) : null;
  } catch {
    return null;
  }
}

function write(value: Membership | null) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the checkout just stays visible.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function rememberMembership(plan: Membership["plan"]) {
  write({ plan, since: new Date().toISOString() });
}

export function forgetMembership() {
  write(null);
}

/** The Discord channel a member lands in: founders their lounge, members the members chat. */
export function memberChannel(member: Membership) {
  return member.plan === "founder" ? site.links.foundersLounge : site.links.membersChat;
}

/** The saved membership for this device, kept in sync across the page and other tabs. */
export function useMembership() {
  const [member, setMember] = useState<Membership | null>(read);
  useEffect(() => {
    const sync = () => setMember(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return member;
}
