import { useCallback } from 'react';
import type { Sticker, StickerId } from '../../data/types';
import { useAlbumStore } from '../../stores/albumStore';
import { StickerSlot } from './StickerSlot';

export interface StickerGridProps {
  /** All stickers for this country (20 items). */
  stickers: Sticker[];
  /** Current filter: show all, only owned, or only missing stickers. */
  filter: 'all' | 'owned' | 'missing';
}

/**
 * Responsive grid of StickerSlot components.
 *
 * Uses the Zustand store for ownership state and toggling.
 * Applies the active filter before rendering.
 *
 * Grid layout:
 *   - Mobile (<640px): 2 columns
 *   - Tablet (640–1024px): 3 columns
 *   - Desktop (≥1024px): 4–5 columns
 */
export function StickerGrid({ stickers, filter }: StickerGridProps) {
  const isOwned = useAlbumStore((s) => s.isOwned);

  const filtered = stickers.filter((s) => {
    if (filter === 'owned') return isOwned(s.id);
    if (filter === 'missing') return !isOwned(s.id);
    return true; // 'all'
  });

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      role="list"
      aria-label={`Sticker grid — ${filter} stickers`}
    >
      {filtered.length === 0 ? (
        <p className="col-span-full text-center py-8 text-ink-muted font-body text-sm">
          {filter === 'owned'
            ? 'No stickers owned yet. Start collecting!'
            : filter === 'missing'
              ? 'All stickers collected! 🎉'
              : 'No stickers found.'}
        </p>
      ) : (
        filtered.map((sticker) => (
          <StickerSlotWrapper
            key={sticker.id}
            sticker={sticker}
          />
        ))
      )}
    </div>
  );
}

/**
 * Internal wrapper that connects a single StickerSlot to the store.
 * Extracted to avoid full grid re-renders when a single sticker toggles.
 */
function StickerSlotWrapper({ sticker }: { sticker: Sticker }) {
  const owned = useAlbumStore((s) => s.owned.has(sticker.id));
  const quantity = useAlbumStore((s) => s.quantities[sticker.id] ?? 0);
  const toggleSticker = useAlbumStore((s) => s.toggleSticker);
  const incrementSticker = useAlbumStore((s) => s.incrementSticker);
  const decrementSticker = useAlbumStore((s) => s.decrementSticker);

  const handleToggle = useCallback(
    (id: StickerId) => {
      toggleSticker(id);
    },
    [toggleSticker],
  );

  const handleIncrement = useCallback(
    (id: StickerId) => {
      incrementSticker(id);
    },
    [incrementSticker],
  );

  const handleDecrement = useCallback(
    (id: StickerId) => {
      decrementSticker(id);
    },
    [decrementSticker],
  );

  return (
    <div role="listitem">
      <StickerSlot
        sticker={sticker}
        owned={owned}
        quantity={quantity}
        onToggle={handleToggle}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
}
