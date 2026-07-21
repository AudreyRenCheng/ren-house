export const adminApiBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "").replace(/\/$/, "");
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!adminApiBase) throw new Error("未配置 NEXT_PUBLIC_ADMIN_API_URL");
  const response = await fetch(`${adminApiBase}${path}`, { credentials: "include", ...init, headers: { ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }), ...init?.headers } });
  const body = await response.json().catch(() => ({})) as { error?: string; details?: string[] } & T;
  if (!response.ok) throw new Error([body.error || `请求失败 (${response.status})`, ...(body.details ?? [])].join("\n"));
  return body;
}
