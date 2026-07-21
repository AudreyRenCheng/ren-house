export const adminApiBase = "/admin-api";
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const adminPrefix = "/api/admin";
  if (path !== adminPrefix && !path.startsWith(`${adminPrefix}/`)) throw new Error("无效的管理 API 路径");
  const proxyPath = path.slice(adminPrefix.length) || "/";
  const response = await fetch(`${adminApiBase}${proxyPath}`, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }), ...init?.headers } });
  const body = await response.json().catch(() => ({})) as { error?: string; details?: string[] } & T;
  if (!response.ok) throw new Error([body.error || `请求失败 (${response.status})`, ...(body.details ?? [])].join("\n"));
  return body;
}
