# Ren's House

An interactive personal house built with Next.js, React, TypeScript, and React Three Fiber.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

## Production checks

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

The production build is statically exported to `out/`. Preview that directory with a static server before deployment.

## Deployment

The site is configured for static hosting with `output: "export"`, trailing slashes, and unoptimized local images. Deploy the generated `out/` directory to Cloudflare Pages or GitHub Pages.

- Build command: `npm.cmd run build`
- Output directory: `out`

All visitor assets are served from `public/`; the 2.5D projector loads only when its SongPlayer section enters the viewport and keeps a static fallback for unavailable WebGL.

## Song publishing backend

The original source songs remain a runtime fallback. The `/songs-api/songs` Pages Function remains available for compatibility and diagnostics, backed by the server-only `SONGS_API_URL` variable. Browser management requests use the separate same-origin `/admin-api/*` Pages Function, which securely forwards the Pages Access assertion to the protected admin Worker. Both Workers share the existing D1/R2. See [worker/README.md](worker/README.md) for Access, local development, and deployment.

Published visitor content is synchronized before deployment with `npm run sync:songs`. The browser reads `/generated-data/songs.json`, whose media URLs point to same-origin `/generated-media/*` files; source songs remain the fallback if the snapshot is unavailable. See [docs/dual-static-deployment.md](docs/dual-static-deployment.md) for the shared Cloudflare Pages and Hong Kong Nginx release flow.

## Visitor analytics

Both public sites send `page_view` and `screen_view` events directly from the browser to the dedicated `rens-house-analytics` Worker configured by the public, non-secret `NEXT_PUBLIC_ANALYTICS_API_URL`. The Hong Kong Nginx server does not proxy analytics traffic.

The Worker derives the canonical hostname/site region, country/region, device class, bot flag, Beijing calendar date, and visitor IP. It stores plaintext IP for at most 90 days and uses a secret-key HMAC of IP plus Beijing date for daily UV; it never stores the complete User-Agent or referrer URL. Session IDs and first-touch attribution use `sessionStorage`, not cookies or localStorage.

The old Pages `/analytics-api/visit` Function and `analytics_visits` table remain temporarily for historical compatibility, but the new frontend does not double-submit to them. New reports use `analytics_event_records` from migration `worker/migrations/0003_visitor_analytics.sql`. See [worker/README.md](worker/README.md) and [docs/dual-static-deployment.md](docs/dual-static-deployment.md) for the exact migration, secret, Access, and deployment steps.
