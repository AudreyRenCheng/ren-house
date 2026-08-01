# Cloudflare Pages + Hong Kong static deployment

The Cloudflare admin Worker, public Worker, D1, and R2 remain the only content source. Visitor builds contain a published snapshot: song JSON plus local copies of every referenced cover, audio file, and extra. No Worker, R2, Access, or D1 credential is required by the browser or sync script.

## Content and build flow

Set `SONGS_SYNC_API_URL` only in the local shell or CI environment. It accepts either the public Worker root or its complete `/api/songs` address.

```powershell
npm.cmd run sync:songs
npm.cmd run check:content
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd run check:output
```

The sync uses a staging directory under `public/`, validates all downloads, and replaces `public/generated-data` and `public/generated-media` only after the entire snapshot succeeds. Its manifest reuses unchanged media from the previous snapshot. If sync fails, do not build or deploy; the previous generated snapshot remains available.

The resulting `out/` must contain:

```text
generated-data/songs.json
generated-data/sync-manifest.json
generated-media/covers/*
generated-media/audio/*
generated-media/extras/*
```

Deploy this same `out` artifact to both targets. A single CI job that syncs and builds once is preferred; two independent builds can capture different publication moments.

Cloudflare Pages may retain `/songs-api/*` for diagnostics or future compatibility, but visitor song playback reads the generated snapshot and generated media. Pages Access must continue to protect `/admin/*` and `/admin-api/*`.

## Hong Kong releases

Use versioned release directories instead of overwriting the live directory:

```text
/var/www/ren-house/releases/<timestamp>
/var/www/ren-house/current -> /var/www/ren-house/releases/<timestamp>
```

Upload the complete `out/` into a new release directory, verify required files there, then atomically replace the `current` symlink. Keep at least the previous release so rollback only requires repointing `current`. Never empty `current` while uploading.

Install and adapt `deploy/nginx/ren-house.conf.example`, test with `nginx -t`, then reload Nginx. The example blocks `/admin`, `/admin-api`, `/songs-api`, and `/analytics-api` on the Hong Kong host. It gives generated JSON revalidation headers and immutable caching to UUID/versioned media while preserving Nginx static byte-range support.

## Environment and secret boundaries

- `SONGS_SYNC_API_URL`: local/CI sync process only; it is a public read endpoint and is never emitted into JavaScript.
- `SONGS_API_URL`, `ADMIN_API_URL`, and `ANALYTICS_DB`: Cloudflare Pages Functions runtime configuration only.
- Cloudflare deployment tokens and SSH credentials: CI secret store only.
- Access AUD/team settings and D1/R2 bindings: Worker configuration only.
- Do not introduce a `NEXT_PUBLIC_SONGS_API_URL`; visitor content is root-relative static data.

Generated `public/generated-*` directories are deployment inputs. Decide whether CI creates them or a reviewed snapshot is committed, but do not mix both policies. For one identical artifact across both hosts, build once in CI and deploy that artifact twice.

## Dual-site visitor analytics

Set the same public build value for the shared artifact:

```text
NEXT_PUBLIC_ANALYTICS_API_URL=https://analytics.foundren.win
```

Browsers on both sites POST directly to this Worker. The Worker maps exact Origins server-side:

```text
https://ren-house.pages.dev  -> global / ren-house.pages.dev
https://foundren.win         -> hk / foundren.win
https://www.foundren.win     -> hk / foundren.win
```

The client cannot choose its hostname, site region, IP, country, region, device type, bot flag, or Beijing date. Nginx must continue returning 404 for its own `/analytics-api/*` route and must not add `proxy_pass`; the external Worker URL bypasses Nginx.

The frontend stores a random session UUID and first-touch source only in `sessionStorage`. Refreshing a tab keeps its visit/session, while a new tab creates a new visit. There are no analytics cookies, localStorage visitor IDs, or browser fingerprints.

The legacy Pages Function `functions/analytics-api/visit.ts` remains deployed only for compatibility with historical data. The new frontend sends exclusively to the external Worker, so there is no double counting. It can be removed only after production verification confirms no old client still depends on it.

Before deploying analytics:

1. Fill the existing D1 database ID in `worker/wrangler.analytics.toml`.
2. Apply migration `0003_visitor_analytics.sql` once to `ren-house-db`.
3. Set `ANALYTICS_HMAC_SECRET` with `wrangler secret put`.
4. Deploy `rens-house-analytics`; confirm its scheduled trigger is present.
5. Deploy the Admin Worker changes.
6. Build both static sites with the same `NEXT_PUBLIC_ANALYTICS_API_URL`.
7. Verify exact CORS responses from all three production Origins.

All event timestamps are stored as UTC ISO strings. The Worker also stores an indexed `beijing_date` generated server-side, and all new reports filter/group by that Asia/Shanghai natural date. Plaintext IP is visible only through Access-protected admin APIs and is cleared after 90 days; aggregate-compatible rows remain.

## Publishing one song

1. Edit and publish through the existing Access-protected admin.
2. Confirm the public Worker returns the published song and extras.
3. Run the sync and content check.
4. Run lint, TypeScript, build, and output check.
5. Deploy the same `out` artifact to Pages and a new Hong Kong release directory.
6. Switch the Hong Kong `current` symlink only after verification.
7. Confirm both hosts return root-relative song JSON and their own same-origin media URLs.
