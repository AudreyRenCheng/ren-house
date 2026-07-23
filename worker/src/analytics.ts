interface D1Result {
  success: boolean;
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface AnalyticsEnv {
  ANALYTICS_DB: D1Database;
  ANALYTICS_HMAC_SECRET?: string;
  ENVIRONMENT?: string;
  DEVELOPMENT_ORIGINS?: string;
  DEV_ALLOW_MISSING_ORIGIN?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface ScheduledController {
  scheduledTime: number;
}

type EventType = "page_view" | "screen_view";
type SiteRegion = "global" | "hk" | "local";
type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

interface EventInput {
  event_type: EventType;
  screen_name: string | null;
  song_id: string | null;
  session_id: string;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer_host: string | null;
}

interface TrustedSite {
  hostname: string;
  siteRegion: SiteRegion;
}

const MAX_BODY_BYTES = 8 * 1024;
const IP_RETENTION_DAYS = 90;
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

const PRODUCTION_SITES = new Map<string, TrustedSite>([
  [
    "https://ren-house.pages.dev",
    { hostname: "ren-house.pages.dev", siteRegion: "global" },
  ],
  [
    "https://foundren.win",
    { hostname: "foundren.win", siteRegion: "hk" },
  ],
  [
    "https://www.foundren.win",
    { hostname: "foundren.win", siteRegion: "hk" },
  ],
]);

const ALLOWED_INPUT_FIELDS = new Set([
  "event_type",
  "screen_name",
  "song_id",
  "session_id",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer_host",
]);

const SENSITIVE_INPUT_FIELDS = new Set([
  "ip",
  "client_ip",
  "x_forwarded_for",
  "country",
  "region",
  "device_type",
  "site_region",
  "hostname",
  "beijing_date",
  "daily_visitor_hash",
]);

const SCREEN_NAMES = new Set([
  "entrance",
  "house_map",
  "room:room1",
  "room:room2",
  "room:room3",
  "music_room",
  "song",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IPV4_PATTERN =
  /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const SAFE_VALUE_PATTERN = /^[^\u0000-\u001f\u007f]*$/;
const HOSTNAME_PATTERN =
  /^(?=.{1,255}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function responseHeaders(origin?: string): Headers {
  const headers = new Headers({
    "cache-control": "no-store",
    "content-type": JSON_CONTENT_TYPE,
    vary: "Origin",
    "x-content-type-options": "nosniff",
  });
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "Content-Type");
    headers.set("access-control-max-age", "86400");
  }
  return headers;
}

function jsonError(message: string, status: number, origin?: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: responseHeaders(origin),
  });
}

function configuredDevelopmentOrigins(env: AnalyticsEnv): Set<string> {
  if (env.ENVIRONMENT !== "development") return new Set();

  return new Set(
    (env.DEVELOPMENT_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );
}

function trustedSiteForRequest(
  request: Request,
  env: AnalyticsEnv,
): { origin?: string; site?: TrustedSite } {
  const originHeader = request.headers.get("Origin");
  if (!originHeader) {
    if (
      env.ENVIRONMENT === "development" &&
      env.DEV_ALLOW_MISSING_ORIGIN === "true"
    ) {
      return {
        site: { hostname: "localhost", siteRegion: "local" },
      };
    }
    return {};
  }

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(originHeader).origin;
  } catch {
    return {};
  }

  const productionSite = PRODUCTION_SITES.get(normalizedOrigin);
  if (productionSite) {
    return { origin: normalizedOrigin, site: productionSite };
  }

  if (configuredDevelopmentOrigins(env).has(normalizedOrigin)) {
    const hostname = new URL(normalizedOrigin).hostname.toLowerCase();
    return {
      origin: normalizedOrigin,
      site: { hostname, siteRegion: "local" },
    };
  }

  return { origin: normalizedOrigin };
}

function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
  const normalized = value.trim();
  if (
    normalized.length === 0 ||
    normalized.length > maxLength ||
    !SAFE_VALUE_PATTERN.test(normalized)
  ) {
    throw new Error(`${field} is invalid`);
  }
  return normalized;
}

function requiredString(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  const normalized = optionalString(value, field, maxLength);
  if (normalized === null) throw new Error(`${field} is required`);
  return normalized;
}

function parseEventInput(value: unknown): EventInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("request body must be a JSON object");
  }

  const record = value as Record<string, unknown>;
  for (const field of Object.keys(record)) {
    const normalizedField = field.toLowerCase().replace(/-/g, "_");
    if (SENSITIVE_INPUT_FIELDS.has(normalizedField)) {
      throw new Error(`client field ${field} is not allowed`);
    }
    if (!ALLOWED_INPUT_FIELDS.has(field)) {
      throw new Error(`unknown field ${field}`);
    }
  }

  const eventType = requiredString(record.event_type, "event_type", 20);
  if (eventType !== "page_view" && eventType !== "screen_view") {
    throw new Error("event_type is invalid");
  }

  const screenName = optionalString(record.screen_name, "screen_name", 100);
  if (screenName !== null && !SCREEN_NAMES.has(screenName)) {
    throw new Error("screen_name is invalid");
  }
  if (eventType === "screen_view" && screenName === null) {
    throw new Error("screen_view requires screen_name");
  }

  const songId = optionalString(record.song_id, "song_id", 100);
  if (songId !== null && screenName !== "song") {
    throw new Error("song_id is only allowed for the song screen");
  }
  if (eventType === "screen_view" && screenName === "song" && songId === null) {
    throw new Error("the song screen requires song_id");
  }

  const sessionId = requiredString(record.session_id, "session_id", 64);
  if (!UUID_PATTERN.test(sessionId)) {
    throw new Error("session_id must be a UUID");
  }

  const source = requiredString(record.source, "source", 100);
  const utmSource = optionalString(record.utm_source, "utm_source", 100);
  const utmMedium = optionalString(record.utm_medium, "utm_medium", 100);
  const utmCampaign = optionalString(record.utm_campaign, "utm_campaign", 100);
  const referrerHost = optionalString(
    record.referrer_host,
    "referrer_host",
    255,
  )?.toLowerCase() ?? null;
  if (referrerHost !== null && !HOSTNAME_PATTERN.test(referrerHost)) {
    throw new Error("referrer_host is invalid");
  }

  return {
    event_type: eventType,
    screen_name: screenName,
    song_id: songId,
    session_id: sessionId,
    source,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    referrer_host: referrerHost,
  };
}

function normalizeIp(rawIp: string): string | null {
  let ip = rawIp.trim();
  if (!ip || ip.length > 64) return null;

  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1);
  }
  const zoneIndex = ip.indexOf("%");
  if (zoneIndex >= 0) ip = ip.slice(0, zoneIndex);

  if (IPV4_PATTERN.test(ip)) return ip;

  if (!ip.includes(":")) return null;
  try {
    const parsedHostname = new URL(`http://[${ip}]/`).hostname;
    return parsedHostname.slice(1, -1).toLowerCase();
  } catch {
    return null;
  }
}

function beijingDate(date: Date): string {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function deriveDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (
    /(bot|spider|crawler|slurp|headless|preview|facebookexternalhit|whatsapp|telegrambot|bingpreview)/.test(
      ua,
    )
  ) {
    return "bot";
  }
  if (
    /(ipad|tablet|kindle|silk|playbook)/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua))
  ) {
    return "tablet";
  }
  if (
    /(mobile|iphone|ipod|android|windows phone|opera mini|opera mobi)/.test(ua)
  ) {
    return "mobile";
  }
  if (/(windows|macintosh|linux|cros|x11)/.test(ua)) return "desktop";
  return "unknown";
}

function serverLocation(request: Request): {
  country: string | null;
  region: string | null;
} {
  const cf = (
    request as Request & {
      cf?: { country?: unknown; region?: unknown };
    }
  ).cf;
  const clean = (value: unknown, maxLength: number) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    return normalized &&
      normalized.length <= maxLength &&
      SAFE_VALUE_PATTERN.test(normalized)
      ? normalized
      : null;
  };
  return {
    country: clean(cf?.country, 10),
    region: clean(cf?.region, 100),
  };
}

async function parseJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new TypeError("content_type");
  }

  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new RangeError("body_size");
  }

  if (!request.body) throw new SyntaxError("empty_body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("body_size");
    }
    chunks.push(value);
  }
  if (byteLength === 0) throw new SyntaxError("empty_body");

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

async function collectEvent(
  request: Request,
  env: AnalyticsEnv,
  origin: string | undefined,
  site: TrustedSite,
): Promise<Response> {
  if (!env.ANALYTICS_HMAC_SECRET) {
    return jsonError("analytics service is unavailable", 503, origin);
  }

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return jsonError("request body is too large", 413, origin);
    }
    if (error instanceof TypeError && error.message === "content_type") {
      return jsonError("Content-Type must be application/json", 415, origin);
    }
    return jsonError("request body must be valid JSON", 400, origin);
  }

  let input: EventInput;
  try {
    input = parseEventInput(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "request body is invalid";
    return jsonError(message, 400, origin);
  }

  const ipAddress = normalizeIp(
    request.headers.get("CF-Connecting-IP") ?? "",
  );
  if (!ipAddress) {
    return jsonError("client address is unavailable", 400, origin);
  }

  const currentTime = new Date();
  const occurredAt = currentTime.toISOString();
  const eventBeijingDate = beijingDate(currentTime);
  const dailyVisitorHash = await hmacSha256Hex(
    env.ANALYTICS_HMAC_SECRET,
    `${ipAddress}:${eventBeijingDate}`,
  );
  const deviceType = deriveDeviceType(request.headers.get("User-Agent"));
  const isBot = deviceType === "bot" ? 1 : 0;
  const location = serverLocation(request);

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO analytics_event_records (
      id, event_type, occurred_at, beijing_date, hostname, site_region,
      source, utm_source, utm_medium, utm_campaign, referrer_host,
      screen_name, song_id, session_id, daily_visitor_hash, ip_address,
      country, region, device_type, is_bot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      input.event_type,
      occurredAt,
      eventBeijingDate,
      site.hostname,
      site.siteRegion,
      input.source,
      input.utm_source,
      input.utm_medium,
      input.utm_campaign,
      input.referrer_host,
      input.screen_name,
      input.song_id,
      input.session_id,
      dailyVisitorHash,
      ipAddress,
      location.country,
      location.region,
      deviceType,
      isBot,
    )
    .run();

  const headers = responseHeaders(origin);
  headers.delete("content-type");
  return new Response(null, { status: 204, headers });
}

async function handleRequest(
  request: Request,
  env: AnalyticsEnv,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/events") {
    return jsonError("not found", 404);
  }

  const trusted = trustedSiteForRequest(request, env);
  if (!trusted.site) {
    return jsonError("origin is not allowed", 403);
  }

  if (request.method === "OPTIONS") {
    const headers = responseHeaders(trusted.origin);
    headers.delete("content-type");
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    const headers = responseHeaders(trusted.origin);
    headers.set("allow", "POST, OPTIONS");
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers,
    });
  }

  return collectEvent(request, env, trusted.origin, trusted.site);
}

async function clearExpiredIpAddresses(env: AnalyticsEnv): Promise<void> {
  const cutoff = new Date(
    Date.now() - IP_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  await env.ANALYTICS_DB.prepare(
    `UPDATE analytics_event_records
     SET ip_address = NULL
     WHERE ip_address IS NOT NULL AND occurred_at < ?`,
  )
    .bind(cutoff)
    .run();
}

export default {
  fetch(request: Request, env: AnalyticsEnv): Promise<Response> {
    return handleRequest(request, env);
  },
  scheduled(
    _controller: ScheduledController,
    env: AnalyticsEnv,
    context: ExecutionContext,
  ): void {
    context.waitUntil(clearExpiredIpAddresses(env));
  },
};
