"use client";

import { createContext, useContext, type ReactNode } from "react";
import { staticSongs } from "@/data/staticSongs";
import type { SongCollection } from "@/types";

const SongsContext = createContext<SongCollection>(staticSongs);

export function SongsProvider({ children }: { children: ReactNode }) {
  return <SongsContext.Provider value={staticSongs}>{children}</SongsContext.Provider>;
}

export const useSongs = () => useContext(SongsContext);
