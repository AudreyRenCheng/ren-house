# Ren's House songs API

The static Pages frontend calls this separate Worker. Text metadata lives in D1 (`SONGS_DB`) and media lives in R2 (`SONGS_MEDIA`).

## Cloudflare setup

1. Create a D1 database and R2 bucket in the Cloudflare dashboard. This repository does not create or deploy real resources.
2. Copy `wrangler.toml.example` to `wrangler.toml`. Fill in `database_id`, `bucket_name`, Pages origin, Access team domain, and the Access application audience tag. Keep binding names `SONGS_DB` and `SONGS_MEDIA`.
3. From `worker/`, initialize remote D1 with `npx wrangler d1 migrations apply rens-house-songs --remote`. Use `--local` for local D1.
4. Create Cloudflare Access self-hosted applications protecting both `https://YOUR_PAGES_DOMAIN/admin*` and `https://YOUR_WORKER_DOMAIN/api/admin/*`. Allow only editor identities. The Worker cryptographically verifies the Access JWT audience, so hiding `/admin` is never the write protection.
5. Deploy from `worker/` with `npx wrangler deploy` when ready.
6. Set Pages `NEXT_PUBLIC_SONGS_API_URL` to the deployed Worker origin and rebuild Pages. Set Worker `PUBLIC_MEDIA_BASE_URL` to that same Worker/custom-domain origin, and set `ALLOWED_ORIGIN` to the exact Pages origin.

The Access browser session must cover requests to the Worker. A compatible custom-domain setup is recommended; confirm `Cf-Access-Jwt-Assertion` reaches the Worker before publishing.

## Local development

Copy `.dev.vars.example` to `.dev.vars`. `DEV_BYPASS_AUTH=true` is honored only with `ENVIRONMENT=development`; production defaults to deny if Access data is absent or invalid. Run `npx wrangler dev` from `worker/`, and point `.env.local` at that origin using `env.example`. Never put Access secrets in the frontend.

## Behavior

- Public: `GET /api/songs`, `GET /api/songs/:slug`, `GET /media/:key`. Queries select only published songs/extras.
- Admin song list/detail/create/update/publish/hide live under `/api/admin/songs`.
- Extras: create at `/api/admin/songs/:songId/extras`; update/hide at `/api/admin/extras/:id`.
- Upload: `POST /api/admin/upload` with multipart `file`, `category`, `song_ref`.
- There is no permanent delete route. Hide retains all D1 rows and R2 objects.

Drafts may be incomplete. Publish checks unique slug, title, language, completion date, cover/audio, aligned lyric line counts, and valid extras. Lyrics are stored as newline-preserving text, including blank translation lines.

Generated keys are `covers/{songRef}/{uuid}.ext`, `audio/{songRef}/{uuid}.ext`, and `extras/{songRef}/{uuid}.ext`. MIME and extension must match. Limits are cover 10 MB, extra image 20 MB, audio 100 MB, video 250 MB. Replacement uploads use new keys; old referenced objects are retained. A later scheduled cleanup may remove only proven-unreferenced keys after a retention period.

## Manual verification

With local D1/R2 and the development bypass, verify new draft, refresh persistence, edit, cover/audio preview, multiple extras, lyrics with blank translated lines, publish, and hide. Disable bypass and verify every write/upload returns 401. Check public endpoints exclude draft/hidden rows and non-published extras. Stop the Worker or use an invalid frontend API origin and confirm the original static songs remain visible.

`analytics_events` reserves stable song/extra UUID relations for a later `POST /api/events` and the requested event names. It stores no names, emails, or raw IP addresses.
