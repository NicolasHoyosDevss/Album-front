// TODO: Backend (Supabase)
// Future contract:
//   POST /api/owned  body: { stickerIds: string[] }
//   GET  /api/owned  → { stickerIds: string[] }
// Auth TBD — currently localStorage-only.

/** No-op stub: fetch owned stickers from backend. */
export async function fetchOwnedStickers(): Promise<string[]> {
  return [];
}

/** No-op stub: persist owned stickers to backend. */
export async function saveOwnedStickers(_owned: string[]): Promise<void> {
  // TODO: Backend — POST /api/owned
}
