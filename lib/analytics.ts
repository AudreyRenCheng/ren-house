import {
  getAnalyticsSessionId,
  getFirstTouchSource,
} from "@/lib/analyticsSource";

export type AnalyticsEventType = "page_view" | "screen_view";

type AnalyticsEvent = {
  event_type: AnalyticsEventType;
  screen_name: string;
  song_id?: string;
};

let pageViewSentForDocument = false;

function cleanEventField(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function analyticsEndpoint() {
  const configured = process.env.NEXT_PUBLIC_ANALYTICS_API_URL?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname.endsWith("/api/events")
      ? pathname
      : `${pathname}/api/events`;

    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function sendEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return false;

  const endpoint = analyticsEndpoint();
  if (!endpoint) return false;

  try {
    const sessionId = getAnalyticsSessionId();
    const source = getFirstTouchSource();
    const screenName = cleanEventField(event.screen_name, 100);
    const songId = event.song_id
      ? cleanEventField(event.song_id, 100)
      : undefined;

    if (!sessionId || !screenName) return false;

    void fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      keepalive: true,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event_type: event.event_type,
        screen_name: screenName,
        ...(event.event_type === "screen_view" &&
        screenName === "song" &&
        songId
          ? { song_id: songId }
          : {}),
        session_id: sessionId,
        ...source,
      }),
    }).catch(() => {
      // Analytics is best-effort and must never interrupt the visitor experience.
    });

    return true;
  } catch {
    return false;
  }
}

export function trackPageViewOnce() {
  if (pageViewSentForDocument) return;

  // Mark as sent only when a valid endpoint exists and the request is queued.
  if (
    sendEvent({
      event_type: "page_view",
      screen_name: "entrance",
    })
  ) {
    pageViewSentForDocument = true;
  }
}

export function trackScreenView(screenName: string, songId?: string) {
  sendEvent({
    event_type: "screen_view",
    screen_name: screenName,
    song_id: songId,
  });
}
