import type { Country, TeamCode } from './types';
import { stickers } from './catalog';

/**
 * Deterministic order of team codes.
 * Derived from the catalog's first-occurrence order (alphabetical by JSON).
 */
export const teamCodes: TeamCode[] = (() => {
  const seen = new Set<TeamCode>();
  const codes: TeamCode[] = [];
  for (const s of stickers) {
    if (!seen.has(s.team_code)) {
      seen.add(s.team_code);
      codes.push(s.team_code);
    }
  }
  return codes;
})();

/**
 * Country metadata for dashboard cards and navigation.
 * One entry per team, with sticker IDs in slot order.
 */
export const countries: Country[] = (() => {
  const map = new Map<TeamCode, { name: string; ids: string[] }>();
  for (const s of stickers) {
    const entry = map.get(s.team_code);
    if (entry) {
      entry.ids.push(s.id);
    } else {
      map.set(s.team_code, { name: s.team_name, ids: [s.id] });
    }
  }
  // Preserve deterministic order matching teamCodes.
  return teamCodes.map((code) => {
    const entry = map.get(code)!;
    return {
      teamCode: code,
      name: entry.name,
      stickerIds: entry.ids,
    };
  });
})();

/** Look up a country by team code (O(1) via Map). */
const byCode = new Map<TeamCode, Country>(countries.map((c) => [c.teamCode, c]));

export function getCountry(teamCode: TeamCode): Country | undefined {
  return byCode.get(teamCode);
}
