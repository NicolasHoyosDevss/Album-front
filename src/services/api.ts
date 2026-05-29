import { API_BASE_URL } from '../config/env';
import { supabase } from './supabase';

/** Custom error class for API responses with a status code. */
export class ApiError extends Error {
  /** HTTP status code (0 for network errors). */
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface AlbumResponse {
  id: string;
  nickname: string;
  updatedAt: string;
}

export interface ProgressResponse {
  album: AlbumResponse;
  progress: Record<string, number>;
}

export interface TeamProgressResponse {
  album: AlbumResponse;
  teamCode: string;
  progress: Record<string, number>;
}

export interface CreateAlbumResponse {
  album: AlbumResponse;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();

  if (!data.session?.access_token) {
    return {};
  }

  return { Authorization: `Bearer ${data.session.access_token}` };
}

/**
 * Generic JSON fetch wrapper with error handling.
 * Throws `ApiError` on non-2xx responses or network failures.
 */
async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await getAuthHeaders()),
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let message = 'Request failed';
      try {
        const errorBody = await response.json();
        message =
          typeof errorBody?.message === 'string'
            ? errorBody.message
            : typeof errorBody?.error === 'string'
              ? errorBody.error
              : message;
      } catch {
        message = response.statusText || message;
      }
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
    );
  }
}

/** GET /health — Check backend connectivity. */
export async function checkHealth(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>('GET', '/health');
}

/** POST /me/album — Create the current user's album. */
export async function createAlbum(
  nickname: string,
): Promise<CreateAlbumResponse> {
  return apiRequest<CreateAlbumResponse>('POST', '/me/album', { nickname });
}

/** GET /me/album — Fetch the current user's album metadata. */
export async function getMyAlbum(): Promise<{ album: AlbumResponse }> {
  return apiRequest<{ album: AlbumResponse }>('GET', '/me/album');
}

/** GET /me/album/progress — Fetch the current user's full album progress. */
export async function getMyAlbumProgress(): Promise<ProgressResponse> {
  return apiRequest<ProgressResponse>('GET', '/me/album/progress');
}

/** GET /me/album/progress/team/:teamCode — Fetch per-team progress. */
export async function getAlbumTeamProgress(
  teamCode: string,
): Promise<TeamProgressResponse> {
  return apiRequest<TeamProgressResponse>(
    'GET',
    `/me/album/progress/team/${encodeURIComponent(teamCode)}`,
  );
}

/** PUT /me/album/stickers/:stickerCode — Set sticker quantity. */
export async function setStickerQuantity(
  stickerCode: string,
  quantity: number,
): Promise<void> {
  await apiRequest<void>(
    'PUT',
    `/me/album/stickers/${encodeURIComponent(stickerCode)}`,
    { quantity },
  );
}

/** POST /me/album/stickers/:stickerCode/increment — Increment count. */
export async function incrementSticker(
  stickerCode: string,
  amount = 1,
): Promise<void> {
  await apiRequest<void>(
    'POST',
    `/me/album/stickers/${encodeURIComponent(stickerCode)}/increment`,
    { amount },
  );
}

/** POST /me/album/stickers/:stickerCode/decrement — Decrement count. */
export async function decrementSticker(
  stickerCode: string,
  amount = 1,
): Promise<void> {
  await apiRequest<void>(
    'POST',
    `/me/album/stickers/${encodeURIComponent(stickerCode)}/decrement`,
    { amount },
  );
}

/** PUT /me/album/stickers — Batch update sticker quantities. */
export async function batchUpdateStickers(
  stickers: Record<string, number>,
): Promise<void> {
  await apiRequest<void>('PUT', '/me/album/stickers', { stickers });
}
