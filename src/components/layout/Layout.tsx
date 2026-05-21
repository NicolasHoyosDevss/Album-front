import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-paper-light bg-paper-texture flex flex-col">
      {/* Header */}
      <header className="bg-ink text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              🌍
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate">
              Mundial Pop Album
            </h1>
          </div>
          <nav aria-label="Main navigation">
            <Link
              to="/search"
              className="font-body text-sm font-medium text-white hover:text-neon-yellow
                         transition-colors border border-white/30 rounded-comic px-3 py-1.5
                         hover:border-neon-yellow focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              🔍 Search
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-paper-dark text-ink-muted text-center py-3 px-4 text-sm border-t border-paper-dark">
        Mundial Pop Album &mdash; Virtual Sticker Collection
      </footer>
    </div>
  );
}
