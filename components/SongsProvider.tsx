"use client";

import { createContext, useContext, type ReactNode } from "react";
import { songs as staticSongs } from "@/data/songs";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(staticSongs);

export function SongsProvider({ children }: { children: ReactNode }) {
  return <SongsContext.Provider value={staticSongs}>{children}</SongsContext.Provider>;
}

export const useSongs = () => useContext(SongsContext);
