import { useState, useCallback } from 'react';
import { stickers } from '../../data/catalog';
import { useAlbumStore } from '../../stores/albumStore';
import { getCountry } from '../../data/countries';

/**
 * Generate a text list of missing stickers grouped by country.
 *
 * Format:
 * ```
 * Colombia:
 * COL 03, COL 08, COL 12
 *
 * Brasil:
 * BRA 01, BRA 04, BRA 09
 * ```
 *
 * Countries with zero missing stickers are omitted.
 */
function generateMissingText(owned: Set<string>): string {
  const missingByTeam = new Map<string, string[]>();

  for (const s of stickers) {
    if (!owned.has(s.id)) {
      const list = missingByTeam.get(s.team_code);
      if (list) {
        list.push(s.album_code);
      } else {
        missingByTeam.set(s.team_code, [s.album_code]);
      }
    }
  }

  if (missingByTeam.size === 0) return '';

  const sections: string[] = [];
  // Sort by country name for consistent output
  const sorted = Array.from(missingByTeam.entries()).sort((a, b) => {
    const nameA = getCountry(a[0])?.name ?? a[0];
    const nameB = getCountry(b[0])?.name ?? b[0];
    return nameA.localeCompare(nameB);
  });

  for (const [teamCode, codes] of sorted) {
    const country = getCountry(teamCode);
    const name = country?.name ?? teamCode;
    sections.push(`${name}:\n${codes.join(', ')}`);
  }

  return sections.join('\n\n');
}

/**
 * Export / share button for the missing stickers list.
 *
 * Features:
 * - Generates a formatted text list of missing stickers grouped by country
 * - Uses `navigator.share` if available (mobile browsers)
 * - Falls back to `navigator.clipboard.writeText` with success toast
 * - Handles clipboard errors gracefully
 * - Sport-Pop aesthetic: heavy black border, press effect, neon pink accent
 * - Shows a success/error toast notification
 * - Hides until store hydration is complete
 */
export function ExportMissingButton() {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const hydrated = useAlbumStore((s) => s.hydrated);
  const owned = useAlbumStore((s) => s.owned);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  const handleExport = useCallback(async () => {
    const text = generateMissingText(owned);

    if (!text) {
      showToast('No missing stickers — album complete! 🎉', 'success');
      return;
    }

    // Try native share API first (mobile browsers)
    if (
      typeof navigator !== 'undefined' &&
      'share' in navigator &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: clipboard API
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied missing stickers to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [owned, showToast]);

  // Don't render until store is hydrated to avoid stale data
  if (!hydrated) return null;

  return (
    <>
      <button
        onClick={handleExport}
        className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider
                   px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-black rounded-comic
                   bg-neon-pink/80 hover:bg-neon-pink text-ink
                   shadow-[3px_3px_0px_#1A1A2E]
                   hover:shadow-[4px_4px_0px_#1A1A2E]
                   active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                   focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                   transition-all duration-150"
        aria-label="Export missing stickers list"
      >
        📋 Export Missing
      </button>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 font-body text-sm font-medium px-4 py-3
                       rounded-comic border-2 border-black animate-pop
                       shadow-[4px_4px_0px_#1A1A2E]
                       ${
                         toast.type === 'success'
                           ? 'bg-neon-green/95 text-ink'
                           : 'bg-neon-pink/95 text-ink'
                       }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
