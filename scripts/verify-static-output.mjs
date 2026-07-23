import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("out");
const songsPath = path.join(outDir, "generated-data", "songs.json");
const manifestPath = path.join(outDir, "generated-data", "sync-manifest.json");
const mediaDir = path.join(outDir, "generated-media");
const payload = JSON.parse(await readFile(songsPath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(payload?.songs)) throw new Error("out/generated-data/songs.json has no songs array");
if (!manifest?.files || typeof manifest.files !== "object") throw new Error("out sync manifest is invalid");

const directories = ["covers", "audio", "extras"];
for (const directory of directories) {
  const directoryPath = path.join(mediaDir, directory);
  const info = await stat(directoryPath);
  if (!info.isDirectory()) throw new Error(`not a directory: out/generated-media/${directory}`);
  await readdir(directoryPath);
}

for (const song of payload.songs) {
  const urls = [song.cover_url, song.audio_url, ...(song.extras ?? []).map((extra) => extra.file_url).filter(Boolean)];
  for (const url of urls) {
    if (typeof url !== "string" || !url.startsWith("/generated-media/")) throw new Error(`remote or invalid output media URL: ${url}`);
    const resolvedPath = path.resolve(outDir, ...url.slice(1).split("/"));
    const mediaRoot = `${path.resolve(outDir, "generated-media")}${path.sep}`;
    if (!resolvedPath.startsWith(mediaRoot)) throw new Error(`output media path escapes generated-media: ${url}`);
    const file = await stat(resolvedPath);
    if (!file.isFile() || file.size <= 0) throw new Error(`missing output media: ${url}`);
  }
}

console.log(`Static output OK: ${payload.songs.length} synced songs and ${Object.keys(manifest.files).length} manifest entries.`);
