type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
};

type AnalyticsDatabase = {
  prepare(query: string): D1Statement;
};

type PagesContext = {
  request: Request & {
    cf?: {
      country?: string;
      region?: string;
    };
  };
  env: {
    ANALYTICS_DB?: AnalyticsDatabase;
  };
};

const allowedSources = new Set([
  "direct",
  "wechat",
  "card-a",
  "card-b",
  "firefly",
  "blue-door",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const ownOrigin = new URL(request.url).origin;
  const headers = new Headers({
    "cache-control": "no-store",
    vary: "Origin",
  });

  if (origin === ownOrigin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
  }

  return headers;
}

function jsonError(request: Request, message: string, status: number) {
  const headers = corsHeaders(request);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get("origin");
  const ownOrigin = new URL(request.url).origin;

  if (origin && origin !== ownOrigin) {
    return jsonError(request, "Origin not allowed", 403);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return jsonError(request, "Method not allowed", 405);
  }
  if (!env.ANALYTICS_DB) {
    return jsonError(request, "Analytics database is not configured", 503);
  }

  let body: { source?: unknown };
  try {
    body = (await request.json()) as { source?: unknown };
  } catch {
    return jsonError(request, "Invalid JSON", 400);
  }

  if (typeof body.source !== "string" || !allowedSources.has(body.source)) {
    return jsonError(request, "Invalid source", 400);
  }

  // Cloudflare derives these approximate fields from the connection IP. The IP
  // itself, city, coordinates, user agent, and other identity data are not stored.
  const country = request.cf?.country?.trim() || null;
  const region = request.cf?.region?.trim() || null;

  await env.ANALYTICS_DB.prepare(
    "INSERT INTO analytics_visits (id, country, region, source, visited_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), country, region, body.source, new Date().toISOString())
    .run();

  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
