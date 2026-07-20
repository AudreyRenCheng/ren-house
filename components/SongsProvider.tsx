"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiBaseUrl, fallbackSongs, mergeSongs, type ApiSong } from "@/lib/songsApi";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(fallbackSongs);

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SongCollection>(fallbackSongs);
  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl}/api/songs`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Songs API unavailable")))
      .then((body: { songs: ApiSong[] }) => {
        if (!Array.isArray(body.songs)) throw new Error("Invalid songs API response");
        setSongs(mergeSongs(body.songs));
      })
      .catch(() => { /* Static source data intentionally remains visible. */ });
    return () => controller.abort();
  }, []);
  return <SongsContext.Provider value={songs}>{children}</SongsContext.Provider>;
}

export const useSongs = () => useContext(SongsContext);
