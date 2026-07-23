export const ANALYTICS_SESSION_ID_KEY = "ren_house_analytics_session_id";
export const ANALYTICS_SOURCE_KEY = "ren_house_analytics_source";

const MAX_SOURCE_LENGTH = 100;
const MAX_UTM_LENGTH = 100;
const MAX_REFERRER_HOST_LENGTH = 255;

const channelSourceByPath = new Map<string, string>([
  ["/from/wechat", "wechat"],
  ["/from/card-a", "card-a"],
  ["/from/card-b", "card-b"],
  ["/from/firefly", "firefly"],
  ["/from/blue-door", "blue-door"],
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AnalyticsSource = {
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_host?: string;
};

let memorySessionId: string | null = null;
let memorySource: AnalyticsSource | null = null;

function cleanText(value: string | null | undefined, maxLength: number) {
  if (!value) return undefined;

  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);

  return cleaned || undefined;
}

function normalizedPathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function normalizedHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function createSessionId() {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === "function") {
    return browserCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof browserCrypto?.getRandomValues === "function") {
    browserCrypto.getRandomValues(bytes);
  } else {
    // Analytics must remain non-blocking on unusually old/restricted browsers.
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function parseStoredSource(value: string | null): AnalyticsSource | null {
  if (!value) return null;

  try {
    const candidate = JSON.parse(value) as Record<string, unknown>;
    const source = cleanText(
      typeof candidate.source === "string" ? candidate.source : undefined,
      MAX_SOURCE_LENGTH
    );

    if (!source) return null;

    return {
      source,
      utm_source: cleanText(
        typeof candidate.utm_source === "string"
          ? candidate.utm_source
          : undefined,
        MAX_UTM_LENGTH
      ),
      utm_medium: cleanText(
        typeof candidate.utm_medium === "string"
          ? candidate.utm_medium
          : undefined,
        MAX_UTM_LENGTH
      ),
      utm_campaign: cleanText(
        typeof candidate.utm_campaign === "string"
          ? candidate.utm_campaign
          : undefined,
        MAX_UTM_LENGTH
      ),
      referrer_host: cleanText(
        typeof candidate.referrer_host === "string"
          ? candidate.referrer_host
          : undefined,
        MAX_REFERRER_HOST_LENGTH
      ),
    };
  } catch {
    return null;
  }
}

function externalReferrerHostname(
  referrer: string,
  currentHostname: string
): string | undefined {
  if (!referrer) return undefined;

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    if (
      !hostname ||
      normalizedHostname(hostname) === normalizedHostname(currentHostname)
    ) {
      return undefined;
    }

    return cleanText(hostname, MAX_REFERRER_HOST_LENGTH);
  } catch {
    return undefined;
  }
}

export function resolveSource(
  pathname: string,
  search: string,
  referrer: string,
  currentHostname: string
): AnalyticsSource {
  const params = new URLSearchParams(search);
  const utmSource = cleanText(params.get("utm_source"), MAX_UTM_LENGTH);
  const utmMedium = cleanText(params.get("utm_medium"), MAX_UTM_LENGTH);
  const utmCampaign = cleanText(params.get("utm_campaign"), MAX_UTM_LENGTH);
  const fromSource = cleanText(params.get("from"), MAX_SOURCE_LENGTH);
  const referrerHost = externalReferrerHostname(referrer, currentHostname);
  const channelSource = channelSourceByPath.get(
    normalizedPathname(pathname).toLowerCase()
  );

  return {
    source:
      channelSource ??
      utmSource ??
      fromSource ??
      referrerHost ??
      "direct",
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    referrer_host: referrerHost,
  };
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";

  const storage = getSessionStorage();

  try {
    const stored = storage?.getItem(ANALYTICS_SESSION_ID_KEY);
    if (stored && uuidPattern.test(stored)) {
      memorySessionId = stored;
      return stored;
    }
  } catch {
    // Fall through to the in-memory session.
  }

  if (!memorySessionId) memorySessionId = createSessionId();

  try {
    storage?.setItem(ANALYTICS_SESSION_ID_KEY, memorySessionId);
  } catch {
    // sessionStorage may be unavailable in private/restricted contexts.
  }

  return memorySessionId;
}

export function getFirstTouchSource() {
  if (typeof window === "undefined") {
    return { source: "direct" } satisfies AnalyticsSource;
  }

  const storage = getSessionStorage();

  try {
    const stored = parseStoredSource(storage?.getItem(ANALYTICS_SOURCE_KEY) ?? null);
    if (stored) {
      memorySource = stored;
      return stored;
    }
  } catch {
    // Fall through to the in-memory source.
  }

  if (!memorySource) {
    memorySource = resolveSource(
      window.location.pathname,
      window.location.search,
      document.referrer,
      window.location.hostname
    );
  }

  try {
    storage?.setItem(ANALYTICS_SOURCE_KEY, JSON.stringify(memorySource));
  } catch {
    // The current document can still use the in-memory first-touch source.
  }

  return memorySource;
}
