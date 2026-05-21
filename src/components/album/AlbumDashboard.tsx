import type { Country } from '../../data/types';
import type { CountryTheme } from '../../data/types';
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
 * Dashboard landing page: overall album progress + 48 country cards
 * in a responsive grid. Stats are derived from the Zustand store.
 * Waits for store hydration before rendering to prevent flicker.
 */
export function AlbumDashboard({ countries, getTheme }: AlbumDashboardProps) {
  const hydrated = useAlbumStore((s) => s.hydrated);
  const getOverallStats = useAlbumStore((s) => s.getOverallStats);
  const getOwnedCountByTeam = useAlbumStore((s) => s.getOwnedCountByTeam);

  // Don't render until the store has loaded from localStorage
  if (!hydrated) return null;

  const { total: totalStickers, owned: ownedCount, missing: missingCount, percent: overallPct } =
    getOverallStats();

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

      {/* ── Country grid ── */}
      <section aria-labelledby="countries-heading">
        <h2
          id="countries-heading"
          className="font-display text-xl font-bold text-ink uppercase tracking-tight mb-4"
        >
          Countries
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {countries.map((country) => {
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
      </section>
    </div>
  );
}
