"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiBaseUrl, fallbackSongs, mergeSongs, type ApiSong } from "@/lib/songsApi";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(fallbackSongs);

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SongCollection>(fallbackSongs);
  useEffect(() => {
    if (!apiBaseUrl) return;
    let disposed = false;
    let inFlight = false;
    let failures = 0;
    let lastRequestAt = 0;
    let retryTimer: number | undefined;
    let controller: AbortController | undefined;

    const schedule = (delay: number) => {
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(loadLatestSongs, delay);
    };

    const loadLatestSongs = async () => {
      if (disposed || inFlight) return;
      inFlight = true;
      lastRequestAt = Date.now();
      controller = new AbortController();
      try {
        const response = await fetch(`${apiBaseUrl}/api/songs`, {
          cache: "no-cache",
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Songs API unavailable");
        const body = await response.json() as { songs: ApiSong[] };
        if (!Array.isArray(body.songs)) throw new Error("Invalid songs API response");
        if (!disposed) setSongs(mergeSongs(body.songs));
        failures = 0;
        schedule(60_000);
      } catch {
        if (disposed || controller.signal.aborted) return;
        failures += 1;
        schedule(failures === 1 ? 5_000 : failures === 2 ? 15_000 : 60_000);
      } finally {
        inFlight = false;
      }
    };

    const revalidateWhenActive = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastRequestAt < 10_000) return;
      window.clearTimeout(retryTimer);
      void loadLatestSongs();
    };

    const handlePageShow = () => revalidateWhenActive();
    document.addEventListener("visibilitychange", revalidateWhenActive);
    window.addEventListener("focus", revalidateWhenActive);
    window.addEventListener("pageshow", handlePageShow);
    void loadLatestSongs();

    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      controller?.abort();
      document.removeEventListener("visibilitychange", revalidateWhenActive);
      window.removeEventListener("focus", revalidateWhenActive);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);
  return <SongsContext.Provider value={songs}>{children}</SongsContext.Provider>;
}

export const useSongs = () => useContext(SongsContext);
