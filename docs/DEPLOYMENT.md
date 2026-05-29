# Deployment Guide

This project is ready for Vercel as a static Vite application, but production assets need one explicit decision: sticker images should be hosted outside Git because the local image set is large.

## Vercel Settings

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20.x recommended |

`vercel.json` already defines these values and adds a rewrite so deep links like `/country/ARG` resolve to the React app.

## Required Environment Variables

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_STICKER_ASSET_BASE_URL=https://your-cdn-or-storage-domain
```

Do not set `VITE_API_PROXY_TARGET` in Vercel production. That variable is only for the local Vite development server.

## Sticker Asset Strategy

The app can read sticker images from either:

1. `public/stickers` during local development.
2. `VITE_STICKER_ASSET_BASE_URL` in production.

The local sticker folder is intentionally ignored by Git and Vercel. This keeps the repository and deployment source small, avoids accidental duplicate image uploads, and makes the frontend independent from a single hosting provider.

Recommended production layout:

```txt
https://your-cdn-or-storage-domain/stickers/ARG/ARG_01.png
https://your-cdn-or-storage-domain/stickers/BRA/BRA_05.png
```

The paths must match the catalog values in `album_stickers_final.json`.

## Deployment Checklist

- [ ] Backend API is public and reachable from the browser.
- [ ] Supabase Auth has the production Vercel URL in allowed redirect URLs.
- [ ] Sticker images are uploaded to CDN/storage using the same `/stickers/CODE/CODE_NN.png` structure.
- [ ] Vercel environment variables are configured for Production and Preview as needed.
- [ ] `npm run typecheck` passes locally.
- [ ] `npm run build` passes locally.
- [ ] Deep links are tested after deploy, for example `/country/ARG` and `/search`.

## Local Verification

```bash
npm run typecheck
npm run build
npm run preview
```

Open `http://localhost:4173` and verify:

- Dashboard loads.
- Login button appears when Supabase is configured.
- Country pages route correctly.
- Owned sticker images load from local `public/stickers` or configured asset base URL.
- Search and missing export work.

## Vercel Limit Note

Vercel's official limits page currently lists static file upload limits and source upload limits. Because this project has hundreds of sticker images, external asset hosting is the safer architecture for production instead of committing the full image set into Git.
