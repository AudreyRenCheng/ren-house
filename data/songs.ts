import type { Song, SongId } from "@/types";

export const songs: Record<SongId, Song> = {
  song1: {
    id: "song1",
    completedDate: "26.06.11",
    title: {
      original: "晚风寄来的信",
      originalLanguage: "zh",
      translation: {
        en: "A Letter from the Evening Wind",
      },
    },
    description: {
      en: "A gentle Chinese song about distance, memory, and a letter carried by the wind.",
      zh: "一首温柔的中文歌，关于距离、回忆，以及被晚风送来的信。",
    },
    cover: "/music/covers/evening-wind-v1.png",
    audio: "/music/audio/evening-wind-v1.mp3",
    memories: [
      {
        id: "evening-melody",
        type: "note",
        date: "26.06.07",
        title: {
          en: "First Melody",
          zh: "第一版旋律",
        },
        description: {
          en: "The first chorus idea arrived quietly, like a note left by the window.",
          zh: "副歌的第一版旋律来得很轻，像被放在窗边的一张纸条。",
        },
      },
      {
        id: "cover-memory",
        type: "image",
        date: "26.06.09",
        title: {
          en: "Color of the Song",
          zh: "这首歌的颜色",
        },
        description: {
          en: "I kept returning to this soft evening color while shaping the arrangement.",
          zh: "做编配的时候，我一直回到这种柔软的傍晚颜色里。",
        },
        src: "/music/extras/full/evening-wind-color-v1.jpg",
        thumbnail: "/music/extras/thumbs/evening-wind-color-v1.jpg",
      },
      {
        id: "lyric-note",
        type: "note",
        date: "26.06.11",
        title: {
          en: "Lyric Draft",
          zh: "歌词手稿",
        },
        description: {
          en: "The line about the wind felt like the doorway into the whole song.",
          zh: "关于晚风的那一句，像是整首歌真正打开的门。",
        },
      },
    ],
    lyrics: {
      language: "zh",
      lines: [
        {
          original: "晚风替我写下一封信",
          language: "zh",
          translation: {
            en: "The evening wind writes a letter for me",
          },
        },
        {
          original: "寄给很远很远的你",
          language: "zh",
          translation: {
            en: "and sends it to you, far, far away",
          },
        },
        {
          original: "月光落在窗台边缘",
          language: "zh",
          translation: {
            en: "Moonlight falls along the edge of the windowsill",
          },
        },
        {
          original: "像你曾经停留的声音",
          language: "zh",
          translation: {
            en: "like the voice you once left behind",
          },
        },
        {
          original: "我把没说出口的话",
          language: "zh",
          translation: {
            en: "I fold the words I never said",
          },
        },
        {
          original: "折进安静的夜色里",
          language: "zh",
          translation: {
            en: "into the quiet color of night",
          },
        },
        {
          original: "等一盏灯慢慢亮起",
          language: "zh",
          translation: {
            en: "waiting for a lamp to slowly glow",
          },
        },
        {
          original: "照见回忆走过的痕迹",
          language: "zh",
          translation: {
            en: "and reveal the footprints memory left behind",
          },
        },
        {
          original: "那些被时间吹散的句子",
          language: "zh",
          translation: {
            en: "Those sentences scattered by time",
          },
        },
        {
          original: "仍然停在心口附近",
          language: "zh",
          translation: {
            en: "are still resting close to my heart",
          },
        },
        {
          original: "如果风也懂得想念",
          language: "zh",
          translation: {
            en: "If the wind also understands longing",
          },
        },
        {
          original: "请替我越过漫长距离",
          language: "zh",
          translation: {
            en: "please cross the long distance for me",
          },
        },
        {
          original: "把这首歌轻轻放下",
          language: "zh",
          translation: {
            en: "and gently set this song down",
          },
        },
        {
          original: "放在你窗前的月光里",
          language: "zh",
          translation: {
            en: "inside the moonlight before your window",
          },
        },
        {
          original: "等到清晨还没有离开",
          language: "zh",
          translation: {
            en: "If it has not left by morning",
          },
        },
        {
          original: "就当作我来过这里",
          language: "zh",
          translation: {
            en: "then take it as proof that I was here",
          },
        },
        {
          original: "晚风替我写下一封信",
          language: "zh",
          translation: {
            en: "The evening wind writes another letter for me",
          },
        },
        {
          original: "写给很远很远的你",
          language: "zh",
          translation: {
            en: "written to you, far, far away",
          },
        },
        {
          original: "愿你听见熟悉旋律",
          language: "zh",
          translation: {
            en: "May you hear this familiar melody",
          },
        },
        {
          original: "像听见我温柔地靠近",
          language: "zh",
          translation: {
            en: "as if hearing me softly drawing near",
          },
        },
      ],
    },
  },

  song2: {
    id: "song2",
    completedDate: "26.05.22",
    title: {
      original: "Sad Days",
      originalLanguage: "en",
      translation: {
        zh: "伤心的日子",
      },
    },
    description: {
      en: "A quiet English song about fragile emotions and learning to move forward.",
      zh: "一首安静的英文歌，关于脆弱的情绪，以及慢慢学会向前走。",
    },
    cover: "/music/covers/sad-days-v1.jpg",
    audio: "/music/audio/sad-days-v1.mp3",
    memories: [
      {
        id: "quiet-room",
        type: "note",
        date: "26.05.18",
        title: {
          en: "Quiet Room",
          zh: "安静房间",
        },
        description: {
          en: "This began as a small late-night sentence before it became a song.",
          zh: "它最开始只是深夜里的一小句话，后来才慢慢变成歌。",
        },
      },
      {
        id: "sad-days-cover",
        type: "image",
        date: "26.05.22",
        title: {
          en: "First Moodboard",
          zh: "第一张情绪板",
        },
        description: {
          en: "A fragile visual note for the rain and the floor-shadow image.",
          zh: "一张脆弱的视觉笔记，关于雨声和留在地板上的影子。",
        },
        src: "/music/extras/full/sad-days-moodboard-v1.jpg",
        thumbnail: "/music/extras/thumbs/sad-days-moodboard-v1.jpg",
      },
    ],
    lyrics: {
      language: "en",
      lines: [
        {
          original: "Sad days are knocking on my door",
          language: "en",
          translation: {
            zh: "伤心的日子又敲响了我的门",
          },
        },
        {
          original: "I left my shadow on the floor",
          language: "en",
          translation: {
            zh: "我把自己的影子留在地板上",
          },
        },
        {
          original: "But somewhere underneath the rain",
          language: "en",
          translation: {
            zh: "但在雨声深处的某个地方",
          },
        },
        {
          original: "I learn to breathe and start again",
          language: "en",
          translation: {
            zh: "我学会呼吸，然后重新开始",
          },
        },
      ],
    },
  },

  song3: {
    id: "song3",
    completedDate: "26.04.05",
    title: {
      original: "Clouds and Your Smile",
      originalLanguage: "en",
      translation: {
        zh: "云和你的笑",
      },
    },
    description: {
      en: "A bilingual song that moves between Chinese memories and English fragments.",
      zh: "一首中英混合的歌，在中文记忆和英文片段之间慢慢移动。",
    },
    cover: "/music/covers/clouds-and-smile-v1.webp",
    audio: "/music/audio/clouds-and-smile-v1.mp3",
    memories: [
      {
        id: "cloud-fragment",
        type: "image",
        date: "26.04.03",
        title: {
          en: "Cloud Fragment",
          zh: "云的碎片",
        },
        description: {
          en: "The bilingual lines started from the feeling of a cloud crossing two rooms.",
          zh: "中英混合的句子，最初来自一朵云穿过两个房间的感觉。",
        },
        src: "/music/extras/full/cloud-fragment-v1.jpg",
        thumbnail: "/music/extras/thumbs/cloud-fragment-v1.jpg",
      },
      {
        id: "drawer-note",
        type: "note",
        date: "26.04.05",
        title: {
          en: "Drawer Note",
          zh: "抽屉里的纸条",
        },
        description: {
          en: "I liked the image of hiding yesterday somewhere ordinary and wooden.",
          zh: "我很喜欢把昨天藏进一个普通木头抽屉里的画面。",
        },
      },
    ],
    lyrics: {
      language: "mixed",
      lines: [
        {
          original: "天空中飘来一朵云",
          language: "zh",
          translation: {
            en: "A cloud drifts across the sky",
          },
        },
        {
          original: "I recall your smiling face",
          language: "en",
          translation: {
            zh: "我想起了你的笑脸",
          },
        },
        {
          original: "一切都会随风而去",
          language: "zh",
          translation: {
            en: "Everything will fade away with the wind",
          },
        },
        {
          original: "Just like the smell",
          language: "en",
          translation: {
            zh: "就像是气味",
          },
        },
        {
          original: "我把昨天藏进抽屉",
          language: "zh",
          translation: {
            en: "I hide yesterday inside a drawer",
          },
        },
        {
          original: "Waiting for the morning light",
          language: "en",
          translation: {
            zh: "等待清晨的光",
          },
        },
      ],
    },
  },
};
