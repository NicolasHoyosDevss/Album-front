import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAlbumStore } from '../stores/albumStore';
import { useAuthStore } from '../stores/authStore';

export function App() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const authLoading = useAuthStore((s) => s.loading);
  const session = useAuthStore((s) => s.session);
  const loadSavedAlbum = useAlbumStore((s) => s.loadSavedAlbum);
  const resetAlbum = useAlbumStore((s) => s.resetAlbum);
  const albumHydrated = useAlbumStore((s) => s.hydrated);
  const albumLoading = useAlbumStore((s) => s.loading);

  useEffect(() => initializeAuth(), [initializeAuth]);

  useEffect(() => {
    if (!authHydrated) return;

    if (session) {
      void loadSavedAlbum();
      return;
    }

    resetAlbum();
  }, [authHydrated, loadSavedAlbum, resetAlbum, session]);

  const booting = !authHydrated || authLoading || (Boolean(session) && !albumHydrated && albumLoading);

  if (booting) {
    return (
      <div className="min-h-screen bg-paper-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading album data"
          />
          <p className="font-body text-sm text-ink-muted">Loading album...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
