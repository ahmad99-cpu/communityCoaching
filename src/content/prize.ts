import type { Prize } from "@/content/types";

/** "Team Liquid jersey" style title: team name (if any) + prize name. */
export function prizeTitle(prize: Prize) {
  return prize.team && !prize.name.toLowerCase().includes(prize.team.toLowerCase())
    ? `${prize.team} ${prize.name}`
    : prize.name;
}
