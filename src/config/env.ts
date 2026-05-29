const DEFAULT_API_BASE_URL = '/api';
const DEFAULT_STICKER_ASSET_BASE_URL = '';

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

/** Base URL for backend API calls. Configure with VITE_API_URL. */
export const API_BASE_URL: string = normalizeBaseUrl(
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE_URL,
);

/** Supabase Auth project URL. */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL?.trim() || '';

/** Supabase public anon key for browser auth. */
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

/**
 * Optional public base URL for sticker images.
 *
 * Keep this empty when images are served from the app's public/stickers folder.
 * Set it in production when images are hosted in external storage/CDN.
 */
export const STICKER_ASSET_BASE_URL: string = normalizeBaseUrl(
  import.meta.env.VITE_STICKER_ASSET_BASE_URL?.trim() ||
    DEFAULT_STICKER_ASSET_BASE_URL,
);
