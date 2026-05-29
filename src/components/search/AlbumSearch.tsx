import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sticker } from '../../data/types';
import { stickers } from '../../data/catalog';
import { useAlbumStore } from '../../stores/albumStore';

/**
 * Normalize user input: uppercase and strip everything except letters/digits.
 * This makes search case-insensitive and tolerant to spaces, underscores,
 * hyphens, or any other separator (e.g. "bra_05", "BRA 05", "fra007").
 */
function normalizeQuery(query: string): string {
  return query.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Parse a search query into { teamCode, number }.
 * Accepts formats like "FRA007", "BRA 05", "bra05", "ARG_12", "COL7".
 * Returns null if the query doesn't match the expected pattern.
 */
function parseQuery(query: string): { teamCode: string; number: number } | null {
  const cleaned = normalizeQuery(query);
  const match = cleaned.match(/^([A-Z]{3})(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[2], 10);
  if (num < 1 || num > 20) return null;
  return { teamCode: match[1], number: num };
}

/**
 * Build a multi-key lookup map for O(1) sticker search.
 *
 * Each sticker is indexed by:
 * 1. `TEAMCODE:NUMBER` (e.g. "BRA:5") — handles any input format
 * 2. Normalized album_code (e.g. "BRA05") — handles exact code input
 */
function buildLookup(): Map<string, Sticker> {
  const map = new Map<string, Sticker>();
  for (const s of stickers) {
    // Primary key: team code + sticker number (most robust)
    map.set(`${s.team_code}:${s.sticker_number}`, s);
    // Fallback key: normalized album_code (space-free uppercase)
    map.set(s.album_code.replace(/\s+/g, '').toUpperCase(), s);
  }
  return map;
}

/**
 * Search input with exact sticker code lookup across all 48 countries.
 *
 * Features:
 * - Accepts any format: "BRA 05", "bra05", "FRA007", "ARG_12", "COL7"
 * - Matches by team code + sticker number (robust parsing)
 * - Shows result card with image, name, country, and owned status
 * - Toggle ownership directly from the result
 * - "Not found" message for invalid or unknown codes
 * - Link to navigate to the country's album page
 * - Keyboard accessible: Enter to search
 */
export function AlbumSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Sticker | null>(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const isOwned = useAlbumStore((s) => s.isOwned);
  const toggleSticker = useAlbumStore((s) => s.toggleSticker);

  // Build lookup once on mount (960 entries, 1920 keys)
  const lookup = useMemo(() => buildLookup(), []);

  const ownedStatus = result ? isOwned(result.id) : false;

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResult(null);
      setNotFound(false);
      return;
    }

    const parsed = parseQuery(trimmed);
    if (parsed) {
      const found =
        lookup.get(`${parsed.teamCode}:${parsed.number}`) ??
        lookup.get(normalizeQuery(trimmed));
      if (found) {
        setResult(found);
        setNotFound(false);
        return;
      }
    }

    // Fallback: direct normalized lookup
    const normalized = normalizeQuery(trimmed);
    const fallback = lookup.get(normalized);
    if (fallback) {
      setResult(fallback);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  }, [query, lookup]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleNavigate = useCallback(() => {
    if (result) {
      navigate(`/country/${result.team_code}`);
    }
  }, [result, navigate]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Search input ── */}
      <div className="flex flex-col gap-3">
        <label
          htmlFor="sticker-search"
          className="font-heading text-sm font-bold text-ink uppercase tracking-wider"
        >
          Search by sticker code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/60 select-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              id="sticker-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "BRA 05" or "FRA007"'
              className="w-full pl-10 pr-4 py-3 font-body text-base text-ink
                         bg-white border-2 border-black rounded-comic
                         placeholder:text-ink-muted/50
                         focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2
                         transition-shadow duration-150"
              aria-label="Search by sticker code"
            />
          </div>
          <button
            onClick={handleSearch}
            className="font-heading text-sm font-bold uppercase tracking-wider
                       px-5 py-3 bg-ink text-white border-2 border-black rounded-comic
                       shadow-[3px_3px_0px_#1A1A2E]
                       hover:bg-ink/90 hover:shadow-[4px_4px_0px_#1A1A2E]
                       active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                       focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                       transition-all duration-150"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Not found message ── */}
      {notFound && (
        <div
          role="alert"
          className="p-5 rounded-comic border-2 border-black bg-paper-dark text-center animate-fade-in"
        >
          <p className="font-heading text-lg font-semibold text-ink-muted">
            Sticker not found
          </p>
          <p className="font-body text-sm text-ink-muted/70 mt-1">
            No sticker matches &ldquo;{query}&rdquo;. Try a valid code like
            &ldquo;BRA 05&rdquo; or &ldquo;ARG 12&rdquo;.
          </p>
        </div>
      )}

      {/* ── Result card ── */}
      {result && (
        <div
          className="p-5 rounded-comic border-2 border-black bg-paper-light
                      shadow-[4px_4px_0px_#1A1A2E] animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Sticker image */}
            <div className="w-32 h-40 sm:w-40 sm:h-48 flex-shrink-0 rounded-comic border-2 border-black overflow-hidden bg-paper-dark">
              <img
                src={result.image_path}
                alt={result.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h3 className="font-heading text-lg font-bold text-ink">
                {result.album_code}
              </h3>
              <p className="font-body text-base text-ink">{result.name}</p>
              <p className="font-body text-sm text-ink-muted">
                {result.team_name} ({result.team_code})
              </p>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block font-heading text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-black ${
                    ownedStatus
                      ? 'bg-neon-green/20 text-ink'
                      : 'bg-paper-dark text-ink-muted'
                  }`}
                >
                  {ownedStatus ? 'Owned ✓' : 'Missing'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => toggleSticker(result.id)}
                  className="font-heading text-xs font-bold uppercase tracking-wider
                             px-4 py-2 border-2 border-black rounded-comic
                             bg-neon-green/80 hover:bg-neon-green text-ink
                             shadow-[2px_2px_0px_#1A1A2E]
                             active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                             focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                             transition-all duration-150"
                  aria-label={
                    ownedStatus
                      ? `Remove ${result.album_code} from collection`
                      : `Mark ${result.album_code} as owned`
                  }
                >
                  {ownedStatus ? 'Remove' : 'Mark as Owned'}
                </button>
                <button
                  onClick={handleNavigate}
                  className="font-heading text-xs font-bold uppercase tracking-wider
                             px-4 py-2 border-2 border-black rounded-comic
                             bg-paper-dark hover:bg-ink/10 text-ink
                             shadow-[2px_2px_0px_#1A1A2E]
                             active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                             focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
                             transition-all duration-150"
                >
                  View {result.team_name} Album →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Initial helper ── */}
      {!result && !notFound && (
        <div className="text-center py-6">
          <p className="font-body text-sm text-ink-muted">
            Enter a sticker code to find it instantly across all 48 countries.
          </p>
        </div>
      )}

      {/* ── Search tips ── */}
      <details className="group">
        <summary className="font-body text-xs text-ink-muted/60 cursor-pointer hover:text-ink-muted transition-colors">
          Search tips
        </summary>
        <div className="mt-2 p-4 rounded-comic border border-black/10 bg-paper-dark/50">
          <ul className="font-body text-xs text-ink-muted/80 space-y-1 list-disc list-inside">
            <li>Any format works: &ldquo;BRA 05&rdquo;, &ldquo;bra05&rdquo;, &ldquo;FRA007&rdquo;</li>
            <li>Case-insensitive and whitespace-insensitive</li>
            <li>Numbers 1–20 per country</li>
          </ul>
        </div>
      </details>
    </div>
  );
}
