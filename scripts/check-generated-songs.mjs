import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const publicDir = path.resolve("public");
const dataDir = path.join(publicDir, "generated-data");
const payload = JSON.parse(await readFile(path.join(dataDir, "songs.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(dataDir, "sync-manifest.json"), "utf8"));
if (!Array.isArray(payload?.songs)) throw new Error("generated songs.json has no songs array");
if (manifest?.version !== 1 || !manifest.files || typeof manifest.files !== "object") throw new Error("sync-manifest.json is invalid");

const referencedPaths = new Set();
let totalBytes = 0;
for (const song of payload.songs) {
  for (const key of ["id", "slug", "original_title", "language", "completed_at", "shelf_order", "status"]) {
    if (song[key] === undefined || song[key] === null || song[key] === "") throw new Error(`generated song ${song.slug ?? song.id ?? "unknown"} is missing ${key}`);
  }
  if (song.status !== "published") throw new Error(`generated song ${song.slug} is not published`);
  const media = [
    ["cover", song.cover_url], ["audio", song.audio_url],
    ...(song.extras ?? []).filter((extra) => extra.file_url).map((extra) => [`extra:${extra.id}`, extra.file_url]),
  ];
  for (const [kind, url] of media) {
    if (typeof url !== "string" || !url.startsWith("/generated-media/") || url.startsWith("//")) {
      throw new Error(`${song.slug} ${kind} is not a root-relative generated media URL: ${url}`);
    }
    if (/https?:\/\/|workers\.dev|r2\.dev/i.test(url)) throw new Error(`${song.slug} ${kind} still uses a remote URL: ${url}`);
    const relativePath = url.slice(1);
    const resolvedPath = path.resolve(publicDir, ...relativePath.split("/"));
    const mediaRoot = `${path.resolve(publicDir, "generated-media")}${path.sep}`;
    if (!resolvedPath.startsWith(mediaRoot)) throw new Error(`media path escapes generated-media: ${url}`);
    const file = await stat(resolvedPath);
    if (!file.isFile() || file.size <= 0) throw new Error(`${song.slug} ${kind} is missing or empty: ${url}`);
    referencedPaths.add(relativePath);
    totalBytes += file.size;
  }
}

const manifestPaths = new Set();
for (const [remoteUrl, entry] of Object.entries(manifest.files)) {
  if (!/^https?:\/\//.test(remoteUrl)) throw new Error(`manifest source is not an HTTP URL: ${remoteUrl}`);
  if (!entry?.path || !referencedPaths.has(entry.path)) throw new Error(`manifest contains an unreferenced path: ${entry?.path ?? "missing"}`);
  const resolvedPath = path.resolve(publicDir, ...entry.path.split("/"));
  const mediaRoot = `${path.resolve(publicDir, "generated-media")}${path.sep}`;
  if (!resolvedPath.startsWith(mediaRoot)) throw new Error(`manifest path escapes generated-media: ${entry.path}`);
  const file = await stat(resolvedPath);
  if (file.size !== entry.size || file.size <= 0) throw new Error(`manifest size mismatch: ${entry.path}`);
  manifestPaths.add(entry.path);
}
for (const mediaPath of referencedPaths) if (!manifestPaths.has(mediaPath)) throw new Error(`media is missing from manifest: ${mediaPath}`);

console.log(`Generated content OK: ${payload.songs.length} songs, ${referencedPaths.size} media files, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB.`);
