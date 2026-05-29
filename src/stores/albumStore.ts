import { create } from 'zustand';
import { stickers } from '../data/catalog';
import * as api from '../services/api';

function deriveOwned(quantities: Record<string, number>): Set<string> {
  return new Set(
    Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([code]) => code),
  );
}

function deriveRepeated(quantities: Record<string, number>): string[] {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 1)
    .map(([code]) => code);
}

export interface AlbumStoreState {
  album: api.AlbumResponse | null;
  quantities: Record<string, number>;
  loading: boolean;
  error: string | null;
  owned: Set<string>;
  hydrated: boolean;

  createAlbum: (nickname: string) => Promise<void>;
  loadSavedAlbum: () => Promise<void>;
  updateStickerQuantity: (stickerCode: string, quantity: number) => Promise<void>;
  incrementSticker: (stickerCode: string) => Promise<void>;
  decrementSticker: (stickerCode: string) => Promise<void>;
  batchUpdate: (stickers: Record<string, number>) => Promise<void>;
  resetAlbum: () => void;
  clearError: () => void;

  addSticker: (id: string) => void;
  removeSticker: (id: string) => void;
  toggleSticker: (id: string) => void;
  isOwned: (id: string) => boolean;

  loadFromStorage: () => void;
  persistToStorage: () => void;

  getOwnedCountByTeam: (teamCode: string) => number;
  getMissingByTeam: (teamCode: string) => string[];
  getOverallStats: () => { total: number; owned: number; missing: number; percent: number };
  getRepeated: () => string[];
}

function emptyAlbumState() {
  return {
    album: null,
    quantities: {},
    owned: new Set<string>(),
    error: null,
  };
}

export const useAlbumStore = create<AlbumStoreState>()((set, get) => ({
  album: null,
  quantities: {},
  loading: false,
  error: null,
  owned: new Set<string>(),
  hydrated: false,

  createAlbum: async (nickname) => {
    set({ loading: true, error: null });
    try {
      const { album } = await api.createAlbum(nickname);
      set({
        album,
        quantities: {},
        owned: new Set<string>(),
        hydrated: true,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        hydrated: true,
        error:
          err instanceof api.ApiError ? err.message : 'Failed to create album',
      });
      throw err;
    }
  },

  loadSavedAlbum: async () => {
    set({ loading: true, error: null });
    try {
      const { album, progress } = await api.getMyAlbumProgress();
      set({
        album,
        quantities: progress,
        owned: deriveOwned(progress),
        hydrated: true,
        loading: false,
      });
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 404) {
        try {
          await get().createAlbum('My album');
          return;
        } catch {
          return;
        }
      }

      set({
        ...emptyAlbumState(),
        hydrated: true,
        loading: false,
        error:
          err instanceof api.ApiError ? err.message : 'Failed to load album',
      });
    }
  },

  updateStickerQuantity: async (stickerCode, quantity) => {
    const { album, quantities: current } = get();
    if (!album) {
      set({ error: 'No album loaded' });
      return;
    }

    const next = { ...current };
    if (quantity <= 0) {
      delete next[stickerCode];
    } else {
      next[stickerCode] = quantity;
    }
    set({ quantities: next, owned: deriveOwned(next), error: null });

    try {
      await api.setStickerQuantity(stickerCode, quantity);
    } catch (err) {
      set({
        quantities: current,
        owned: deriveOwned(current),
        error:
          err instanceof api.ApiError ? err.message : 'Failed to sync with server',
      });
    }
  },

  incrementSticker: async (stickerCode) => {
    const { album, quantities: current } = get();
    if (!album) {
      set({ error: 'No album loaded' });
      return;
    }

    const nextQty = (current[stickerCode] ?? 0) + 1;
    const next = { ...current, [stickerCode]: nextQty };
    set({ quantities: next, owned: deriveOwned(next), error: null });

    try {
      await api.incrementSticker(stickerCode);
    } catch (err) {
      set({
        quantities: current,
        owned: deriveOwned(current),
        error:
          err instanceof api.ApiError ? err.message : 'Failed to sync with server',
      });
    }
  },

  decrementSticker: async (stickerCode) => {
    const { album, quantities: current } = get();
    if (!album) {
      set({ error: 'No album loaded' });
      return;
    }

    const currentQty = current[stickerCode] ?? 0;
    if (currentQty <= 0) return;

    const nextQty = currentQty - 1;
    const next = { ...current };
    if (nextQty <= 0) {
      delete next[stickerCode];
    } else {
      next[stickerCode] = nextQty;
    }
    set({ quantities: next, owned: deriveOwned(next), error: null });

    try {
      await api.decrementSticker(stickerCode);
    } catch (err) {
      set({
        quantities: current,
        owned: deriveOwned(current),
        error:
          err instanceof api.ApiError ? err.message : 'Failed to sync with server',
      });
    }
  },

  batchUpdate: async (updatedStickers) => {
    const { album, quantities: current } = get();
    if (!album) {
      set({ error: 'No album loaded' });
      return;
    }

    const next = { ...current };
    for (const [code, qty] of Object.entries(updatedStickers)) {
      if (qty <= 0) {
        delete next[code];
      } else {
        next[code] = qty;
      }
    }
    set({ quantities: next, owned: deriveOwned(next), error: null });

    try {
      await api.batchUpdateStickers(updatedStickers);
    } catch (err) {
      set({
        quantities: current,
        owned: deriveOwned(current),
        error:
          err instanceof api.ApiError ? err.message : 'Failed to sync batch update',
      });
    }
  },

  resetAlbum: () => set({ ...emptyAlbumState(), hydrated: true, loading: false }),
  clearError: () => set({ error: null }),

  addSticker: (id) => {
    void get().incrementSticker(id);
  },

  removeSticker: (id) => {
    void get().updateStickerQuantity(id, 0);
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
    void get().loadSavedAlbum();
  },

  persistToStorage: () => undefined,

  getOwnedCountByTeam: (teamCode) => {
    const owned = get().owned;
    return stickers
      .filter((s) => s.team_code === teamCode)
      .filter((s) => owned.has(s.id)).length;
  },

  getMissingByTeam: (teamCode) => {
    const owned = get().owned;
    return stickers
      .filter((s) => s.team_code === teamCode && !owned.has(s.id))
      .map((s) => s.id);
  },

  getOverallStats: () => {
    const total = stickers.length;
    const owned = get().owned.size;
    const missing = total - owned;
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { total, owned, missing, percent };
  },

  getRepeated: () => deriveRepeated(get().quantities),
}));
