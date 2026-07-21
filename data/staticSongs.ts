import { songs as originalSongs } from "@/data/songs";
import type { Song, SongCollection, SongMemory } from "@/types";

const originalResources: Record<string, { cover: string; audio: string; imageMemories: Record<string, { src: string; thumbnail: string }> }> = {
  song1: {
    cover: "/music/covers/evening-wind-v1.png",
    audio: "/music/audio/evening-wind-v1.mp3",
    imageMemories: {
      "cover-memory": {
        src: "/music/extras/full/evening-wind-color-v1.jpg",
        thumbnail: "/music/extras/thumbs/evening-wind-color-v1.jpg",
      },
    },
  },
  song2: {
    cover: "/music/covers/sad-days-v1.jpg",
    audio: "/music/audio/sad-days-v1.mp3",
    imageMemories: {
      "sad-days-cover": {
        src: "/music/extras/full/sad-days-moodboard-v1.jpg",
        thumbnail: "/music/extras/thumbs/sad-days-moodboard-v1.jpg",
      },
    },
  },
  song3: {
    cover: "/music/covers/clouds-and-smile-v1.webp",
    audio: "/music/audio/clouds-and-smile-v1.mp3",
    imageMemories: {
      "cloud-fragment": {
        src: "/music/extras/full/cloud-fragment-v1.jpg",
        thumbnail: "/music/extras/thumbs/cloud-fragment-v1.jpg",
      },
    },
  },
};

const localizedOriginalSongs = Object.fromEntries(
  Object.values(originalSongs).map((song, index) => {
    const resources = originalResources[song.id];
    const memories = song.memories?.map((memory): SongMemory => ({
      ...memory,
      ...(resources.imageMemories[memory.id] ?? {}),
    }));
    return [song.id, { ...song, slug: song.id, shelfOrder: index, cover: resources.cover, audio: resources.audio, memories }];
  })
) as SongCollection;

const backendTestSong: Song = {
  id: "b3064381-2437-42dc-b97d-213dd8c5a411",
  slug: "backend-test-song",
  shelfOrder: 99,
  completedDate: "2026-07-21",
  title: {
    original: "测试歌曲1",
    originalLanguage: "zh",
    translation: { zh: "测试歌曲1", en: "Test Song1" },
  },
  description: { zh: "这是测试简介。", en: "This is test description." },
  cover: "/music/covers/backend-test-song-v1.jpg",
  audio: "/music/audio/backend-test-song-v1.mp3",
  memories: [
    {
      id: "e2eb1ef2-c3ad-48aa-b9bb-021b0497894f",
      type: "image",
      date: "2026-07-15",
      title: { zh: "关门鼓", en: "Close Door Drum" },
      description: { zh: "这是最早的鼓", en: "This is original drum" },
      src: "/music/extras/full/backend-close-door-drum-v1.jpg",
      thumbnail: "/music/extras/thumbs/backend-close-door-drum-v1.jpg",
    },
  ],
  lyrics: {
    language: "zh",
    lines: [
      {
        original: "猴子摘月亮",
        language: "zh",
        translation: { zh: "猴子摘月亮", en: "Monkey pick up moon" },
      },
    ],
  },
};

export const staticSongs: SongCollection = Object.fromEntries(
  [...Object.values(localizedOriginalSongs), backendTestSong]
    .sort((left, right) => (left.shelfOrder ?? 0) - (right.shelfOrder ?? 0) || left.id.localeCompare(right.id))
    .map((song) => [song.id, song])
);
