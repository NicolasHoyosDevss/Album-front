import { create } from 'zustand';
import { stickers } from '../data/catalog';

const STORAGE_KEY = 'mpa-owned';

export interface AlbumStoreState {
  /** Set of owned sticker IDs (e.g. "ARG_01"). */
  owned: Set<string>;
  /** True after localStorage has been read (prevents flicker). */
  hydrated: boolean;

  /** Add a sticker to the owned set and persist. */
  addSticker: (id: string) => void;
  /** Remove a sticker from the owned set and persist. */
  removeSticker: (id: string) => void;
  /** Toggle a sticker between owned and missing. */
  toggleSticker: (id: string) => void;
  /** Check if a sticker is owned (O(1) lookup). */
  isOwned: (id: string) => boolean;

  /** Read owned stickers from localStorage and hydrate the store. */
  loadFromStorage: () => void;
  /** Serialize the owned Set as JSON array to localStorage. */
  persistToStorage: () => void;

  /** Count owned stickers for a given team code. */
  getOwnedCountByTeam: (teamCode: string) => number;
  /** List missing sticker IDs for a given team code. */
  getMissingByTeam: (teamCode: string) => string[];
  /** Overall album stats: total, owned, missing, percent. */
  getOverallStats: () => {
    total: number;
    owned: number;
    missing: number;
    percent: number;
  };
}

export const useAlbumStore = create<AlbumStoreState>()((set, get) => ({
  owned: new Set<string>(),
  hydrated: false,

  addSticker: (id) => {
    const owned = new Set(get().owned);
    owned.add(id);
    set({ owned });
    get().persistToStorage();
    // TODO: Backend — sync to Supabase
  },

  removeSticker: (id) => {
    const owned = new Set(get().owned);
    owned.delete(id);
    set({ owned });
    get().persistToStorage();
    // TODO: Backend — sync to Supabase
  },

  toggleSticker: (id) => {
    if (get().owned.has(id)) {
      get().removeSticker(id);
    } else {
      get().addSticker(id);
    }
  },

  isOwned: (id) => get().owned.has(id),

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        if (Array.isArray(ids)) {
          set({ owned: new Set(ids) });
        }
      }
    } catch {
      // Corrupted or missing data — start with empty set
    }
    set({ hydrated: true });
  },

  persistToStorage: () => {
    try {
      const arr = Array.from(get().owned);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  },

  getOwnedCountByTeam: (teamCode) => {
    const teamStickers = stickers.filter((s) => s.team_code === teamCode);
    return teamStickers.filter((s) => get().owned.has(s.id)).length;
  },

  getMissingByTeam: (teamCode) => {
    const teamStickers = stickers.filter((s) => s.team_code === teamCode);
    return teamStickers.filter((s) => !get().owned.has(s.id)).map((s) => s.id);
  },

  getOverallStats: () => {
    const total = stickers.length;
    const owned = get().owned.size;
    const missing = total - owned;
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { total, owned, missing, percent };
  },
}));
