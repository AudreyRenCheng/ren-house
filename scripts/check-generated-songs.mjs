import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const publicDir = path.resolve("public");
const jsonPath = path.join(publicDir, "generated-data", "songs.json");
const rawJson = await readFile(jsonPath, "utf8");
if (/workers\.dev\/media|https?:\/\/[^\"]+\/media\//i.test(rawJson)) {
  throw new Error("generated songs.json still contains a remote media URL");
}
const payload = JSON.parse(rawJson);
if (!Array.isArray(payload?.songs)) throw new Error("generated songs.json has no songs array");

let mediaCount = 0;
let totalBytes = 0;
for (const song of payload.songs) {
  for (const key of ["id", "slug", "original_title", "language", "completed_at", "shelf_order", "status"]) {
    if (song[key] === undefined || song[key] === null || song[key] === "") {
      throw new Error(`generated song ${song.slug ?? song.id ?? "unknown"} is missing ${key}`);
    }
  }
  if (song.status !== "published") throw new Error(`generated song ${song.slug} is not published`);
  for (const [kind, url] of [
    ["cover", song.cover_url], ["audio", song.audio_url],
    ...(song.extras ?? []).filter((extra) => extra.file_url).map((extra) => [`extra:${extra.id}`, extra.file_url]),
  ]) {
    if (typeof url !== "string" || !url.startsWith("/generated-media/")) {
      throw new Error(`${song.slug} ${kind} is not a generated Pages URL: ${url}`);
    }
    if (/workers\.dev|https?:\/\//i.test(url)) throw new Error(`${song.slug} ${kind} still uses a remote URL: ${url}`);
    const localPath = path.join(publicDir, ...url.slice(1).split("/"));
    const file = await stat(localPath);
    if (!file.isFile() || file.size === 0) throw new Error(`${song.slug} ${kind} is missing or empty: ${url}`);
    mediaCount += 1;
    totalBytes += file.size;
  }
}

console.log(`Generated content OK: ${payload.songs.length} songs, ${mediaCount} media files, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB.`);
