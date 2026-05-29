import { AlbumDashboard } from '../components/album/AlbumDashboard';
import { AlbumSetup } from '../components/album/AlbumSetup';
import { countries } from '../data/countries';
import { getTheme } from '../data/themes';
import { useAlbumStore } from '../stores/albumStore';

/**
 * Dashboard page — renders the full AlbumDashboard with overall
 * progress bar and 48-country card grid.
 *
 * When no album is active, shows the Google sign-in setup screen instead.
 */
export function DashboardPage() {
  const album = useAlbumStore((s) => s.album);
  const hydrated = useAlbumStore((s) => s.hydrated);
  const loading = useAlbumStore((s) => s.loading);
  const error = useAlbumStore((s) => s.error);
  const loadSavedAlbum = useAlbumStore((s) => s.loadSavedAlbum);
  const clearError = useAlbumStore((s) => s.clearError);

  // Don't render until initial hydration attempt completes
  if (!hydrated) {
    return null;
  }

  // Show AlbumSetup when no album is loaded
  if (!album) {
    return <AlbumSetup />;
  }

  return (
    <>
      {/* Inline error banner with retry */}
      {error && (
        <div
          role="alert"
          className="mb-4 p-4 rounded-comic border-2 border-black bg-neon-pink/20 text-ink
                     flex items-center justify-between gap-3 animate-fade-in"
        >
          <p className="font-body text-sm font-medium">{error}</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                clearError();
                loadSavedAlbum();
              }}
              className="font-heading text-xs font-bold uppercase tracking-wider
                         px-3 py-1.5 border-2 border-black rounded-comic
                         bg-white hover:bg-paper-dark text-ink
                         shadow-[2px_2px_0px_#1A1A2E]
                         active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                         focus-visible:ring-2 focus-visible:ring-neon-blue
                         transition-all duration-150"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="font-heading text-xs font-bold uppercase tracking-wider
                         px-3 py-1.5 border-2 border-black rounded-comic
                         bg-white hover:bg-paper-dark text-ink
                         shadow-[2px_2px_0px_#1A1A2E]
                         active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                         focus-visible:ring-2 focus-visible:ring-neon-blue
                         transition-all duration-150"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && (
        <div
          className="fixed inset-0 z-40 bg-paper-light/60 flex items-center justify-center"
          role="status"
          aria-label="Syncing with server"
        >
          <div className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <AlbumDashboard countries={countries} getTheme={getTheme} />
    </>
  );
}
