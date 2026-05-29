import { useCallback } from 'react';
import { useAlbumStore } from '../../stores/albumStore';
import { useAuthStore } from '../../stores/authStore';
import { isSupabaseConfigured } from '../../services/supabase';

/**
 * Account setup screen shown before a user has an authenticated album loaded.
 */
export function AlbumSetup() {
  const session = useAuthStore((s) => s.session);
  const authLoading = useAuthStore((s) => s.loading);
  const authError = useAuthStore((s) => s.error);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const clearAuthError = useAuthStore((s) => s.clearError);
  const loadSavedAlbum = useAlbumStore((s) => s.loadSavedAlbum);
  const albumLoading = useAlbumStore((s) => s.loading);
  const albumError = useAlbumStore((s) => s.error);
  const clearAlbumError = useAlbumStore((s) => s.clearError);

  const displayError = authError || albumError;
  const submitting = authLoading || albumLoading;

  const handleGoogleLogin = useCallback(() => {
    clearAuthError();
    void signInWithGoogle();
  }, [clearAuthError, signInWithGoogle]);

  const handleRetryAlbum = useCallback(() => {
    clearAlbumError();
    void loadSavedAlbum();
  }, [clearAlbumError, loadSavedAlbum]);

  return (
    <section className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div
        className="w-24 h-24 rounded-full border-4 border-black bg-neon-yellow/80
                   flex items-center justify-center mb-8
                   shadow-[6px_6px_0px_#1A1A2E]"
        aria-hidden="true"
      >
        <span className="text-5xl">🌍</span>
      </div>

      <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink uppercase tracking-tight mb-4">
        Welcome to Mundial Pop Album
      </h2>
      <p className="font-body text-base text-ink-muted max-w-md mb-8">
        Sign in with Google to save your sticker album and continue from any device.
      </p>

      {displayError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3 rounded-comic border-2 border-black bg-neon-pink/20 text-ink font-body text-sm w-full max-w-md"
        >
          {displayError}
        </div>
      )}

      {!session ? (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting || !isSupabaseConfigured}
          className="font-heading text-base font-bold uppercase tracking-wider
                     px-8 py-4 border-3 border-black rounded-comic
                     bg-neon-green/85 hover:bg-neon-green text-ink
                     shadow-[5px_5px_0px_#1A1A2E]
                     hover:shadow-[6px_6px_0px_#1A1A2E]
                     active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                     focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-150"
        >
          {submitting ? 'Connecting...' : 'Continue with Google'}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-body text-sm text-ink-muted">
            Your session is ready. Preparing your album...
          </p>
          <button
            type="button"
            onClick={handleRetryAlbum}
            disabled={submitting}
            className="font-heading text-sm font-bold uppercase tracking-wider
                       px-5 py-3 border-2 border-black rounded-comic
                       bg-paper-dark hover:bg-ink/10 text-ink
                       shadow-[3px_3px_0px_#1A1A2E]
                       active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                       focus-visible:ring-2 focus-visible:ring-neon-blue
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
          >
            Retry loading album
          </button>
        </div>
      )}

      {!isSupabaseConfigured && (
        <p className="mt-4 font-body text-xs text-ink-muted/70 max-w-md">
          Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable login.
        </p>
      )}
    </section>
  );
}
