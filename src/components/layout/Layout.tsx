import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-paper-light bg-paper-texture flex flex-col">
      {/* Header */}
      <header className="bg-ink text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            🌍
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Mundial Pop Album
          </h1>
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
