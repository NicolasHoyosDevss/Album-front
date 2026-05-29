import { useCallback, useRef, useState } from 'react';
import type { Sticker, StickerId } from '../../data/types';

export interface StickerSlotProps {
  /** The sticker catalog entry. */
  sticker: Sticker;
  /** Whether this sticker is currently owned. */
  owned: boolean;
  /** How many copies of this sticker the user has. */
  quantity: number;
  /** Callback to toggle ownership (legacy, for search/modal usage). */
  onToggle: (id: StickerId) => void;
  /** Callback to increment sticker count by 1. */
  onIncrement?: (id: StickerId) => void;
  /** Callback to decrement sticker count by 1. */
  onDecrement?: (id: StickerId) => void;
}

/**
 * Deterministic pseudo-random number from a string (for stuck rotation).
 * Same ID always produces the same rotation, avoiding layout jumps.
 */
function hashToRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  }
  // Map to range -1.5° … +1.5°
  return ((hash / 0xffff) * 3 - 1.5);
}

/**
 * A single sticker slot in the country album grid.
 *
 * - Owned: shows the sticker image with a slight rotation and offset shadow ("stuck" effect).
 * - Missing: grey dashed placeholder with the album code and a subtle "+" button.
 * - Click/tap or Enter/Space toggles ownership.
 * - Image shows a fallback placeholder on load error.
 */
export function StickerSlot({
  sticker,
  owned,
  quantity,
  onToggle,
  onIncrement,
  onDecrement,
}: StickerSlotProps) {
  const [imgError, setImgError] = useState(false);
  const [justStuck, setJustStuck] = useState(false);
  const prevOwned = useRef(owned);

  const handleToggle = useCallback(() => {
    onToggle(sticker.id);
  }, [onToggle, sticker.id]);

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onIncrement) {
        onIncrement(sticker.id);
      } else {
        onToggle(sticker.id);
      }
    },
    [onIncrement, onToggle, sticker.id],
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDecrement) {
        onDecrement(sticker.id);
      }
    },
    [onDecrement, sticker.id],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (onIncrement) {
          onIncrement(sticker.id);
        } else {
          onToggle(sticker.id);
        }
      }
      if (e.key === '-' && owned) {
        e.preventDefault();
        onDecrement?.(sticker.id);
      }
    },
    [handleToggle, onIncrement, onDecrement, sticker.id, owned],
  );

  // Trigger "stick" animation when transitioning from missing → owned
  if (!prevOwned.current && owned) {
    setJustStuck(true);
    // Reset after animation duration
    requestAnimationFrame(() => {
      setTimeout(() => setJustStuck(false), 170);
    });
  }
  prevOwned.current = owned;

  const rotation = hashToRotation(sticker.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleIncrement}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        if (owned) {
          e.preventDefault();
          onDecrement?.(sticker.id);
        }
      }}
      aria-label={`${sticker.name} — ${sticker.album_code}${owned ? `, owned${quantity > 1 ? ` (${quantity} copies)` : ''}` : ', missing'}`}
      aria-pressed={owned}
      className="group relative flex flex-col items-center gap-1.5 p-3 rounded-comic
                 border-2 border-black bg-paper-light cursor-pointer
                 transition-shadow duration-150
                 hover:shadow-[4px_4px_0px_#1A1A2E]
                 focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      {/* Quantity badge — shown when > 1 */}
      {owned && quantity > 1 && (
        <span
          className="absolute -top-2 -right-2 z-10
                     font-heading text-xs font-bold text-ink
                     bg-neon-yellow border-2 border-black rounded-full
                     px-2 py-0.5 shadow-[2px_2px_0px_#1A1A2E]"
          aria-label={`${quantity} copies`}
        >
          ×{quantity}
        </span>
      )}

      {/* Decrement button (visible on hover for owned stickers) */}
      {owned && onDecrement && (
        <button
          type="button"
          onClick={handleDecrement}
          onKeyDown={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-label={`Remove one ${sticker.album_code}`}
          className="absolute top-2 left-2 z-10
                     w-6 h-6 flex items-center justify-center
                     border-2 border-black rounded-full
                     bg-neon-pink/80 hover:bg-neon-pink text-ink
                     opacity-0 group-hover:opacity-100
                     focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-neon-blue
                     shadow-[2px_2px_0px_#1A1A2E]
                     active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                     transition-all duration-150"
        >
          −
        </button>
      )}

      {/* Image or placeholder */}
      <div className="relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
        {owned ? (
          <div
            className="w-full h-full transition-all duration-150"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter: 'drop-shadow(4px 4px 0px rgba(26, 26, 46, 0.4))',
            }}
          >
            {!imgError ? (
              <img
                src={sticker.image_path}
                alt={sticker.name}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className={`w-full h-full object-contain ${justStuck ? 'animate-stick' : ''}`}
              />
            ) : (
              /* Fallback: image load failed but sticker is "owned" — show album code */
              <div className="w-full h-full flex items-center justify-center bg-neon-green/10 rounded-comic border-2 border-black">
                <span className="font-heading text-2xl font-bold text-ink">
                  {sticker.album_code.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Missing: dashed border placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-1
                          bg-paper-dark border-2 border-dashed border-ink-muted/60 rounded-comic">
            <span className="font-heading text-base font-semibold text-ink-muted/70 tracking-wider">
              {sticker.album_code.replace('_', ' ')}
            </span>
            <span
              className="text-2xl text-ink-muted/40 leading-none select-none"
              aria-hidden="true"
            >
              +
            </span>
          </div>
        )}
      </div>

      {/* Increment button (visible on hover for owned stickers to add more) */}
      {owned && onIncrement && (
        <button
          type="button"
          onClick={handleIncrement}
          onKeyDown={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-label={`Add another ${sticker.album_code}`}
          className="absolute bottom-14 right-2 z-10
                     w-6 h-6 flex items-center justify-center
                     border-2 border-black rounded-full
                     bg-neon-green/80 hover:bg-neon-green text-ink
                     opacity-0 group-hover:opacity-100
                     focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-neon-blue
                     shadow-[2px_2px_0px_#1A1A2E]
                     active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                     transition-all duration-150"
        >
          +
        </button>
      )}

      {/* Sticker info: code + name */}
      <div className="w-full text-center mt-0.5">
        <span className="block font-heading text-xs font-bold text-ink/60 uppercase tracking-wider">
          {sticker.album_code.replace('_', ' ')}
        </span>
        <span className="block font-body text-xs text-ink-muted leading-tight mt-0.5 truncate">
          {sticker.name}
        </span>
      </div>
    </div>
  );
}
