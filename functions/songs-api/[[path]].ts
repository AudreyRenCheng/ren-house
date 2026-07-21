type PagesEnv = {
  SONGS_API_URL?: string;
};

type PagesContext = {
  request: Request;
  env: PagesEnv;
  params: { path?: string | string[] };
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function routeSegments(value: string | string[] | undefined) {
  const rawSegments = Array.isArray(value) ? value : value ? value.split("/") : [];
  return rawSegments.map((segment) => decodeURIComponent(segment));
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        allow: "GET, OPTIONS",
        "cache-control": "no-store",
      },
    });
  }
  if (request.method !== "GET") return errorResponse("方法不允许", 405);
  if (!env.SONGS_API_URL) return errorResponse("公开歌曲 API 代理未配置", 503);

  let segments: string[];
  try {
    segments = routeSegments(context.params.path);
  } catch {
    return errorResponse("无效的公开 API 路径", 400);
  }
  if (
    segments.length !== 1 ||
    segments[0] !== "songs"
  ) {
    return errorResponse("公开 API 路径不存在", 404);
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(env.SONGS_API_URL);
  targetUrl.pathname = "/api/songs";
  targetUrl.search = incomingUrl.search;

  const headers = new Headers({ accept: "application/json" });
  const upstream = await fetch(targetUrl, {
    method: "GET",
    headers,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const name of ["content-type", "etag", "cache-control"] as const) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set("x-content-type-options", "nosniff");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
