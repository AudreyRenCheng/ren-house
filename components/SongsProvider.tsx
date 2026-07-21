"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fallbackSongs, mergeSongs, songsApiUrl, type ApiSong } from "@/lib/songsApi";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(fallbackSongs);
const debugSongs = process.env.NODE_ENV === "development";

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SongCollection>(fallbackSongs);
  useEffect(() => {
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
        const response = await fetch(songsApiUrl, {
          cache: "no-cache",
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Songs API unavailable");
        const body = await response.json() as { songs: ApiSong[] };
        if (!Array.isArray(body.songs)) throw new Error("Invalid songs API response");
        const mergedSongs = mergeSongs(body.songs);
        if (debugSongs) {
          console.info("[songs] api_success", {
            apiSongs: body.songs.length,
            mergedSongs: Object.keys(mergedSongs).length,
          });
        }
        if (!disposed) setSongs(mergedSongs);
        failures = 0;
        schedule(60_000);
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        failures += 1;
        if (debugSongs) {
          console.warn("[songs] api_failure", {
            attempt: failures,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
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

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !inFlight) {
        window.clearTimeout(retryTimer);
        void loadLatestSongs();
        return;
      }
      revalidateWhenActive();
    };
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
