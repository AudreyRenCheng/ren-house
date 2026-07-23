export type SiteRegion = "global" | "hk" | "local" | "unknown";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function siteRegionForHostname(hostname: string): SiteRegion {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (localHosts.has(normalized) || normalized.endsWith(".localhost")) return "local";
  if (normalized === "ren-house.pages.dev") return "global";
  if (normalized === "foundren.win" || normalized === "www.foundren.win") return "hk";
  return "unknown";
}
