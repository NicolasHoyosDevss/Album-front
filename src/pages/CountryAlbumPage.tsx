import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getStickersByTeam } from '../data/catalog';
import { getTheme } from '../data/themes';
import { useAlbumStore } from '../stores/albumStore';
import { StickerGrid } from '../components/stickers/StickerGrid';
import { ProgressBar } from '../components/album/ProgressBar';
import { FilterTabs, type FilterValue } from '../components/album/FilterTabs';

/** Valid filter values for validation. */
const VALID_FILTERS = new Set<string>(['all', 'owned', 'missing']);

/**
 * Per-country album page with themed header and sticker grid.
 *
 * - Reads `:teamCode` from the URL (e.g. /country/BRA).
 * - Reads `?filter=` query param (all | owned | missing), defaults to "all".
 * - Injects the country's theme as CSS custom properties on a wrapper div.
 * - Shows a CountryHeader with gradient, name, and owned/missing stats.
 * - Renders accessible FilterTabs synced to the URL for shareability.
 * - Renders the sticker grid filtered by the active tab.
 *
 * Waits for store hydration before rendering to prevent flicker.
 */
export function CountryAlbumPage() {
  const { teamCode } = useParams<{ teamCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const hydrated = useAlbumStore((s) => s.hydrated);
  const getOwnedCountByTeam = useAlbumStore((s) => s.getOwnedCountByTeam);

  // Resolve and validate filter from URL query param
  const rawFilter = searchParams.get('filter') ?? 'all';
  const filter: FilterValue = VALID_FILTERS.has(rawFilter)
    ? (rawFilter as FilterValue)
    : 'all';

  const handleFilterChange = useCallback(
    (next: FilterValue) => {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next === 'all') {
            updated.delete('filter');
          } else {
            updated.set('filter', next);
          }
          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Don't render until the store has loaded from localStorage
  if (!hydrated) return null;

  if (!teamCode) {
    return (
      <div className="text-center py-12 text-ink-muted font-body">
        No country specified.
      </div>
    );
  }

  const theme = getTheme(teamCode);
  const stickers = getStickersByTeam(teamCode);
  const countryName = theme?.name ?? teamCode;
  const ownedCount = getOwnedCountByTeam(teamCode);
  const totalCount = stickers.length; // always 20

  if (stickers.length === 0) {
    return (
      <div className="text-center py-12 text-ink-muted font-body">
        Country &ldquo;{teamCode}&rdquo; not found in catalog.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Country Header (themed gradient background) ── */}
      <header
        className="relative overflow-hidden rounded-comic border-2 border-black p-6 sm:p-8"
        style={{
          background: theme?.gradient ?? 'linear-gradient(135deg, #1A1A2E, #FF6B9D)',
          color: theme?.text ?? '#FFFFFF',
        }}
      >
        {/* Decorative overlay for readability */}
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Country name — Sora uppercase, large */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight drop-shadow-sm">
            {countryName}
          </h1>

          {/* Mini-progress inside header */}
          <div className="flex flex-col gap-2 max-w-xs">
            <div className="flex items-center justify-between text-sm font-body opacity-90">
              <span className="font-semibold">
                {ownedCount} / {totalCount} owned
              </span>
              <span className="font-heading font-bold tabular-nums">
                {totalCount > 0
                  ? Math.round((ownedCount / totalCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-4 w-full rounded-full border-2 border-black/40 bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0}%`,
                  background: '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Team code badge */}
          <span className="inline-block self-start font-heading text-xs font-bold tracking-[0.15em] uppercase
                           bg-white/20 border border-white/30 rounded-full px-3 py-1">
            {teamCode}
          </span>
        </div>
      </header>

      {/* ── Full-size progress bar under header ── */}
      <section
        aria-labelledby="country-progress-heading"
        className="p-5 rounded-comic border-2 border-black bg-paper-light"
      >
        <h2
          id="country-progress-heading"
          className="sr-only"
        >
          {countryName} album progress
        </h2>
        <ProgressBar value={ownedCount} max={totalCount} label="complete" />
      </section>

      {/* ── Filter tabs synced to URL query param ── */}
      <FilterTabs value={filter} onChange={handleFilterChange} />

      {/* ── Sticker Grid ── */}
      <section aria-labelledby="sticker-grid-heading">
        <h2
          id="sticker-grid-heading"
          className="sr-only"
        >
          {countryName} stickers
        </h2>
        <StickerGrid stickers={stickers} filter={filter} />
      </section>
    </div>
  );
}
