// Compatibility export for callers that still use the old function name.
// New visits go only to the dedicated Analytics Worker configured in
// NEXT_PUBLIC_ANALYTICS_API_URL; the legacy Pages Function is not called.
export { trackPageViewOnce as trackVisitOnce } from "@/lib/analytics";
