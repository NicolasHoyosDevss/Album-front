import type { Sticker, TeamCode } from './types';
import rawCatalog from '../../album_stickers_final.json';
import { STICKER_ASSET_BASE_URL } from '../config/env';

function withConfiguredAssetBase(path: string): string {
  if (!STICKER_ASSET_BASE_URL) return path;

  const normalizedPath = path.replace(/^\/stickers\//, '/');
  return `${STICKER_ASSET_BASE_URL}${
    normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  }`;
}

/** Full sticker catalog: 960 stickers across 48 countries. */
export const stickers: Sticker[] = (rawCatalog as Sticker[]).map((sticker) => ({
  ...sticker,
  image_path: withConfiguredAssetBase(sticker.image_path),
}));

/** Index: sticker ID → Sticker (for O(1) lookups). */
const byId = new Map<string, Sticker>();
for (const s of stickers) {
  byId.set(s.id, s);
}

/** Index: team code → Sticker[] (pre-grouped for per-country views). */
const byTeam = new Map<TeamCode, Sticker[]>();
for (const s of stickers) {
  const list = byTeam.get(s.team_code);
  if (list) {
    list.push(s);
  } else {
    byTeam.set(s.team_code, [s]);
  }
}

/**
 * Get all stickers belonging to a country.
 * Returns an empty array for unknown team codes.
 */
export function getStickersByTeam(teamCode: TeamCode): Sticker[] {
  return byTeam.get(teamCode) ?? [];
}

/**
 * Look up a single sticker by its ID (e.g. "ARG_01").
 * Returns undefined if not found.
 */
export function getStickerById(id: string): Sticker | undefined {
  return byId.get(id);
}
