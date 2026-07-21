type TrackedPath = "/" | "/from/wechat" | "/from/card-a" | "/from/card-b" | "/from/firefly" | "/from/blue-door";

const sourceByPath = new Map<TrackedPath, string>([
  ["/", "direct"],
  ["/from/wechat", "wechat"],
  ["/from/card-a", "card-a"],
  ["/from/card-b", "card-b"],
  ["/from/firefly", "firefly"],
  ["/from/blue-door", "blue-door"],
] as const);

let sentForThisPageLoad = false;

export function trackVisitOnce() {
  if (sentForThisPageLoad || typeof window === "undefined") return;

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const source = sourceByPath.get(pathname as TrackedPath);
  if (!source) return;

  sentForThisPageLoad = true;
  void fetch("/analytics-api/visit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt or retry the visitor experience.
  });
}
