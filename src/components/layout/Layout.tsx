import { Link, Outlet } from 'react-router-dom';
import { ExportMissingButton } from '../export/ExportMissingButton';
import { useAuthStore } from '../../stores/authStore';

export function Layout() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="min-h-screen bg-paper-light bg-paper-texture flex flex-col">
      <header className="bg-ink text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 min-w-0 group"
            aria-label="Go to home page"
          >
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              🌍
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate group-hover:text-neon-yellow transition-colors">
              Album mundial 2026
            </h1>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            {session && <ExportMissingButton />}
            {session && (
              <Link
                to="/search"
                className="font-body text-sm font-medium text-white hover:text-neon-yellow
                           transition-colors border border-white/30 rounded-comic px-3 py-1.5
                           hover:border-neon-yellow focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                🔍 Search
              </Link>
            )}
            {session && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="font-body text-sm font-medium text-white hover:text-neon-yellow
                           transition-colors border border-white/30 rounded-comic px-3 py-1.5
                           hover:border-neon-yellow focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                title={user?.email ?? 'Signed in'}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 animate-fade-in">
        <Outlet />
      </main>

      <footer className="bg-paper-dark text-ink-muted text-center py-3 px-4 text-sm border-t border-paper-dark">
        Album mundial 2026 &mdash; Virtual Sticker Collection
      </footer>
    </div>
  );
}
