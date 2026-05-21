import { AlbumSearch } from '../components/search/AlbumSearch';

/**
 * Search page — exact sticker code lookup across all 48 countries.
 *
 * - Renders the AlbumSearch component with input, result card,
 *   owned toggle, and country album navigation.
 * - Responsive layout with max-width container centered.
 */
export function SearchPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page header */}
      <div className="text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink uppercase tracking-tight mb-2">
          🔍 Search Stickers
        </h2>
        <p className="font-body text-ink-muted max-w-lg mx-auto">
          Find any sticker across all 48 countries by entering its album code.
        </p>
      </div>

      {/* Search component — centered, constrained width */}
      <div className="max-w-xl mx-auto w-full">
        <AlbumSearch />
      </div>
    </div>
  );
}
