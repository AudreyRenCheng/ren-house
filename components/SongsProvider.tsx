"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fallbackSongs, generatedSongsUrl, mergeSongs, type ApiSong } from "@/lib/songsApi";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(fallbackSongs);
const debugSongs = process.env.NODE_ENV === "development";

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SongCollection>(fallbackSongs);
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const loadGeneratedSongs = async () => {
      try {
        const response = await fetch(generatedSongsUrl, {
          cache: "no-cache",
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Generated songs unavailable");
        const body = await response.json() as { songs: ApiSong[] };
        if (!Array.isArray(body.songs)) throw new Error("Invalid generated songs response");
        const mergedSongs = mergeSongs(body.songs);
        if (debugSongs) {
          console.info("[songs] generated_content_loaded", {
            generatedSongs: body.songs.length,
            mergedSongs: Object.keys(mergedSongs).length,
          });
        }
        if (!disposed) setSongs(mergedSongs);
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        if (debugSongs) {
          console.warn("[songs] generated_content_unavailable", {
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    };
    void loadGeneratedSongs();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, []);
  return <SongsContext.Provider value={songs}>{children}</SongsContext.Provider>;
}

export const useSongs = () => useContext(SongsContext);
