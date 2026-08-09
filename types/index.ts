export type Screen =
  | "entrance"
  | "map"
  | "room"
  | "musicRoom"
  | "song";
export type Mode = "casual" | "explore" | null;
export type RoomId = "room1" | "room2" | "room3";
export type SongId = string;
export type MusicRoomSource = "roomDoor" | "quickEntry";
export type RoomIntroTheme = "music" | "story" | "cs";
export type DoorTheme = "music" | "story" | "cs";
export type RoomStatus = "open" | "under-construction";
export type ConstructionNoticeTheme = "story" | "cs";
export type ContactButtonTheme =
  | "house"
  | "music"
  | "story"
  | "cs";

export type SiteLanguage = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type Room = {
  title: LocalizedText;
  theme: DoorTheme;
  color: string;
  status: RoomStatus;
  constructionNotice?: ConstructionNoticeData;
};

export type ContactMethod = {
  id: string;
  type: "email" | "phone" | "social" | "website";
  label: LocalizedText;
  value: string;
  href?: string;
  copyable?: boolean;
  external?: boolean;
};

export type ConstructionNoticeData = {
  theme: ConstructionNoticeTheme;
  roomTitle?: LocalizedText;
  label: LocalizedText;
  title: LocalizedText;
  description: Record<SiteLanguage, string[]>;
  dismissLabel: LocalizedText;
};

export type SongTitle = {
  original: string;
  originalLanguage: SiteLanguage;
  translation: Partial<LocalizedText>;
};

export type LyricLanguage = "zh" | "en" | "mixed";

export type LyricLine = {
  original: string;
  language: LyricLanguage;
  translation?: Partial<LocalizedText>;
};

export type Lyrics = {
  language: LyricLanguage;
  lines: LyricLine[];
};

export type Song = {
  id: SongId;
  slug?: string;
  shelfOrder?: number;
  title: SongTitle;
  completedDate?: string;
  description: LocalizedText;
  cover: string;
  audio: string;
  lyrics: Lyrics;
  memories?: SongMemory[];
};

export type RoomIntroData = {
  roomId: RoomId;
  theme: RoomIntroTheme;
  roomLabel: LocalizedText;
  name: LocalizedText;
  role: LocalizedText;
  introduction: Record<SiteLanguage, string[]>;
  photoSrc?: string;
  photoAlt: LocalizedText;
  photoCaption?: LocalizedText;
  photoPathHint?: string;
  continueLabel: LocalizedText;
};

export type SongMemory = {
  id: string;
  type: "image" | "video" | "audio" | "note";
  date?: string;
  title: LocalizedText;
  description: LocalizedText;
  src?: string;
  thumbnail?: string;
};

export type SongCollection = Record<SongId, Song>;
