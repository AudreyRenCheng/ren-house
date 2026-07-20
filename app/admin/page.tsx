"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
type Row={id:string;original_title:string;slug:string;status:string;shelf_order:number};
export default function AdminSongsPage(){
 const [songs,setSongs]=useState<Row[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const load=useCallback(()=>{setLoading(true);adminFetch<{songs:Row[]}>("/api/admin/songs").then(v=>{setSongs(v.songs);setError("")}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 useEffect(()=>{adminFetch<{songs:Row[]}>("/api/admin/songs").then(v=>{setSongs(v.songs);setError("")}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 async function hide(id:string){if(!confirm("隐藏后公开网站将不再显示，但数据和文件会保留。继续？"))return;try{await adminFetch(`/api/admin/songs/${id}/hide`,{method:"POST"});load()}catch(e){setError(e instanceof Error?e.message:"隐藏失败")}}
 return <main className="admin-page"><h1>歌曲管理</h1><div className="admin-actions"><Link className="button" href="/admin/song/">新建歌曲</Link><button onClick={load}>刷新</button></div>{error&&<p className="admin-message error">{error}</p>}{loading?<p>加载中…</p>:<table><thead><tr><th>歌名</th><th>状态</th><th>唱片架顺序</th><th>操作</th></tr></thead><tbody>{songs.map(song=><tr key={song.id}><td>{song.original_title||"（未命名）"}<br/><small>{song.slug}</small></td><td>{song.status}</td><td>{song.shelf_order}</td><td><div className="admin-actions"><Link className="button" href={`/admin/song/?id=${encodeURIComponent(song.id)}`}>编辑</Link><button onClick={()=>hide(song.id)}>隐藏</button></div></td></tr>)}</tbody></table>}</main>
}
