import { copyFile, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_API_URL = "https://rens-house-api.chengbecky2021.workers.dev/api/songs";
const API_URL = process.env.SONGS_SYNC_API_URL || DEFAULT_API_URL;
const PUBLIC_DIR = path.resolve("public");
const DATA_DIR = path.join(PUBLIC_DIR, "generated-data");
const MEDIA_DIR = path.join(PUBLIC_DIR, "generated-media");
const STAGING_ROOT = path.join(PUBLIC_DIR, `.generated-sync-${process.pid}`);
const STAGING_DATA = path.join(STAGING_ROOT, "generated-data");
const STAGING_MEDIA = path.join(STAGING_ROOT, "generated-media");
const MANIFEST_PATH = path.join(DATA_DIR, "sync-manifest.json");
const WARN_BYTES = 25 * 1024 * 1024;
const BLOCK_BYTES = 95 * 1024 * 1024;

const formats = {
  cover: new Map([
    ["jpg", ["image/jpeg"]], ["jpeg", ["image/jpeg"]], ["png", ["image/png"]],
    ["webp", ["image/webp"]],
  ]),
  audio: new Map([
    ["mp3", ["audio/mpeg", "audio/mp3"]], ["m4a", ["audio/mp4", "audio/x-m4a"]],
    ["wav", ["audio/wav", "audio/x-wav", "audio/vnd.wave"]],
  ]),
  extra: new Map([
    ["jpg", ["image/jpeg"]], ["jpeg", ["image/jpeg"]], ["png", ["image/png"]],
    ["webp", ["image/webp"]], ["mp3", ["audio/mpeg", "audio/mp3"]],
    ["m4a", ["audio/mp4", "audio/x-m4a"]], ["wav", ["audio/wav", "audio/x-wav", "audio/vnd.wave"]],
    ["mp4", ["video/mp4"]], ["webm", ["video/webm"]], ["mov", ["video/quicktime"]],
  ]),
};

function safePart(value, fallback) {
  const cleaned = String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
  return cleaned || fallback;
}

function mediaName(url, song, kind, extra) {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error(`unsupported URL protocol: ${url}`);
  const original = decodeURIComponent(parsed.pathname.split("/").pop() || "");
  const extension = path.extname(original).slice(1).toLowerCase();
  if (!extension || !formats[kind].has(extension)) {
    throw new Error(`unsupported ${kind} extension for ${song.slug}: ${url}`);
  }
  const originalBase = safePart(path.basename(original, path.extname(original)), "media");
  const prefix = extra
    ? `${safePart(song.slug, safePart(song.id, "song"))}--${safePart(extra.id, "extra")}`
    : safePart(song.slug, safePart(song.id, "song"));
  return { filename: `${prefix}--${originalBase}.${extension}`, extension };
}

async function existingManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return { version: 1, files: {} };
  }
}

function assertApiSong(song) {
  for (const key of ["id", "slug", "original_title", "language", "completed_at"]) {
    if (!song?.[key]) throw new Error(`song is missing ${key}: ${song?.id ?? "unknown"}`);
  }
  if (!song.cover_url) throw new Error(`song ${song.slug} is missing cover_url`);
  if (!song.audio_url) throw new Error(`song ${song.slug} is missing audio_url`);
}

async function downloadMedia({ url, song, kind, extra, subdirectory, oldManifest, nextManifest }) {
  const { filename, extension } = mediaName(url, song, kind, extra);
  const relativePath = path.posix.join("generated-media", subdirectory, filename);
  const outputPath = path.join(STAGING_MEDIA, subdirectory, filename);
  const previous = oldManifest.files?.[url];
  const previousPath = previous?.path ? path.join(PUBLIC_DIR, ...previous.path.split("/")) : null;

  if (previousPath && previous.path === relativePath && previous.size > 0) {
    try {
      const previousStat = await stat(previousPath);
      if (previousStat.isFile() && previousStat.size === previous.size) {
        await copyFile(previousPath, outputPath);
        nextManifest.files[url] = previous;
        console.log(`reuse ${kind.padEnd(5)} ${formatBytes(previous.size)}  /${relativePath}`);
        return `/${relativePath}`;
      }
    } catch {
      // Download again when the previous generated file is unavailable or incomplete.
    }
  }

  const response = await fetch(url, {
    headers: { accept: "*/*", "user-agent": "rens-house-song-sync/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${song.slug} ${kind} ${url}: HTTP ${response.status}`);
  const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  const allowedTypes = formats[kind].get(extension);
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`${song.slug} ${kind} ${url}: expected ${allowedTypes.join("/")}, received ${contentType || "no Content-Type"}`);
  }
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength >= BLOCK_BYTES) {
    throw new Error(`${song.slug} ${kind} ${url}: ${formatBytes(declaredLength)} approaches GitHub's 100 MiB limit`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error(`${song.slug} ${kind} ${url}: empty response`);
  if (bytes.byteLength >= BLOCK_BYTES) {
    throw new Error(`${song.slug} ${kind} ${url}: ${formatBytes(bytes.byteLength)} approaches GitHub's 100 MiB limit`);
  }
  await writeFile(outputPath, bytes);
  const warning = bytes.byteLength >= WARN_BYTES ? "  WARNING: large Git file" : "";
  const wavWarning = extension === "wav" ? "  WARNING: use a compressed listening file instead of WAV" : "";
  console.log(`fetch ${kind.padEnd(5)} ${formatBytes(bytes.byteLength)}  /${relativePath}${warning}${wavWarning}`);
  nextManifest.files[url] = {
    path: relativePath,
    size: bytes.byteLength,
    etag: response.headers.get("etag"),
    content_type: contentType,
  };
  return `/${relativePath}`;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

async function swapGeneratedDirectories() {
  const swaps = [
    { staged: STAGING_MEDIA, target: MEDIA_DIR, backup: `${MEDIA_DIR}.previous-${process.pid}` },
    { staged: STAGING_DATA, target: DATA_DIR, backup: `${DATA_DIR}.previous-${process.pid}` },
  ];
  const completed = [];
  try {
    for (const item of swaps) {
      let hadTarget = false;
      try {
        await rename(item.target, item.backup);
        hadTarget = true;
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
      try {
        await rename(item.staged, item.target);
        completed.push({ ...item, hadTarget });
      } catch (error) {
        if (hadTarget) await rename(item.backup, item.target);
        throw error;
      }
    }
  } catch (error) {
    for (const item of completed.reverse()) {
      await rm(item.target, { recursive: true, force: true });
      if (item.hadTarget) await rename(item.backup, item.target);
    }
    throw error;
  }
  for (const item of completed) {
    if (item.hadTarget) await rm(item.backup, { recursive: true, force: true });
  }
}

async function main() {
  console.log(`Syncing published songs from ${API_URL}`);
  const oldManifest = await existingManifest();
  const nextManifest = { version: 1, source: API_URL, synced_at: new Date().toISOString(), files: {} };
  await rm(STAGING_ROOT, { recursive: true, force: true });
  await Promise.all([
    mkdir(path.join(STAGING_MEDIA, "covers"), { recursive: true }),
    mkdir(path.join(STAGING_MEDIA, "audio"), { recursive: true }),
    mkdir(path.join(STAGING_MEDIA, "extras"), { recursive: true }),
    mkdir(STAGING_DATA, { recursive: true }),
  ]);

  const response = await fetch(API_URL, {
    headers: { accept: "application/json", "user-agent": "rens-house-song-sync/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`songs API returned HTTP ${response.status}: ${API_URL}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.songs)) throw new Error("songs API did not return a songs array");
  const publishedSongs = payload.songs.filter((song) => !song.status || song.status === "published");
  if (publishedSongs.length === 0 && process.env.SONGS_SYNC_ALLOW_EMPTY !== "true") {
    throw new Error("songs API returned no published songs; refusing to replace existing generated content");
  }
  const outputSongs = [];

  for (const song of publishedSongs) {
    assertApiSong(song);
    try {
      const cover_url = await downloadMedia({
        url: song.cover_url, song, kind: "cover", subdirectory: "covers", oldManifest, nextManifest,
      });
      const audio_url = await downloadMedia({
        url: song.audio_url, song, kind: "audio", subdirectory: "audio", oldManifest, nextManifest,
      });
      const extras = [];
      for (const extra of song.extras ?? []) {
        let file_url = extra.file_url ?? null;
        if (file_url) {
          file_url = await downloadMedia({
            url: file_url, song, extra, kind: "extra", subdirectory: "extras", oldManifest, nextManifest,
          });
        }
        extras.push({ ...extra, file_url });
      }
      outputSongs.push({ ...song, status: song.status ?? "published", cover_url, audio_url, extras });
    } catch (error) {
      throw new Error(`failed to sync song ${song.slug}: ${error instanceof Error ? error.message : error}`);
    }
  }

  outputSongs.sort((a, b) => Number(a.shelf_order ?? 0) - Number(b.shelf_order ?? 0) || String(a.id).localeCompare(String(b.id)));
  await writeFile(path.join(STAGING_DATA, "songs.json"), `${JSON.stringify({ songs: outputSongs }, null, 2)}\n`);
  await writeFile(path.join(STAGING_DATA, "sync-manifest.json"), `${JSON.stringify(nextManifest, null, 2)}\n`);
  await swapGeneratedDirectories();
  await rm(STAGING_ROOT, { recursive: true, force: true });
  console.log(`Sync complete: ${outputSongs.length} songs, ${Object.keys(nextManifest.files).length} media files.`);
}

main().catch(async (error) => {
  console.error(`Song sync failed: ${error instanceof Error ? error.message : error}`);
  console.error("The previous generated content was left unchanged.");
  await rm(STAGING_ROOT, { recursive: true, force: true }).catch(() => {});
  process.exitCode = 1;
});
