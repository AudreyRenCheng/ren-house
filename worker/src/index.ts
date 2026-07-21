import { createRemoteJWKSet, errors, jwtVerify } from "jose";

interface D1Result<T = unknown> { results?: T[]; success: boolean; }
interface D1Statement { bind(...values: unknown[]): D1Statement; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<D1Result<T>>; run(): Promise<D1Result>; }
interface D1Database { prepare(query: string): D1Statement; batch(statements: D1Statement[]): Promise<D1Result[]>; }
interface R2Object { body: ReadableStream; size?: number; httpMetadata?: { contentType?: string }; }
interface R2Bucket { put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string,string> }): Promise<unknown>; get(key: string): Promise<R2Object | null>; head(key: string): Promise<unknown | null>; delete(key: string): Promise<void>; }
interface Env { SONGS_DB: D1Database; SONGS_MEDIA: R2Bucket; API_MODE?: "public" | "admin"; ENVIRONMENT?: string; DEV_BYPASS_AUTH?: string; ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string; ALLOWED_ORIGIN?: string; PUBLIC_MEDIA_BASE_URL?: string; }

type SongInput = Record<string, unknown> & { extras?: ExtraInput[] };
type ExtraInput = Record<string, unknown>;
const statuses = new Set(["draft", "published", "hidden"]);
const languages = new Set(["zh", "en", "mixed"]);
const extraTypes = new Set(["image", "audio", "video", "text"]);
const accessJwks = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
const fail = (message: string, status = 400, details?: string[]) => json({ error: message, details }, status);
const text = (value: unknown) => typeof value === "string" ? value : "";
const nullable = (value: unknown) => text(value).trim() || null;
const integer = (value: unknown) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
const now = () => new Date().toISOString();
const normalizeLines = (value: unknown) => text(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const safeSlug = (value: unknown) => text(value).trim().toLowerCase();

function cors(env: Env) {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN || "",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers":
      "content-type, cf-access-jwt-assertion",
    "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
    vary: "Origin",
  };
}
type AccessFailureCategory =
  | "missing_token"
  | "missing_config"
  | "invalid_issuer"
  | "invalid_audience"
  | "expired_token"
  | "signature_verification_failed";

function logAccessFailure(category: AccessFailureCategory) {
  console.warn(`[access] authentication_failed category=${category}`);
}

function accessFailureCategory(error: unknown): AccessFailureCategory {
  if (error instanceof errors.JWTExpired) return "expired_token";
  if (error instanceof errors.JWTClaimValidationFailed) {
    if (error.claim === "iss") return "invalid_issuer";
    if (error.claim === "aud") return "invalid_audience";
  }
  return "signature_verification_failed";
}
async function verifyAccess(request: Request, env: Env): Promise<boolean> {
  if (env.ENVIRONMENT === "development" && env.DEV_BYPASS_AUTH === "true") return true;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    logAccessFailure("missing_config");
    return false;
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    logAccessFailure("missing_token");
    return false;
  }
  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  try {
    let jwks = accessJwks.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      accessJwks.set(issuer, jwks);
    }
    await jwtVerify(token, jwks, {
      issuer,
      audience: env.ACCESS_AUD,
      algorithms: ["RS256"],
    });
    return true;
  } catch (error) {
    logAccessFailure(accessFailureCategory(error));
    return false;
  }
}

function lyricErrors(input: SongInput) {
  const values = [normalizeLines(input.lyrics_original), normalizeLines(input.lyrics_zh), normalizeLines(input.lyrics_en)];
  const counts = values.map((value) => value.split("\n").length);
  return counts.every((count) => count === counts[0]) ? [] : [`歌词行数不一致：原歌词 ${counts[0]} 行，中文 ${counts[1]} 行，英文 ${counts[2]} 行。空译文也必须保留对应空行。`];
}
function validateExtra(extra: ExtraInput, publishing: boolean) {
  const errors: string[] = [];
  const type = text(extra.type);
  if (!extraTypes.has(type)) errors.push("花絮类型无效");
  if (publishing && type !== "text" && !nullable(extra.file_key)) errors.push("非文字花絮必须有媒体文件");
  if (!statuses.has(text(extra.status))) errors.push("花絮状态无效");
  return errors;
}
async function validateSong(input: SongInput, publishing: boolean, env: Env, existingId?: string) {
  const errors: string[] = [];
  const slug = safeSlug(input.slug);
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push("slug 只能包含小写字母、数字和单个连字符");
  if (publishing) {
    if (!slug) errors.push("发布必须填写 slug");
    if (!text(input.original_title).trim()) errors.push("发布必须填写原始歌名");
    if (!languages.has(text(input.language))) errors.push("发布必须选择歌曲语言");
    if (!nullable(input.completed_at)) errors.push("发布必须填写完成日期");
    if (!nullable(input.cover_key)) errors.push("发布必须上传封面");
    if (!nullable(input.audio_key)) errors.push("发布必须上传音频");
    errors.push(...lyricErrors(input));
    for (const [index, extra] of (input.extras ?? []).entries()) {
      if (text(extra.status) !== "hidden") errors.push(...validateExtra(extra, true).map((e) => `花絮 ${index + 1}：${e}`));
    }
  }
  if (slug) {
    const duplicate = await env.SONGS_DB.prepare("SELECT id FROM songs WHERE slug = ? AND id != ?").bind(slug, existingId ?? "").first();
    if (duplicate) errors.push("slug 已存在");
  }
  return errors;
}
const mediaUrl = (request: Request, env: Env, key: unknown) => key ? `${(env.PUBLIC_MEDIA_BASE_URL || new URL(request.url).origin).replace(/\/$/, "")}/media/${String(key).split("/").map(encodeURIComponent).join("/")}` : null;
const mediaTypes: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};
function mediaContentType(key: string, stored?: string) {
  if (stored === "audio/x-m4a") return "audio/mp4";
  if (stored === "audio/x-wav") return "audio/wav";
  if (stored && stored !== "application/octet-stream") return stored;
  return mediaTypes[key.toLowerCase().split(".").pop() ?? ""] ?? "application/octet-stream";
}
function publicSong(request: Request, env: Env, row: Record<string, unknown>, extras: Record<string, unknown>[] = []) {
  return { ...row, cover_url: mediaUrl(request, env, row.cover_key), audio_url: mediaUrl(request, env, row.audio_key), cover_key: undefined, audio_key: undefined,
    extras: extras.map((extra) => ({ ...extra, file_url: mediaUrl(request, env, extra.file_key), file_key: undefined })) };
}

async function saveExtras(db: D1Database, songId: string, extras: ExtraInput[]) {
  const timestamp = now();
  const statements: D1Statement[] = [];
  for (const extra of extras) {
    const id = text(extra.id) || crypto.randomUUID();
    statements.push(db.prepare(`INSERT INTO extras (id,song_id,type,file_key,title_zh,title_en,caption_zh,caption_en,recorded_at,sort_order,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,file_key=excluded.file_key,title_zh=excluded.title_zh,title_en=excluded.title_en,caption_zh=excluded.caption_zh,caption_en=excluded.caption_en,recorded_at=excluded.recorded_at,sort_order=excluded.sort_order,status=excluded.status,updated_at=excluded.updated_at`)
      .bind(id, songId, text(extra.type), nullable(extra.file_key), text(extra.title_zh), text(extra.title_en), text(extra.caption_zh), text(extra.caption_en), nullable(extra.recorded_at), integer(extra.sort_order), text(extra.status) || "draft", timestamp, timestamp));
  }
  if (statements.length) await db.batch(statements);
}

const allowed: Record<string, { mime: Record<string,string>; max: number; prefix: string }> = {
  cover: { mime: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, max: 10 * 1024 ** 2, prefix: "covers" },
  audio: { mime: { "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/wav": "wav", "audio/x-wav": "wav" }, max: 100 * 1024 ** 2, prefix: "audio" },
  image: { mime: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, max: 20 * 1024 ** 2, prefix: "extras" },
  extra_audio: { mime: { "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/wav": "wav", "audio/x-wav": "wav" }, max: 100 * 1024 ** 2, prefix: "extras" },
  video: { mime: { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }, max: 250 * 1024 ** 2, prefix: "extras" },
};
async function upload(request: Request, env: Env) {
  const form = await request.formData(); const file = form.get("file"); const category = text(form.get("category")); const songRef = safeSlug(form.get("song_ref"));
  if (!(file instanceof File) || file.size === 0) return fail("文件不能为空");
  const rule = allowed[category]; if (!rule) return fail("上传类别无效");
  const ext = file.name.toLowerCase().split(".").pop() || ""; const expected = rule.mime[file.type];
  if (!expected || ext !== expected) return fail("文件 MIME 类型或扩展名不受支持");
  if (file.size > rule.max) return fail(`文件超过上限 ${Math.round(rule.max / 1024 / 1024)}MB`);
  if (!songRef || !/^[a-z0-9-]+$/.test(songRef)) return fail("缺少有效的歌曲 slug 或 ID");
  const key = `${rule.prefix}/${songRef}/${crypto.randomUUID()}.${expected}`;
  await env.SONGS_MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name.slice(0, 200) } });
  return json({ key, file_name: file.name, url: mediaUrl(request, env, key) }, 201);
}

async function router(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url); const path = url.pathname.replace(/\/$/, "") || "/"; const method = request.method;
  if (method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
  if (env.API_MODE !== "public" && env.API_MODE !== "admin") return fail("Worker API_MODE 未配置", 503);
  const isPublicRoute = method === "GET" && (path === "/api/songs" || /^\/api\/songs\/[^/]+$/.test(path) || path.startsWith("/media/"));
  const isAdminRoute = path.startsWith("/api/admin/");
  if (env.API_MODE === "public" && !isPublicRoute) return fail("接口不存在", 404);
  if (env.API_MODE === "admin" && !isAdminRoute) return fail("接口不存在", 404);
  if (method === "GET" && path.startsWith("/media/")) {
    const key = path.slice(7).split("/").map(decodeURIComponent).join("/"); const object = await env.SONGS_MEDIA.get(key);
    if (!object) return fail("文件不存在", 404);
    const headers = new Headers({
      "content-type": mediaContentType(key, object.httpMetadata?.contentType),
      "cache-control": "public, max-age=31536000, immutable",
      "accept-ranges": "bytes",
      "x-content-type-options": "nosniff",
    });
    if (object.size !== undefined) headers.set("content-length", String(object.size));
    return new Response(object.body, { headers });
  }
  if (method === "GET" && path === "/api/songs") {
    const rows = (await env.SONGS_DB.prepare("SELECT * FROM songs WHERE status='published' ORDER BY shelf_order,id").all<Record<string,unknown>>()).results ?? [];
    const output = []; for (const row of rows) { const extras = (await env.SONGS_DB.prepare("SELECT * FROM extras WHERE song_id=? AND status='published' ORDER BY sort_order,id").bind(row.id).all<Record<string,unknown>>()).results ?? []; output.push(publicSong(request, env, row, extras)); }
    return json({ songs: output });
  }
  const publicMatch = path.match(/^\/api\/songs\/([^/]+)$/);
  if (method === "GET" && publicMatch) {
    const row = await env.SONGS_DB.prepare("SELECT * FROM songs WHERE slug=? AND status='published'").bind(decodeURIComponent(publicMatch[1])).first<Record<string,unknown>>();
    if (!row) return fail("歌曲不存在", 404); const extras = (await env.SONGS_DB.prepare("SELECT * FROM extras WHERE song_id=? AND status='published' ORDER BY sort_order,id").bind(row.id).all<Record<string,unknown>>()).results ?? [];
    return json({ song: publicSong(request, env, row, extras) });
  }
  if (!(await verifyAccess(request, env))) return fail("需要 Cloudflare Access 身份认证", 401);
  if (method === "POST" && path === "/api/admin/upload") return upload(request, env);
  if (method === "GET" && path === "/api/admin/songs") {
    const songs = (await env.SONGS_DB.prepare("SELECT * FROM songs ORDER BY shelf_order,id").all()).results ?? []; return json({ songs });
  }
  const adminGet = path.match(/^\/api\/admin\/songs\/([^/]+)$/);
  if (method === "GET" && adminGet) {
    const song = await env.SONGS_DB.prepare("SELECT * FROM songs WHERE id=?").bind(adminGet[1]).first<Record<string,unknown>>(); if (!song) return fail("歌曲不存在", 404);
    const extras = (await env.SONGS_DB.prepare("SELECT * FROM extras WHERE song_id=? ORDER BY sort_order,id").bind(adminGet[1]).all<Record<string,unknown>>()).results ?? [];
    return json({ song: { ...song, cover_url: mediaUrl(request,env,song.cover_key), audio_url: mediaUrl(request,env,song.audio_key), extras: extras.map(extra=>({...extra,file_url:mediaUrl(request,env,extra.file_key)})) } });
  }
  if (method === "POST" && path === "/api/admin/songs") {
    const input = await request.json() as SongInput; const publishing = input.status === "published"; const errors = await validateSong(input, publishing, env); if (errors.length) return fail("歌曲数据无效", 422, errors);
    const id = crypto.randomUUID(), timestamp = now();
    await env.SONGS_DB.prepare(`INSERT INTO songs (id,slug,original_title,title_zh,title_en,language,completed_at,summary_zh,summary_en,lyrics_original,lyrics_zh,lyrics_en,cover_key,audio_key,shelf_order,status,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,safeSlug(input.slug),text(input.original_title),text(input.title_zh),text(input.title_en),nullable(input.language),nullable(input.completed_at),text(input.summary_zh),text(input.summary_en),normalizeLines(input.lyrics_original),normalizeLines(input.lyrics_zh),normalizeLines(input.lyrics_en),nullable(input.cover_key),nullable(input.audio_key),integer(input.shelf_order),text(input.status)||"draft",timestamp,timestamp,publishing?timestamp:null).run();
    await saveExtras(env.SONGS_DB,id,input.extras ?? []); return json({ id },201);
  }
  const update = path.match(/^\/api\/admin\/songs\/([^/]+)$/);
  if (method === "PUT" && update) {
    const input = await request.json() as SongInput; const existing = await env.SONGS_DB.prepare("SELECT * FROM songs WHERE id=?").bind(update[1]).first<Record<string,unknown>>(); if (!existing) return fail("歌曲不存在",404);
    const merged = { ...existing, ...input }; const publishing = merged.status === "published"; const errors = await validateSong(merged,publishing,env,update[1]); if(errors.length)return fail("歌曲数据无效",422,errors);
    await env.SONGS_DB.prepare(`UPDATE songs SET slug=?,original_title=?,title_zh=?,title_en=?,language=?,completed_at=?,summary_zh=?,summary_en=?,lyrics_original=?,lyrics_zh=?,lyrics_en=?,cover_key=?,audio_key=?,shelf_order=?,status=?,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END WHERE id=?`)
      .bind(safeSlug(merged.slug),text(merged.original_title),text(merged.title_zh),text(merged.title_en),nullable(merged.language),nullable(merged.completed_at),text(merged.summary_zh),text(merged.summary_en),normalizeLines(merged.lyrics_original),normalizeLines(merged.lyrics_zh),normalizeLines(merged.lyrics_en),nullable(merged.cover_key),nullable(merged.audio_key),integer(merged.shelf_order),text(merged.status),now(),text(merged.status),now(),update[1]).run();
    await saveExtras(env.SONGS_DB,update[1],input.extras ?? []); return json({ id:update[1] });
  }
  const action = path.match(/^\/api\/admin\/songs\/([^/]+)\/(publish|hide)$/);
  if (method === "POST" && action) {
    const song = await env.SONGS_DB.prepare("SELECT * FROM songs WHERE id=?").bind(action[1]).first<Record<string,unknown>>(); if(!song)return fail("歌曲不存在",404);
    if(action[2]==="publish"){ const extras=(await env.SONGS_DB.prepare("SELECT * FROM extras WHERE song_id=?").bind(action[1]).all<ExtraInput>()).results??[]; const errors=await validateSong({...song,extras},true,env,action[1]); if(errors.length)return fail("歌曲尚不能发布",422,errors); }
    const status=action[2]==="publish"?"published":"hidden";
    const timestamp=now();
    const statements=[env.SONGS_DB.prepare("UPDATE songs SET status=?,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END WHERE id=?").bind(status,timestamp,status,timestamp,action[1])];
    if(status==="published") statements.push(env.SONGS_DB.prepare("UPDATE extras SET status='published',updated_at=? WHERE song_id=? AND status!='hidden'").bind(timestamp,action[1]));
    await env.SONGS_DB.batch(statements); return json({id:action[1],status});
  }
  const extraCreate = path.match(/^\/api\/admin\/songs\/([^/]+)\/extras$/);
  if(method==="POST"&&extraCreate){const input=await request.json() as ExtraInput;const errors=validateExtra(input,false);if(errors.length)return fail("花絮数据无效",422,errors);const id=crypto.randomUUID();await saveExtras(env.SONGS_DB,extraCreate[1],[{...input,id}]);return json({id},201);}
  const extraAction=path.match(/^\/api\/admin\/extras\/([^/]+)(?:\/(hide))?$/);
  if(extraAction&&method==="PUT"){const input=await request.json() as ExtraInput;const current=await env.SONGS_DB.prepare("SELECT song_id FROM extras WHERE id=?").bind(extraAction[1]).first<{song_id:string}>();if(!current)return fail("花絮不存在",404);const errors=validateExtra(input,false);if(errors.length)return fail("花絮数据无效",422,errors);await saveExtras(env.SONGS_DB,current.song_id,[{...input,id:extraAction[1]}]);return json({id:extraAction[1]});}
  if(extraAction&&extraAction[2]&&method==="POST"){await env.SONGS_DB.prepare("UPDATE extras SET status='hidden',updated_at=? WHERE id=?").bind(now(),extraAction[1]).run();return json({id:extraAction[1],status:"hidden"});}
  return fail("接口不存在",404);
}

const worker = { async fetch(request: Request, env: Env) { try { const response=await router(request,env); const headers=new Headers(response.headers); for(const [key,value] of Object.entries(cors(env))) if(value) headers.set(key,value); return new Response(response.body,{status:response.status,headers}); } catch(error) { return fail(error instanceof Error ? error.message : "服务器错误",500); } } };
export default worker;
