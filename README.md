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

The original source songs remain a runtime fallback. Browser song-list requests use the same-origin `/songs-api/songs` Pages Function, backed by the server-only `SONGS_API_URL` variable. Browser management requests use the separate same-origin `/admin-api/*` Pages Function, which securely forwards the Pages Access assertion to the protected admin Worker. Both Workers share the existing D1/R2. See [worker/README.md](worker/README.md) for Access, local development, and deployment.

## Anonymous regional analytics

`/analytics-api/visit` records one anonymous visit after each complete page load. The browser sends only the channel source; country and region are taken from Cloudflare's approximate IP geolocation in `request.cf`. VPNs and mobile networks can make these values inaccurate.

The record contains only a random event ID, country, region, source, and UTC visit time. It does not store the original IP, city, postal code, coordinates, user agent, referrer URL, personal identity, cookies, or a persistent visitor identifier.

Before deploying, apply `worker/migrations/0002_analytics_visits.sql` to the existing `ren-house-db`, then add this Pages runtime binding in **Settings → Functions → D1 database bindings**:

```text
Binding name: ANALYTICS_DB
Database: ren-house-db
```

Do not put a database ID in frontend environment variables. The protected admin Worker reuses its existing `SONGS_DB` binding to show 30-day region and source aggregates.
