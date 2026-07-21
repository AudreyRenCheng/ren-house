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

The original source songs remain a runtime fallback. Production visitors load the committed same-origin snapshot at `/generated-data/songs.json`; its cover, audio, and extra URLs all point into `/generated-media/`. The `/songs-api/*` Function remains available for diagnostics, but the public UI does not depend on it. Browser management requests continue to use `/admin-api/*`. See [worker/README.md](worker/README.md) for Access and Worker deployment details.

## Publishing songs to the static site

The admin system remains the editing and source-media repository. Publishing a song in admin does not immediately change the static public site; synchronize and commit a new snapshot:

1. Create or edit the song in `/admin`, upload its media, and publish it.
2. From the repository root, run `npm run sync:songs`. Override the public source only when needed with `SONGS_SYNC_API_URL=https://example.com/api/songs`.
3. Run `npm run check:content` and inspect `public/generated-data/` and `public/generated-media/`.
4. Test with `npm run dev` or `npm run build`.
5. Commit the generated JSON and media, then push normally. Cloudflare Pages builds only the files already committed to Git; it does not contact the Worker during `npm install` or `npm run build`.

The sync is atomic: it downloads into a temporary directory and replaces only the two generated directories after every referenced file succeeds. A failed sync leaves the previous snapshot untouched. Unchanged URLs are reused through `sync-manifest.json`, and media no longer referenced by published songs disappears on the next successful replacement. Original hand-maintained files under `public/covers` and `public/audio` are never cleaned by this script.

The command warns for files of 25 MiB or more and refuses files at 95 MiB, before GitHub's 100 MiB single-file limit. Do not publish WAV masters this way; use an MP3 or another compressed listening copy. Even accepted media remains in Git history after later replacement, so repository size will grow over time. This simple workflow is appropriate while the catalog is small and should be revisited before media volume becomes large.

## Current mainland-stable public mode

The production Music Room currently reads only `data/staticSongs.ts`. It performs no runtime song JSON request and every public song points to a versioned same-origin asset under `public/music/`. The admin, D1, R2, Workers, Pages Functions, generated snapshot, and synchronization scripts remain available but are not dependencies of the public UI.

High-quality MP3 files are copied byte-for-byte into `public/music/audio/`; they are not transcoded. Covers are copied at their original useful resolution into `public/music/covers/`, so small originals are never artificially enlarged. Image memories use `public/music/extras/thumbs/` for the open projector's slide strip and `public/music/extras/full/` for only the selected image. The projector uses `public/music/projector/projector-static-v1.webp`; the 3D source remains in the repository but is not imported by the public component tree.

Assets under `/music/*` receive a one-year immutable cache header from `public/_headers`. When any public media content changes, create a new versioned filename (`-v2`, a content hash, or equivalent) and update `data/staticSongs.ts`; never replace different content at an existing immutable URL.
