"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type SongRow = { id: string; original_title: string; slug: string; status: string; shelf_order: number };
type RegionRow = { country: string; region: string; visits: number };
type LegacySourceRow = { source: string; visits: number };
type DatePreset = "today" | "yesterday" | "last7" | "last30" | "custom";
type SiteRegion = "all" | "global" | "hk";
type DataState<T> = { data: T | null; loading: boolean; error: string };

type Summary = {
  today_pv: number; today_uv: number; today_visits: number; today_screen_views: number;
  yesterday_pv?: number; yesterday_uv?: number; yesterday_visits?: number; yesterday_screen_views?: number;
};
type DailyRow = { date: string; pv: number; uv: number; visits: number; screen_views: number };
type SourceRow = { source: string; pv: number; uv: number; visits: number; screen_views: number };
type DeviceRow = { device_type: string; pv: number; uv: number; visits: number };
type ScreenRow = { screen_name: string; views: number; unique_visitors: number };
type AnalyticsSongRow = { song_id: string; title?: string; original_title?: string; views: number; unique_visitors: number };
type IpRow = {
  occurred_at: string; beijing_date: string; masked_ip: string; full_ip?: string | null;
  country?: string | null; region?: string | null; source: string; device_type: string;
  event_type: string; screen_name?: string | null; site_region: string; hostname: string;
};
type IpPayload = { rows: IpRow[]; page?: number; page_size?: number; total?: number; total_pages?: number };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "加载失败";
}

function beijingDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === name)?.value ?? "";
  const date = new Date(`${part("year")}-${part("month")}-${part("day")}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function presetDates(preset: DatePreset) {
  const today = beijingDate();
  if (preset === "today") return { start_date: today, end_date: today };
  if (preset === "yesterday") { const yesterday = beijingDate(-1); return { start_date: yesterday, end_date: yesterday }; }
  if (preset === "last7") return { start_date: beijingDate(-6), end_date: today };
  return { start_date: beijingDate(-29), end_date: today };
}

function queryString(values: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

function unwrap<T>(body: unknown, key: string): T {
  if (body && typeof body === "object" && key in body) return (body as Record<string, T>)[key];
  return body as T;
}

function useAdminData<T>(path: string, payloadKey: string, refreshKey: number) {
  const [state, setState] = useState<DataState<T>>({ data: null, loading: true, error: "" });

  useEffect(() => {
    let disposed = false;
    void adminFetch<unknown>(path)
      .then((body) => { if (!disposed) setState({ data: unwrap<T>(body, payloadKey), loading: false, error: "" }); })
      .catch((error) => { if (!disposed) setState((current) => ({ ...current, loading: false, error: errorMessage(error) })); });
    return () => { disposed = true; };
  }, [path, payloadKey, refreshKey]);

  return state;
}

function numberText(value: number | undefined) { return new Intl.NumberFormat("zh-CN").format(value ?? 0); }

function Delta({ today, yesterday }: { today: number | undefined; yesterday: number | undefined }) {
  if (yesterday === undefined) return null;
  const difference = (today ?? 0) - yesterday;
  return <small className={difference > 0 ? "analytics-up" : difference < 0 ? "analytics-down" : ""}>
    较昨日 {difference > 0 ? "+" : ""}{numberText(difference)}
  </small>;
}

function SectionStatus({ loading, error, empty, children }: { loading: boolean; error: string; empty?: boolean; children: React.ReactNode }) {
  if (loading) return <p className="analytics-status">加载中…</p>;
  if (error) return <p className="analytics-status analytics-error">{error}</p>;
  if (empty) return <p className="analytics-status">暂无数据</p>;
  return <>{children}</>;
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", dateStyle: "short", timeStyle: "medium", hour12: false,
  }).format(parsed);
}

export default function AdminSongsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [preset, setPreset] = useState<DatePreset>("last7");
  const [siteRegion, setSiteRegion] = useState<SiteRegion>("all");
  const [includeBots, setIncludeBots] = useState(false);
  const [initialCustom] = useState(() => presetDates("last7"));
  const [customStart, setCustomStart] = useState(initialCustom.start_date);
  const [customEnd, setCustomEnd] = useState(initialCustom.end_date);
  const [ipPage, setIpPage] = useState(1);
  const [shownIps, setShownIps] = useState<Set<string>>(() => new Set());

  const selectedDates = preset === "custom"
    ? { start_date: customStart, end_date: customEnd }
    : presetDates(preset);
  const analyticsQuery = queryString({
    ...selectedDates, site_region: siteRegion, include_bots: includeBots,
  });
  const ipQuery = queryString({
    ...selectedDates, site_region: siteRegion, include_bots: includeBots, page: ipPage, page_size: 50,
  });

  const resetIpPage = () => { setIpPage(1); setShownIps(new Set()); };

  const songsState = useAdminData<SongRow[]>("/api/admin/songs", "songs", refreshKey);
  const summaryState = useAdminData<Summary>(`/api/admin/analytics/summary?${analyticsQuery}`, "summary", refreshKey);
  const dailyState = useAdminData<DailyRow[]>(`/api/admin/analytics/daily?${analyticsQuery}`, "daily", refreshKey);
  const sourcesState = useAdminData<SourceRow[]>(`/api/admin/analytics/sources?${analyticsQuery}`, "sources", refreshKey);
  const devicesState = useAdminData<DeviceRow[]>(`/api/admin/analytics/devices?${analyticsQuery}`, "devices", refreshKey);
  const screensState = useAdminData<ScreenRow[]>(`/api/admin/analytics/screens?${analyticsQuery}`, "screens", refreshKey);
  const analyticsSongsState = useAdminData<AnalyticsSongRow[]>(`/api/admin/analytics/songs?${analyticsQuery}`, "songs", refreshKey);
  const ipsState = useAdminData<IpPayload>(`/api/admin/analytics/ips?${ipQuery}`, "ips", refreshKey);
  const legacyRegionsState = useAdminData<RegionRow[]>("/api/admin/analytics/legacy/regions", "regions", refreshKey);
  const legacySourcesState = useAdminData<LegacySourceRow[]>("/api/admin/analytics/legacy/sources", "sources", refreshKey);

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);
  const hide = useCallback(async (id: string) => {
    if (!confirm("隐藏后公开网站将不再显示，但数据和文件会保留。继续？")) return;
    try { await adminFetch(`/api/admin/songs/${id}/hide`, { method: "POST" }); refresh(); }
    catch (error) { window.alert(errorMessage(error)); }
  }, [refresh]);

  const ips = ipsState.data?.rows ?? [];
  const totalIpPages = ipsState.data?.total_pages ?? (ips.length === 50 ? ipPage + 1 : ipPage);
  const showFullIp = (row: IpRow) => setShownIps((current) => {
    const next = new Set(current);
    if (next.has(row.occurred_at + row.masked_ip)) next.delete(row.occurred_at + row.masked_ip);
    else next.add(row.occurred_at + row.masked_ip);
    return next;
  });

  return <main className="admin-page">
    <header className="admin-header">
      <div><h1>歌曲管理</h1><p className="admin-subtitle">歌曲后台与访客统计</p></div>
      <div className="admin-actions"><Link className="button" href="/admin/song/">新建歌曲</Link><button onClick={refresh}>刷新</button></div>
    </header>

    <section className="analytics-section" aria-labelledby="analytics-heading">
      <div className="analytics-section-heading"><div><h2 id="analytics-heading">访客统计</h2><p>新版本统计自首次部署之日起开始记录，按北京时间自然日汇总。</p></div></div>
      <div className="analytics-filters">
        <fieldset><legend>日期</legend><div className="analytics-filter-row">
          {(["today", "yesterday", "last7", "last30", "custom"] as DatePreset[]).map((value) => <button type="button" key={value} className={preset === value ? "is-active" : ""} onClick={() => { setPreset(value); resetIpPage(); }}>
            {{ today: "今天", yesterday: "昨天", last7: "最近 7 天", last30: "最近 30 天", custom: "自定义" }[value]}
          </button>)}
        </div></fieldset>
        {preset === "custom" && <div className="analytics-custom-dates"><label>开始<input type="date" value={customStart} max={customEnd} onChange={(event) => { setCustomStart(event.target.value); resetIpPage(); }} /></label><label>结束<input type="date" value={customEnd} min={customStart} max={beijingDate()} onChange={(event) => { setCustomEnd(event.target.value); resetIpPage(); }} /></label></div>}
        <label className="analytics-select">站点<select value={siteRegion} onChange={(event) => { setSiteRegion(event.target.value as SiteRegion); resetIpPage(); }}><option value="all">全部站点</option><option value="global">Cloudflare Pages</option><option value="hk">香港站</option></select></label>
        <label className="analytics-checkbox"><input type="checkbox" checked={includeBots} onChange={(event) => { setIncludeBots(event.target.checked); resetIpPage(); }} />包含机器人</label>
      </div>

      <div className="analytics-cards">
        <MetricCard title="今日访问次数" abbreviation="PV" data={summaryState.data} value="today_pv" yesterday="yesterday_pv" state={summaryState} />
        <MetricCard title="今日访客数" abbreviation="UV" data={summaryState.data} value="today_uv" yesterday="yesterday_uv" state={summaryState} />
        <MetricCard title="今日访问人次" abbreviation="Visits" data={summaryState.data} value="today_visits" yesterday="yesterday_visits" state={summaryState} />
        <MetricCard title="今日界面浏览量" abbreviation="Screen Views" data={summaryState.data} value="today_screen_views" yesterday="yesterday_screen_views" state={summaryState} />
      </div>

      <div className="analytics-grid">
        <section className="admin-section analytics-panel analytics-wide"><h3>按日趋势</h3><SectionStatus loading={dailyState.loading} error={dailyState.error} empty={!dailyState.data?.length}><AnalyticsTable headers={["日期", "PV", "UV", "Visits", "Screen Views"]} rows={dailyState.data?.map((row) => [row.date, numberText(row.pv), numberText(row.uv), numberText(row.visits), numberText(row.screen_views)]) ?? []} /></SectionStatus></section>
        <section className="admin-section analytics-panel"><h3>来源</h3><SectionStatus loading={sourcesState.loading} error={sourcesState.error} empty={!sourcesState.data?.length}><AnalyticsTable headers={["来源", "PV", "UV", "Visits", "Screen"]} rows={sourcesState.data?.map((row) => [row.source, numberText(row.pv), numberText(row.uv), numberText(row.visits), numberText(row.screen_views)]) ?? []} /></SectionStatus></section>
        <section className="admin-section analytics-panel"><h3>设备</h3><SectionStatus loading={devicesState.loading} error={devicesState.error} empty={!devicesState.data?.length}><AnalyticsTable headers={["设备", "PV", "UV", "Visits"]} rows={devicesState.data?.map((row) => [row.device_type, numberText(row.pv), numberText(row.uv), numberText(row.visits)]) ?? []} /></SectionStatus></section>
        <section className="admin-section analytics-panel"><h3>界面</h3><SectionStatus loading={screensState.loading} error={screensState.error} empty={!screensState.data?.length}><AnalyticsTable headers={["界面", "浏览", "访客"]} rows={screensState.data?.map((row) => [row.screen_name, numberText(row.views), numberText(row.unique_visitors)]) ?? []} /></SectionStatus></section>
        <section className="admin-section analytics-panel"><h3>歌曲页面</h3><SectionStatus loading={analyticsSongsState.loading} error={analyticsSongsState.error} empty={!analyticsSongsState.data?.length}><AnalyticsTable headers={["歌曲", "浏览", "访客"]} rows={analyticsSongsState.data?.map((row) => [row.title || row.original_title || row.song_id, numberText(row.views), numberText(row.unique_visitors)]) ?? []} /></SectionStatus></section>
      </div>

      <section className="admin-section analytics-panel analytics-ip-panel"><h3>IP 访问明细</h3><p className="analytics-panel-note">IP 仅在受 Cloudflare Access 保护的后台显示；默认遮罩，按行查看完整值。</p><SectionStatus loading={ipsState.loading} error={ipsState.error} empty={!ips.length}><div className="analytics-scroll"><table><thead><tr><th>时间（北京时间）</th><th>IP</th><th>国家/地区</th><th>来源</th><th>设备</th><th>事件</th><th>界面</th><th>站点</th></tr></thead><tbody>{ips.map((row) => { const key = row.occurred_at + row.masked_ip; const expanded = shownIps.has(key); return <tr key={key}><td>{formatDateTime(row.occurred_at)}</td><td><code>{expanded && row.full_ip ? row.full_ip : row.masked_ip}</code>{row.full_ip && <button className="analytics-inline-button" type="button" onClick={() => showFullIp(row)}>{expanded ? "遮罩" : "查看"}</button>}</td><td>{row.country || "-"}{row.region ? ` / ${row.region}` : ""}</td><td>{row.source}</td><td>{row.device_type}</td><td>{row.event_type}</td><td>{row.screen_name || "-"}</td><td>{row.site_region}<br /><small>{row.hostname}</small></td></tr>; })}</tbody></table></div><div className="analytics-pagination"><button type="button" disabled={ipPage <= 1} onClick={() => setIpPage((page) => page - 1)}>上一页</button><span>第 {ipPage} 页{ipsState.data?.total ? ` / 共 ${numberText(ipsState.data.total)} 条` : ""}</span><button type="button" disabled={ipPage >= totalIpPages || ips.length < 50} onClick={() => setIpPage((page) => page + 1)}>下一页</button></div></SectionStatus></section>
    </section>

    <section className="admin-section song-management"><h2>歌曲列表</h2><SectionStatus loading={songsState.loading} error={songsState.error} empty={!songsState.data?.length}><div className="analytics-scroll"><table><thead><tr><th>歌名</th><th>状态</th><th>唱片架顺序</th><th>操作</th></tr></thead><tbody>{songsState.data?.map((song) => <tr key={song.id}><td>{song.original_title || "（未命名）"}<br /><small>{song.slug}</small></td><td>{song.status}</td><td>{song.shelf_order}</td><td><div className="admin-actions compact"><Link className="button" href={`/admin/song/?id=${encodeURIComponent(song.id)}`}>编辑</Link><button onClick={() => void hide(song.id)}>隐藏</button></div></td></tr>)}</tbody></table></div></SectionStatus></section>

    <section className="analytics-legacy" aria-labelledby="legacy-heading"><div><h2 id="legacy-heading">历史渠道 / 地区统计</h2><p>旧版 Pages 统计口径，仅保留作历史参考，不纳入上方新版 PV、UV、Visits 或 Screen Views。</p></div><div className="analytics-grid"><section className="admin-section analytics-panel"><h3>访客地区（旧版，最近 30 天）</h3><SectionStatus loading={legacyRegionsState.loading} error={legacyRegionsState.error} empty={!legacyRegionsState.data?.length}><AnalyticsTable headers={["国家", "省份/地区", "访问次数"]} rows={legacyRegionsState.data?.map((row) => [row.country, row.region, numberText(row.visits)]) ?? []} /></SectionStatus></section><section className="admin-section analytics-panel"><h3>渠道排行（旧版，最近 30 天）</h3><SectionStatus loading={legacySourcesState.loading} error={legacySourcesState.error} empty={!legacySourcesState.data?.length}><AnalyticsTable headers={["渠道", "访问次数"]} rows={legacySourcesState.data?.map((row) => [row.source, numberText(row.visits)]) ?? []} /></SectionStatus></section></div></section>
  </main>;
}

function MetricCard({ title, abbreviation, data, value, yesterday, state }: { title: string; abbreviation: string; data: Summary | null; value: keyof Summary; yesterday: keyof Summary; state: DataState<Summary> }) {
  return <section className="analytics-card"><h3>{title}</h3><small>{abbreviation}</small><SectionStatus loading={state.loading} error={state.error}><strong>{numberText(data?.[value] as number | undefined)}</strong><Delta today={data?.[value] as number | undefined} yesterday={data?.[yesterday] as number | undefined} /></SectionStatus></section>;
}

function AnalyticsTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="analytics-scroll"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}:${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
