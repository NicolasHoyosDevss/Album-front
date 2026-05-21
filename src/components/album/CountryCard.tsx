import { useNavigate } from 'react-router-dom';
import type { Country } from '../../data/types';
import type { CountryTheme } from '../../data/types';

export interface CountryCardProps {
  /** Country metadata (name, teamCode, stickerIds). */
  country: Country;
  /** Number of stickers owned for this country (0 in D2). */
  ownedCount: number;
  /** Total stickers in this country's album (always 20). */
  totalCount: number;
  /** Per-country theme for visual accent. */
  theme?: CountryTheme;
}

/**
 * Card representing one country album in the dashboard grid.
 * Click / Enter / Space navigates to /country/:teamCode.
 * Keyboard focusable per WCAG.
 */
export function CountryCard({
  country,
  ownedCount,
  totalCount,
  theme,
}: CountryCardProps) {
  const navigate = useNavigate();
  const pct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  const handleOpen = () => {
    navigate(`/country/${country.teamCode}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${country.name} album — ${ownedCount} of ${totalCount} stickers owned`}
      className="group relative flex flex-col gap-3 p-4 rounded-comic border-2 border-black bg-paper-light
                 cursor-pointer transition-shadow duration-200
                 hover:shadow-[4px_4px_0px_#1A1A2E] focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2"
    >
      {/* Theme accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[6px]"
        style={{ backgroundColor: theme?.primary ?? '#1A1A2E' }}
      />

      {/* Country name + code */}
      <div className="mt-1.5">
        <h3 className="font-heading text-base font-bold text-ink leading-tight truncate">
          {country.name}
        </h3>
        <span className="font-body text-xs font-semibold text-ink-muted tracking-wider uppercase">
          {country.teamCode}
        </span>
      </div>

      {/* Mini progress */}
      <div className="flex flex-col gap-1">
        <span className="font-body text-xs text-ink-muted tabular-nums">
          {ownedCount} / {totalCount} &middot; {pct}%
        </span>
        <div className="h-3 w-full rounded-full border-2 border-black bg-paper-dark overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              backgroundColor: '#22c55e',
            }}
          />
        </div>
      </div>
    </div>
  );
}
