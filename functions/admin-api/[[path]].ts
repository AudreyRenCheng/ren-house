type PagesEnv = {
  ADMIN_API_URL?: string;
};

type PagesContext = {
  request: Request;
  env: PagesEnv;
  params: { path?: string | string[] };
};

const allowedMethods = new Set(["GET", "POST", "PUT", "OPTIONS"]);

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
  if (!allowedMethods.has(request.method)) return errorResponse("方法不允许", 405);
  if (!env.ADMIN_API_URL) return errorResponse("管理 API 代理未配置", 503);

  const accessJwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!accessJwt) return errorResponse("需要 Cloudflare Access 身份认证", 401);

  let segments: string[];
  try {
    segments = routeSegments(context.params.path);
  } catch {
    return errorResponse("无效的管理 API 路径", 400);
  }
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return errorResponse("无效的管理 API 路径", 400);
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(env.ADMIN_API_URL);
  targetUrl.pathname = `/api/admin/${segments.map(encodeURIComponent).join("/")}`;
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  headers.set("Cf-Access-Token", accessJwt);

  const hasBody = request.method === "POST" || request.method === "PUT";
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
  responseHeaders.set("cache-control", "no-store, no-cache, must-revalidate");
  responseHeaders.set("cdn-cache-control", "no-store");
  responseHeaders.set("cloudflare-cdn-cache-control", "no-store");
  responseHeaders.set("pragma", "no-cache");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
