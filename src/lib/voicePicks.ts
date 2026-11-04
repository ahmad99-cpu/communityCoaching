/**
 * Voice picks for the Counter Picker: say "Anti-Mage, Pudge, Lina" and get those heroes.
 *
 * Speech is turned into text by the browser's own speech recognition (Chrome and Edge send the audio
 * to Google, Safari to Apple; we never see or keep it). This file only does two things with the text:
 *   - matchHeroes(): finds the heroes in it, with Dota nicknames ("AM", "WK", "Jugg") and a little
 *     forgiveness for misheard names ("lena" -> Lina)
 *   - useVoicePicks(): a tap-to-talk hook that listens once and hands back what it heard
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceHero {
  id: number;
  name: string;
}

/**
 * Nicknames players say, by hero name. Short ones (two letters) work because the speech engine often
 * writes them as letters ("W K", "a.m."), which are joined back together before matching.
 */
const NICKNAMES: Record<string, string[]> = {
  Abaddon: ["aba", "abba"],
  Alchemist: ["alch", "alchy"],
  "Ancient Apparition": ["aa", "apparition"],
  "Anti-Mage": ["am", "antimage", "anti mage", "auntie mage"],
  "Arc Warden": ["arc", "zet"],
  Axe: ["ax", "acts"],
  Beastmaster: ["bm", "beast", "beast master"],
  Bloodseeker: ["bs", "blood", "blood seeker"],
  "Bounty Hunter": ["bh", "bounty", "gondar"],
  Brewmaster: ["brew", "panda", "brew master"],
  Bristleback: ["bristle", "bb"],
  Broodmother: ["brood", "brood mother", "spider"],
  "Centaur Warrunner": ["centaur", "cent"],
  "Chaos Knight": ["ck", "chaos"],
  Clinkz: ["clinks", "clink", "bone"],
  Clockwerk: ["clock", "clockwork"],
  "Crystal Maiden": ["cm", "maiden", "crystal"],
  "Dark Seer": ["ds", "seer"],
  "Dark Willow": ["dw", "willow"],
  Dawnbreaker: ["dawn", "dawn breaker"],
  "Death Prophet": ["dp", "krobelus"],
  Disruptor: ["disrupter", "disrupt"],
  "Dragon Knight": ["dk", "dragon"],
  "Drow Ranger": ["drow", "traxex"],
  "Earth Spirit": ["earth"],
  Earthshaker: ["es", "shaker", "earth shaker"],
  "Elder Titan": ["et", "titan"],
  "Ember Spirit": ["ember"],
  Enchantress: ["ench", "enchant"],
  "Faceless Void": ["void", "fv", "faceless"],
  Grimstroke: ["grim", "grim stroke"],
  Gyrocopter: ["gyro"],
  Hoodwink: ["hood", "hood wink"],
  Huskar: ["husk", "husker"],
  Invoker: ["voker", "invo", "invoke"],
  Io: ["wisp", "eye oh", "i o", "aio"],
  Jakiro: ["jak", "thd", "jakira"],
  Juggernaut: ["jugg", "jug", "jugger", "jugger not"],
  "Keeper of the Light": ["kotl", "keeper", "kottle"],
  Kunkka: ["kunka", "conka", "admiral"],
  "Legion Commander": ["lc", "legion"],
  Leshrac: ["lesh", "leshrack"],
  Lich: ["lick", "leech", "lych"],
  Lifestealer: ["naix", "ls", "life stealer"],
  Lina: ["lena", "leena", "lina inverse"],
  Lion: ["lyon"],
  "Lone Druid": ["ld", "druid", "lone"],
  Lycan: ["lycon", "like an"],
  Magnus: ["mag", "magnet"],
  Medusa: ["dusa"],
  Mirana: ["pom", "potm", "mirena"],
  "Monkey King": ["mk", "monkey"],
  Morphling: ["morph"],
  "Naga Siren": ["naga", "siren"],
  "Nature's Prophet": ["np", "furion", "prophet", "natures prophet"],
  Necrophos: ["necro", "necrolyte"],
  "Night Stalker": ["ns", "stalker", "balanar"],
  "Nyx Assassin": ["nyx", "nix", "nicks"],
  "Ogre Magi": ["ogre"],
  Omniknight: ["omni", "omni knight"],
  "Outworld Devourer": ["od", "outworld", "outworld destroyer"],
  Pangolier: ["pango", "pangolin"],
  "Phantom Assassin": ["pa", "mortred"],
  "Phantom Lancer": ["pl", "lancer"],
  "Primal Beast": ["pb", "primal"],
  "Queen of Pain": ["qop", "queen", "akasha"],
  "Ring Master": ["ringmaster", "ring"],
  "Sand King": ["sk", "sandking"],
  "Shadow Demon": ["sd", "demon"],
  "Shadow Fiend": ["sf", "fiend", "nevermore"],
  "Shadow Shaman": ["rhasta", "shaman", "rasta"],
  "Skywrath Mage": ["sky", "skywrath", "sky wrath"],
  Snapfire: ["snap", "snap fire"],
  Spectre: ["spec", "specter", "spectra"],
  "Spirit Breaker": ["bara", "sb", "barathrum"],
  "Storm Spirit": ["storm"],
  Techies: ["techy", "tekkies"],
  "Templar Assassin": ["ta", "templar", "lanaya"],
  Terrorblade: ["tb", "terror blade"],
  Tidehunter: ["tide", "tide hunter"],
  Timbersaw: ["timber", "timber saw"],
  "Treant Protector": ["treant", "tree", "treent"],
  "Troll Warlord": ["troll"],
  Underlord: ["pit lord", "under lord", "pitlord"],
  Undying: ["dirge"],
  "Vengeful Spirit": ["venge", "vs", "vengeful"],
  Venomancer: ["veno", "venno"],
  Warlock: ["lock"],
  Weaver: ["weave"],
  Windranger: ["wr", "windrunner", "wind ranger", "windy"],
  "Winter Wyvern": ["ww", "wyvern", "winter"],
  "Witch Doctor": ["wd", "witch"],
  "Wraith King": ["wk", "wraith", "skeleton king"],
  Zeus: ["zoose"],
};

/** Words people say between hero names, never part of one. */
const FILLER = new Set([
  "and", "the", "a", "an", "then", "plus", "also", "with", "enemy", "enemies", "they", "theyve", "have", "has",
  "got", "picked", "pick", "picks", "is", "are", "team", "um", "uh", "okay", "ok", "so", "their", "our", "we",
]);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The words, with "a.m." split into letters. Speech engines write nicknames as letters ("w k"); they
 * aren't joined here, because parse() tries groups of words anyway ("w" + "k" = "wk").
 */
const words = (text: string) => norm(text.replace(/\./g, " ")).split(" ").filter(Boolean);

function distance(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/** Every way a hero can be said, squashed without spaces ("antimage", "am", "naturesprophet"). */
function keysFor(heroes: VoiceHero[]): Map<string, number> {
  const keys = new Map<string, number>();
  for (const h of heroes) {
    const forms = [h.name, ...(NICKNAMES[h.name] ?? [])];
    for (const f of forms) {
      const k = norm(f).replace(/ /g, "");
      if (k && !keys.has(k)) keys.set(k, h.id);
    }
  }
  return keys;
}

/** The longest hero name in words ("Keeper of the Light"). */
const MAX_WORDS = 4;

/** A hero starting at word i: an exact name or nickname first (longest first), then a near miss. */
function heroAt(ws: string[], i: number, keys: Map<string, number>): { id: number; len: number } | null {
  const most = Math.min(MAX_WORDS, ws.length - i);
  for (let len = most; len >= 1; len--) {
    const id = keys.get(ws.slice(i, i + len).join(""));
    if (id !== undefined) return { id, len };
  }
  // Small slips ("kunka", "rubik") only for names of 5+ letters, so short words don't turn into heroes.
  for (let len = most; len >= 1; len--) {
    const key = ws.slice(i, i + len).join("");
    if (key.length < 5) continue;
    const allowed = key.length >= 9 ? 2 : 1;
    let best: { id: number; cost: number } | null = null;
    for (const [k, id] of keys) {
      if (Math.abs(k.length - key.length) > allowed) continue;
      const cost = distance(key, k);
      if (cost <= allowed && (!best || cost < best.cost)) best = { id, cost };
    }
    if (best) return { id: best.id, len };
  }
  return null;
}

/**
 * The heroes in one transcript, in the order they were said, read left to right. Returns the words it
 * couldn't place too, so the page can say "didn't catch ...".
 */
function parse(text: string, keys: Map<string, number>): { ids: number[]; missed: string[] } {
  const ws = words(text);
  const ids: number[] = [];
  const missed: string[] = [];
  let i = 0;
  while (i < ws.length) {
    const found = heroAt(ws, i, keys);
    if (found) {
      if (!ids.includes(found.id)) ids.push(found.id);
      i += found.len;
      continue;
    }
    if (!FILLER.has(ws[i])) missed.push(ws[i]);
    i++;
  }
  return { ids, missed };
}

/** Best reading across the speech engine's alternatives: the most heroes, then the fewest leftovers. */
export function matchHeroes(transcripts: string[], heroes: VoiceHero[]): { ids: number[]; missed: string[]; heard: string } {
  const keys = keysFor(heroes);
  let best = { ids: [] as number[], missed: [] as string[], heard: transcripts[0] ?? "" };
  for (const t of transcripts) {
    const r = parse(t, keys);
    if (r.ids.length > best.ids.length || (r.ids.length === best.ids.length && r.missed.length < best.missed.length && r.ids.length))
      best = { ...r, heard: t };
  }
  if (!best.ids.length) best.missed = words(best.heard).filter((w) => !FILLER.has(w));
  return best;
}

/* ------------------------------------------------------------------ speech */

interface SpeechAlternative {
  transcript: string;
}
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<SpeechAlternative> & { isFinal: boolean }>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  // Browsers only give the microphone to https pages (and localhost): on a plain http address,
  // such as a phone testing the dev server over Wi-Fi, hide the mic instead of showing "blocked".
  if (typeof window === "undefined" || !window.isSecureContext) return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceState = "idle" | "listening" | "denied" | "error";

/**
 * Tap to talk: start() listens until the player stops speaking (never in the background, so team
 * voice chat isn't picked up), then calls onHeard with every reading of what was said. While
 * listening, `live` is the words so far.
 */
export function useVoicePicks(onHeard: (transcripts: string[]) => void) {
  const supported = recognitionCtor() !== null;
  const [state, setState] = useState<VoiceState>("idle");
  const [live, setLive] = useState("");
  const rec = useRef<Recognition | null>(null);
  const handler = useRef(onHeard);
  handler.current = onHeard;

  useEffect(() => () => rec.current?.abort(), []);

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || rec.current) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 5;
    let finals: string[] = [];
    r.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      setLive(result[0]?.transcript ?? "");
      if (result.isFinal) finals = Array.from({ length: result.length }, (_, i) => result[i].transcript);
    };
    r.onerror = (e) => setState(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "idle" : "error");
    r.onend = () => {
      rec.current = null;
      setLive("");
      setState((s) => (s === "listening" ? "idle" : s));
      if (finals.length) handler.current(finals);
    };
    rec.current = r;
    setState("listening");
    try {
      r.start();
    } catch {
      rec.current = null;
      setState("error");
    }
  }, []);

  return { supported, state, live, start, stop };
}
