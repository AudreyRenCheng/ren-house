"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type SongRow = { id: string; original_title: string; slug: string; status: string; shelf_order: number };
type RegionRow = { country: string; region: string; visits: number };
type SourceRow = { source: string; visits: number };

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [songData, regionData, sourceData] = await Promise.all([
        adminFetch<{ songs: SongRow[] }>("/api/admin/songs"),
        adminFetch<{ regions: RegionRow[] }>("/api/admin/analytics/regions"),
        adminFetch<{ sources: SourceRow[] }>("/api/admin/analytics/sources"),
      ]);
      setSongs(songData.songs); setRegions(regionData.regions); setSources(sourceData.sources); setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function hide(id: string) {
    if (!confirm("隐藏后公开网站将不再显示，但数据和文件会保留。继续？")) return;
    try { await adminFetch(`/api/admin/songs/${id}/hide`, { method: "POST" }); await load(); }
    catch (hideError) { setError(hideError instanceof Error ? hideError.message : "隐藏失败"); }
  }

  return <main className="admin-page">
    <h1>歌曲管理</h1>
    <div className="admin-actions"><Link className="button" href="/admin/song/">新建歌曲</Link><button onClick={() => void load()}>刷新</button></div>
    {error && <p className="admin-message error">{error}</p>}
    {loading ? <p>加载中…</p> : <>
      <table><thead><tr><th>歌名</th><th>状态</th><th>唱片架顺序</th><th>操作</th></tr></thead><tbody>{songs.map((song) => <tr key={song.id}><td>{song.original_title || "（未命名）"}<br /><small>{song.slug}</small></td><td>{song.status}</td><td>{song.shelf_order}</td><td><div className="admin-actions"><Link className="button" href={`/admin/song/?id=${encodeURIComponent(song.id)}`}>编辑</Link><button onClick={() => void hide(song.id)}>隐藏</button></div></td></tr>)}</tbody></table>
      <section className="admin-section" style={{ marginTop: 24 }}><h2>访客地区（最近 30 天）</h2><table><thead><tr><th>国家</th><th>省份/地区</th><th>访问次数</th></tr></thead><tbody>{regions.map((row) => <tr key={`${row.country}:${row.region}`}><td>{row.country}</td><td>{row.region}</td><td>{row.visits}</td></tr>)}</tbody></table></section>
      <section className="admin-section" style={{ marginTop: 24 }}><h2>渠道排行（最近 30 天）</h2><table><thead><tr><th>渠道</th><th>访问次数</th></tr></thead><tbody>{sources.map((row) => <tr key={row.source}><td>{row.source}</td><td>{row.visits}</td></tr>)}</tbody></table></section>
    </>}
  </main>;
}
