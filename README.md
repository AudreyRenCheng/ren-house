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

The original source songs remain a runtime fallback. `NEXT_PUBLIC_SONGS_API_URL` points to the public read/media Worker. Browser management requests use the same-origin `/admin-api/*` Pages Function, which securely forwards the Pages Access assertion to the separately protected admin Worker. Both Workers share the existing D1/R2. See [worker/README.md](worker/README.md) for Access, local development, and deployment.
