import { Suspense } from "react";
import SongForm from "./song-form";
export default function SongAdminPage(){return <Suspense fallback={<main className="admin-page">加载中…</main>}><SongForm/></Suspense>}
