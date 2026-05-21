import { useCallback, useRef, useState } from 'react';
import type { Sticker, StickerId } from '../../data/types';

export interface StickerSlotProps {
  /** The sticker catalog entry. */
  sticker: Sticker;
  /** Whether this sticker is currently owned. */
  owned: boolean;
  /** Callback to toggle ownership. */
  onToggle: (id: StickerId) => void;
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
export function StickerSlot({ sticker, owned, onToggle }: StickerSlotProps) {
  const [imgError, setImgError] = useState(false);
  const [justStuck, setJustStuck] = useState(false);
  const prevOwned = useRef(owned);

  const handleToggle = useCallback(() => {
    onToggle(sticker.id);
  }, [onToggle, sticker.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
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
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={`${sticker.name} — ${sticker.album_code}${owned ? ', owned' : ', missing'}`}
      aria-pressed={owned}
      className="group relative flex flex-col items-center gap-1.5 p-3 rounded-comic
                 border-2 border-black bg-paper-light cursor-pointer
                 transition-shadow duration-150
                 hover:shadow-[4px_4px_0px_#1A1A2E]
                 focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
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
