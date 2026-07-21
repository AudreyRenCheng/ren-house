import { songs as staticSongs } from "@/data/songs";
import type { LyricLanguage, Song, SongCollection, SongMemory } from "@/types";

export type ApiExtra = {
  id: string; type: "image" | "audio" | "video" | "text"; file_url?: string | null;
  title_zh?: string | null; title_en?: string | null; caption_zh?: string | null;
  caption_en?: string | null; recorded_at?: string | null; sort_order: number;
};
export type ApiSong = {
  id: string; slug: string; original_title: string; title_zh?: string | null;
  title_en?: string | null; language: LyricLanguage; completed_at: string;
  summary_zh?: string | null; summary_en?: string | null; lyrics_original: string;
  lyrics_zh: string; lyrics_en: string; cover_url?: string | null; audio_url?: string | null;
  shelf_order: number; extras?: ApiExtra[];
};

const lines = (value: string) => value.replace(/\r\n/g, "\n").split("\n");
const browserMediaUrl = (value?: string | null) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
};

export function apiSongToSong(value: ApiSong): Song {
  const original = lines(value.lyrics_original);
  const zh = lines(value.lyrics_zh || "");
  const en = lines(value.lyrics_en || "");
  const memories: SongMemory[] = (value.extras ?? []).map((extra) => ({
    id: extra.id,
    type: extra.type === "text" ? "note" : extra.type,
    date: extra.recorded_at ?? undefined,
    title: { zh: extra.title_zh ?? "", en: extra.title_en ?? "" },
    description: { zh: extra.caption_zh ?? "", en: extra.caption_en ?? "" },
    src: browserMediaUrl(extra.file_url) || undefined,
    thumbnail: extra.type === "image" ? browserMediaUrl(extra.file_url) || undefined : undefined,
  }));
  return {
    id: value.id,
    slug: value.slug,
    shelfOrder: value.shelf_order,
    completedDate: value.completed_at,
    title: {
      original: value.original_title,
      originalLanguage: value.language === "en" ? "en" : "zh",
      translation: { zh: value.title_zh ?? undefined, en: value.title_en ?? undefined },
    },
    description: { zh: value.summary_zh ?? "", en: value.summary_en ?? "" },
    cover: browserMediaUrl(value.cover_url),
    audio: browserMediaUrl(value.audio_url),
    memories,
    lyrics: {
      language: value.language,
      lines: original.map((text, index) => ({
        original: text,
        language: value.language,
        translation: { zh: zh[index] || undefined, en: en[index] || undefined },
      })),
    },
  };
}

export function convertApiSongs(values: ApiSong[]): SongCollection {
  return Object.fromEntries(
    [...values].sort((a, b) => a.shelf_order - b.shelf_order).map((song) => [song.id, apiSongToSong(song)])
  );
}

export function mergeSongs(apiSongs: ApiSong[]): SongCollection {
  const merged = new Map<string, Song>();
  const slugToId = new Map<string, string>();

  Object.values(staticSongs).forEach((song, index) => {
    const normalized = { ...song, shelfOrder: song.shelfOrder ?? index };
    merged.set(normalized.id, normalized);
    slugToId.set(normalized.slug ?? normalized.id, normalized.id);
  });

  for (const apiSong of apiSongs) {
    const converted = apiSongToSong(apiSong);
    const duplicateId = merged.has(converted.id)
      ? converted.id
      : slugToId.get(apiSong.slug);
    if (duplicateId) merged.delete(duplicateId);
    merged.set(converted.id, converted);
    slugToId.set(apiSong.slug, converted.id);
  }

  return Object.fromEntries(
    [...merged.values()]
      .sort((a, b) => (a.shelfOrder ?? 0) - (b.shelfOrder ?? 0) || a.id.localeCompare(b.id))
      .map((song) => [song.id, song])
  );
}

export const fallbackSongs: SongCollection = mergeSongs([]);
export const songsApiUrl = "/songs-api/songs";
