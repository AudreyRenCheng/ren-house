const apiBase = process.argv[2]?.replace(/\/$/, "");
if (!apiBase) {
  console.error("Usage: node scripts/check-media-urls.mjs https://worker.example.com");
  process.exit(2);
}

const apiResponse = await fetch(`${apiBase}/api/songs`);
if (!apiResponse.ok) throw new Error(`GET /api/songs returned ${apiResponse.status}`);
const payload = await apiResponse.json();
const expected = [
  ["cover_url", /^image\/(jpeg|png|webp)$/],
  ["audio_url", /^audio\/(mpeg|mp4|wav)$/],
];
let checked = 0;

async function check(label, url, pattern) {
  if (!url) throw new Error(`${label} is missing`);
  const response = await fetch(url, { headers: { range: "bytes=0-0" } });
  const contentType = (response.headers.get("content-type") ?? "").split(";")[0];
  if (!response.ok || !pattern.test(contentType)) {
    throw new Error(`${label}: GET ${url} returned ${response.status} ${contentType || "(no Content-Type)"}`);
  }
  console.log(`OK ${label}: ${response.status} ${contentType} ${url}`);
  checked += 1;
}

for (const song of payload.songs ?? []) {
  for (const [field, pattern] of expected) await check(`${song.slug}.${field}`, song[field], pattern);
  for (const extra of song.extras ?? []) {
    if (extra.type === "text") continue;
    const pattern = extra.type === "image" ? /^image\/(jpeg|png|webp)$/ : extra.type === "audio" ? /^audio\/(mpeg|mp4|wav)$/ : /^video\/(mp4|webm|quicktime)$/;
    await check(`${song.slug}.extra.${extra.id}`, extra.file_url, pattern);
  }
}

console.log(`Validated ${checked} public media URLs.`);
