import { copyFile, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_API_ROOT = "https://rens-house-api.chengbecky2021.workers.dev";
const PUBLIC_DIR = path.resolve("public");
const DATA_DIR = path.join(PUBLIC_DIR, "generated-data");
const MEDIA_DIR = path.join(PUBLIC_DIR, "generated-media");
const STAGING_ROOT = path.join(PUBLIC_DIR, `.generated-sync-${process.pid}`);
const STAGING_DATA = path.join(STAGING_ROOT, "generated-data");
const STAGING_MEDIA = path.join(STAGING_ROOT, "generated-media");
const MANIFEST_PATH = path.join(DATA_DIR, "sync-manifest.json");
const WARN_BYTES = 25 * 1024 * 1024;
const BLOCK_BYTES = 95 * 1024 * 1024;
const usedOutputPaths = new Map();

const formats = {
  cover: new Map([
    ["jpg", ["image/jpeg"]], ["jpeg", ["image/jpeg"]], ["png", ["image/png"]], ["webp", ["image/webp"]],
  ]),
  image: new Map([
    ["jpg", ["image/jpeg"]], ["jpeg", ["image/jpeg"]], ["png", ["image/png"]], ["webp", ["image/webp"]],
  ]),
  audio: new Map([
    ["mp3", ["audio/mpeg", "audio/mp3"]], ["m4a", ["audio/mp4", "audio/x-m4a"]],
    ["wav", ["audio/wav", "audio/x-wav", "audio/vnd.wave"]],
  ]),
  video: new Map([
    ["mp4", ["video/mp4"]], ["webm", ["video/webm"]], ["mov", ["video/quicktime"]],
  ]),
};

function songsApiUrl(value) {
  const url = new URL(value || DEFAULT_API_ROOT);
  if (!/^https?:$/.test(url.protocol)) throw new Error("SONGS_SYNC_API_URL must use http or https");
  if (url.username || url.password) throw new Error("SONGS_SYNC_API_URL must not contain credentials");
  url.hash = "";
  url.search = "";
  if (!/\/api\/songs\/?$/.test(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/$/, "")}/api/songs`;
  }
  return url.href;
}

const API_URL = songsApiUrl(process.env.SONGS_SYNC_API_URL);

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
  try { return JSON.parse(await readFile(MANIFEST_PATH, "utf8")); }
  catch { return { version: 1, files: {} }; }
}

function assertApiSong(song) {
  for (const key of ["id", "slug", "original_title", "language", "completed_at"]) {
    if (!song?.[key]) throw new Error(`song is missing ${key}: ${song?.id ?? "unknown"}`);
  }
  if (!song.cover_url) throw new Error(`song ${song.slug} is missing cover_url`);
  if (!song.audio_url) throw new Error(`song ${song.slug} is missing audio_url`);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function renameWithRetry(source, target) {
  let lastError;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try { await rename(source, target); return; }
    catch (error) {
      lastError = error;
      if (!["EPERM", "EACCES", "EBUSY"].includes(error?.code) || attempt === 8) throw error;
      await wait(attempt * 150);
    }
  }
  throw lastError;
}

async function downloadMedia({ url, song, kind, extra, subdirectory, oldManifest, nextManifest }) {
  const { filename, extension } = mediaName(url, song, kind, extra);
  const relativePath = path.posix.join("generated-media", subdirectory, filename);
  const outputPath = path.join(STAGING_MEDIA, subdirectory, filename);
  const existingSource = usedOutputPaths.get(relativePath);
  if (existingSource && existingSource !== url) throw new Error(`generated filename collision: ${relativePath}`);
  usedOutputPaths.set(relativePath, url);
  const previous = oldManifest.files?.[url];
  const expectedPrefix = `generated-media/${subdirectory}/`;
  const reusablePath = typeof previous?.path === "string" && previous.path.startsWith(expectedPrefix) && !previous.path.includes("..")
    ? previous.path
    : null;
  const previousPath = reusablePath ? path.join(PUBLIC_DIR, ...reusablePath.split("/")) : null;

  if (previousPath && previous.path === relativePath && previous.size > 0 && formats[kind].get(extension)?.includes(previous.content_type)) {
    try {
      const previousStat = await stat(previousPath);
      if (previousStat.isFile() && previousStat.size === previous.size) {
        await copyFile(previousPath, outputPath);
        nextManifest.files[url] = previous;
        console.log(`reuse ${kind.padEnd(5)} ${formatBytes(previous.size)}  /${relativePath}`);
        return `/${relativePath}`;
      }
    } catch {
      // Missing or incomplete cached media is downloaded again.
    }
  }

  const response = await fetch(url, {
    headers: { accept: "*/*", "user-agent": "rens-house-song-sync/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${song.slug} ${kind} ${url}: HTTP ${response.status}`);
  if (!/^https?:$/.test(new URL(response.url).protocol)) throw new Error(`${song.slug} ${kind}: redirect used an unsupported protocol`);
  const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  const allowedTypes = formats[kind].get(extension);
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`${song.slug} ${kind} ${url}: expected ${allowedTypes.join("/")}, received ${contentType || "no Content-Type"}`);
  }
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength >= BLOCK_BYTES) throw new Error(`${song.slug} ${kind}: ${formatBytes(declaredLength)} exceeds the safe static-file limit`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error(`${song.slug} ${kind} ${url}: empty response`);
  if (bytes.byteLength >= BLOCK_BYTES) throw new Error(`${song.slug} ${kind}: ${formatBytes(bytes.byteLength)} exceeds the safe static-file limit`);
  await writeFile(outputPath, bytes);
  const warning = bytes.byteLength >= WARN_BYTES ? "  WARNING: large static file" : "";
  console.log(`fetch ${kind.padEnd(5)} ${formatBytes(bytes.byteLength)}  /${relativePath}${warning}`);
  nextManifest.files[url] = {
    path: relativePath,
    size: bytes.byteLength,
    etag: response.headers.get("etag"),
    content_type: contentType,
  };
  return `/${relativePath}`;
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
      try { await renameWithRetry(item.target, item.backup); hadTarget = true; }
      catch (error) { if (error?.code !== "ENOENT") throw error; }
      try { await renameWithRetry(item.staged, item.target); completed.push({ ...item, hadTarget }); }
      catch (error) { if (hadTarget) await renameWithRetry(item.backup, item.target); throw error; }
    }
  } catch (error) {
    for (const item of completed.reverse()) {
      await rm(item.target, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
      if (item.hadTarget) await renameWithRetry(item.backup, item.target);
    }
    throw error;
  }
  for (const item of completed) {
    if (item.hadTarget) await rm(item.backup, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
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
  const apiContentType = (response.headers.get("content-type") || "").toLowerCase();
  if (!apiContentType.includes("application/json")) throw new Error(`songs API returned unexpected Content-Type: ${apiContentType || "missing"}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.songs)) throw new Error("songs API did not return a songs array");
  const publishedSongs = payload.songs.filter((song) => !song.status || song.status === "published");
  if (!publishedSongs.length && process.env.SONGS_SYNC_ALLOW_EMPTY !== "true") {
    throw new Error("songs API returned no published songs; refusing to replace existing generated content");
  }

  const outputSongs = [];
  const songIds = new Set();
  const songSlugs = new Set();
  for (const song of publishedSongs) {
    assertApiSong(song);
    if (songIds.has(song.id)) throw new Error(`duplicate song id: ${song.id}`);
    if (songSlugs.has(song.slug)) throw new Error(`duplicate song slug: ${song.slug}`);
    songIds.add(song.id);
    songSlugs.add(song.slug);
    const cover_url = await downloadMedia({ url: song.cover_url, song, kind: "cover", subdirectory: "covers", oldManifest, nextManifest });
    const audio_url = await downloadMedia({ url: song.audio_url, song, kind: "audio", subdirectory: "audio", oldManifest, nextManifest });
    const extras = [];
    for (const extra of (song.extras ?? []).filter((item) => !item.status || item.status === "published")) {
      if (!["image", "audio", "video", "text"].includes(extra.type)) throw new Error(`${song.slug} extra ${extra.id}: unsupported type ${extra.type}`);
      if (extra.type === "text" && extra.file_url) throw new Error(`${song.slug} text extra ${extra.id} must not contain media`);
      const file_url = extra.file_url
        ? await downloadMedia({ url: extra.file_url, song, extra, kind: extra.type, subdirectory: "extras", oldManifest, nextManifest })
        : null;
      if (extra.type !== "text" && !file_url) throw new Error(`${song.slug} ${extra.type} extra ${extra.id} is missing media`);
      extras.push({ ...extra, file_url });
    }
    outputSongs.push({ ...song, status: song.status ?? "published", cover_url, audio_url, extras });
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
