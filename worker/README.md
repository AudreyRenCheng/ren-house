# Ren's House Worker APIs

One source entry, `src/index.ts`, is deployed twice. `API_MODE` hard-limits the routes before business logic runs. Both deployments bind the existing D1 database as `SONGS_DB` and existing R2 bucket as `SONGS_MEDIA`; there is one migration directory and no copied data.

## Deployments

### Public Worker: `rens-house-api`

Configuration: `wrangler.toml` (`wrangler.toml.example` is the template). It sets `API_MODE="public"` and only permits:

- `GET /api/songs`
- `GET /api/songs/:slug`
- `GET /media/*`
- `OPTIONS`

All `/api/admin/*` requests return 404 without reaching Access verification or mutation code. Deploy manually from `worker/` with:

```powershell
npx.cmd wrangler deploy --config wrangler.toml
```

### Admin Worker: `rens-house-admin-api`

Configuration: `wrangler.admin.toml` (`wrangler.admin.toml.example` is the template). It sets `API_MODE="admin"` and only permits `/api/admin/*` routes plus `OPTIONS`. Public song and media routes return 404. The media URLs returned by admin upload/detail responses deliberately point to the public Worker through `PUBLIC_MEDIA_BASE_URL`.

Before deployment, fill in the existing D1 database ID, existing R2 bucket name, Access team domain, and the **new admin Access application's** AUD. Deploy manually with:

```powershell
npx.cmd wrangler deploy --config wrangler.admin.toml
```

No migration is needed for this split. Do not recreate D1/R2 and do not reapply migration merely to deploy the second Worker.

## Cloudflare Access

Create a new self-hosted Access application for the entire admin Worker hostname, for example:

```text
https://rens-house-admin-api.YOUR_SUBDOMAIN.workers.dev/*
```

Set its policy to the allowed editor identities. Because this Worker has no public routes, the entire Worker can be Restricted safely. Copy this application's AUD into `wrangler.admin.toml` as `ACCESS_AUD`, and use the team domain as `ACCESS_TEAM_DOMAIN`. The Worker still cryptographically verifies `Cf-Access-Jwt-Assertion`; production denies missing, expired, incorrectly signed, wrong-issuer, or wrong-audience assertions.

The Pages Access application must protect both `/admin/*` and `/admin-api/*`. Keep its existing email Allow policy.

On the downstream admin Worker Access application, keep the existing user policy and add a Service Auth policy with the **Linked App Token** selector pointing to the Pages Access application. The Pages Function receives the Pages-scoped token in `Cf-Access-Jwt-Assertion` and forwards it as `Cf-Access-Token`. Access validates the linked token, issues a new assertion scoped to the admin Worker's AUD, and sends that assertion to the Worker. The Worker continues to validate it with jose. After setup, Access logs should attribute the downstream request to the original user.

## Pages variables

Configure the public build variable and the Pages Function runtime variable, then rebuild Pages:

```text
NEXT_PUBLIC_SONGS_API_URL=https://rens-house-api.YOUR_SUBDOMAIN.workers.dev
ADMIN_API_URL=https://rens-house-admin-api.YOUR_SUBDOMAIN.workers.dev
```

Keep `NEXT_PUBLIC_SONGS_API_URL`. Delete `NEXT_PUBLIC_ADMIN_API_URL`; browser code no longer reads it. `ADMIN_API_URL` is available only to the Pages Function and is not included in the static JavaScript bundle.

## Same-origin Pages Function proxy

The proxy entry is `functions/admin-api/[[path]].ts`. Browser requests such as `/admin-api/songs/123/publish` are mapped to `${ADMIN_API_URL}/api/admin/songs/123/publish`. It forwards method, query, streamed body, and Content-Type, including multipart uploads. It never forwards browser cookies and never logs the assertion. All responses use `no-store` cache headers.

`public/_routes.json` limits Pages Functions invocations to `/admin-api/*`; other paths remain ordinary static assets. The root `functions/` directory is intentionally outside `out/`. With Pages Git integration, Cloudflare deploys it alongside the `output: "export"` contents, while Next continues producing static `/`, `/admin`, and `/admin/song` pages in `out/`.

Pages deployment steps:

1. Keep build command `npm run build` and output directory `out`.
2. Add the runtime variable `ADMIN_API_URL` and retain `NEXT_PUBLIC_SONGS_API_URL`.
3. Remove `NEXT_PUBLIC_ADMIN_API_URL`.
4. Extend the Pages Access application so both `/admin/*` and `/admin-api/*` are protected.
5. Add the Linked App Token Service Auth policy to the admin Worker Access application, selecting the Pages application.
6. Trigger the normal Pages Git deployment. Do not copy `functions/` into `out/` manually.

## Local development

Copy `.dev.vars.example` to `.dev.vars`. `DEV_BYPASS_AUTH=true` is honored only with `ENVIRONMENT=development`; production defaults to deny. Run the public Worker on port 8787 and admin Worker on port 8788:

```powershell
npx.cmd wrangler dev --config wrangler.toml --port 8787
npx.cmd wrangler dev --config wrangler.admin.toml --port 8788
```

Point `.env.local` at those two origins using `env.example`. Never put Access secrets or audience values in the frontend.

## Behavior

- Public Worker: `GET /api/songs`, `GET /api/songs/:slug`, `GET /media/:key`. Queries select only published songs/extras.
- Admin Worker: song list/detail/create/update/publish/hide under `/api/admin/songs`.
- Extras: create at `/api/admin/songs/:songId/extras`; update/hide at `/api/admin/extras/:id`.
- Upload: `POST /api/admin/upload` with multipart `file`, `category`, `song_ref`.
- There is no permanent delete route. Hide retains all D1 rows and R2 objects.

Drafts may be incomplete. Publish checks unique slug, title, language, completion date, cover/audio, aligned lyric line counts, and valid extras. Lyrics are stored as newline-preserving text, including blank translation lines.

Generated keys are `covers/{songRef}/{uuid}.ext`, `audio/{songRef}/{uuid}.ext`, and `extras/{songRef}/{uuid}.ext`. MIME and extension must match. Limits are cover 10 MB, extra image 20 MB, audio 100 MB, video 250 MB. Replacement uploads use new keys; old referenced objects are retained. A later scheduled cleanup may remove only proven-unreferenced keys after a retention period.

## Manual verification

With local D1/R2 and the development bypass, verify new draft, refresh persistence, edit, cover/audio preview, multiple extras, lyrics with blank translated lines, publish, and hide. Disable bypass and verify every write/upload returns 401. Check public endpoints exclude draft/hidden rows and non-published extras. Stop the Worker or use an invalid frontend API origin and confirm the original static songs remain visible.

`analytics_events` reserves stable song/extra UUID relations for a later `POST /api/events` and the requested event names. It stores no names, emails, or raw IP addresses.
