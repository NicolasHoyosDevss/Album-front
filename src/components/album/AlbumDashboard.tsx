import { useMemo, useState } from 'react';
import type { Country } from '../../data/types';
import type { CountryTheme } from '../../data/types';
import { stickers } from '../../data/catalog';
import { ProgressBar } from './ProgressBar';
import { CountryCard } from './CountryCard';
import { useAlbumStore } from '../../stores/albumStore';

export interface AlbumDashboardProps {
  /** All 48 country entries. */
  countries: Country[];
  /** Theme lookup per team code. */
  getTheme: (teamCode: string) => CountryTheme | undefined;
}

/**
 * Dashboard landing page: overall album progress + country search +
 * filtered country cards in a responsive grid. Stats are derived from
 * the Zustand store. Waits for store hydration before rendering.
 */
export function AlbumDashboard({ countries, getTheme }: AlbumDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const hydrated = useAlbumStore((s) => s.hydrated);
  const getOverallStats = useAlbumStore((s) => s.getOverallStats);
  const getOwnedCountByTeam = useAlbumStore((s) => s.getOwnedCountByTeam);

  // Hooks must be called before any early return
  const stats = useMemo(() => getOverallStats(), [getOverallStats]);

  const filteredCountries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return countries;

    // Find countries matching by name or code
    const countryMatches = countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.teamCode.toLowerCase().includes(q)
    );

    // Also find countries whose stickers match by player/element name
    const teamCodesFromStickers = new Set<string>();
    stickers.forEach((s) => {
      if (s.name.toLowerCase().includes(q)) {
        teamCodesFromStickers.add(s.team_code);
      }
    });

    const stickerMatches = countries.filter((c) =>
      teamCodesFromStickers.has(c.teamCode)
    );

    // Merge and deduplicate
    const merged = [...countryMatches, ...stickerMatches];
    const seen = new Set<string>();
    return merged.filter((c) => {
      if (seen.has(c.teamCode)) return false;
      seen.add(c.teamCode);
      return true;
    });
  }, [countries, searchTerm]);

  // Don't render until the store has loaded from localStorage
  if (!hydrated) return null;

  const { total: totalStickers, owned: ownedCount, missing: missingCount, percent: overallPct } = stats;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Overall progress section ── */}
      <section
        aria-labelledby="overall-progress-heading"
        className="flex flex-col gap-4 p-5 rounded-comic border-2 border-black bg-paper-light"
      >
        <h2
          id="overall-progress-heading"
          className="font-display text-2xl font-bold text-ink uppercase tracking-tight"
        >
          Album Progress
        </h2>
        <ProgressBar value={ownedCount} max={totalStickers} label="complete" />
        <div className="flex flex-wrap gap-4 font-body text-sm text-ink-muted">
          <span>
            <strong className="text-ink">{ownedCount}</strong> owned
          </span>
          <span>
            <strong className="text-ink">{missingCount}</strong> missing
          </span>
          <span>
            <strong className="text-ink">{totalStickers}</strong> total
          </span>
          <span className="font-semibold text-ink">{overallPct}%</span>
        </div>
      </section>

      {/* ── Country search + grid ── */}
      <section aria-labelledby="countries-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2
            id="countries-heading"
            className="font-display text-xl font-bold text-ink uppercase tracking-tight"
          >
            Countries
          </h2>

          {/* Search input */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country, code or player..."
              aria-label="Search countries or players"
              className="w-full pl-9 pr-9 py-2 rounded-comic border-2 border-black bg-white
                         font-body text-sm text-ink placeholder:text-ink-muted
                         focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2
                         focus:ring-offset-paper-light"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted
                           hover:text-ink transition-colors p-0.5 rounded-full
                           focus:outline-none focus:ring-2 focus:ring-neon-blue"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredCountries.length === 0 ? (
          <p className="text-center text-ink-muted font-body py-8">
            No countries match "{searchTerm}"
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredCountries.map((country) => {
              const theme = getTheme(country.teamCode);
              const owned = getOwnedCountByTeam(country.teamCode);
              const total = country.stickerIds.length;

              return (
                <CountryCard
                  key={country.teamCode}
                  country={country}
                  ownedCount={owned}
                  totalCount={total}
                  theme={theme}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
