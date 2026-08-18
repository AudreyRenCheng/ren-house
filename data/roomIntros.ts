import type { RoomId, RoomIntroData } from "@/types";

export const roomIntros: Partial<Record<RoomId, RoomIntroData>> = {
  room1: {
    roomId: "room1",
    theme: "music",
    roomLabel: { en: "Music Room", zh: "音乐房间" },
    name: { en: "Ren Cheng", zh: "程仁" },
    role: { en: "Musician in the Making", zh: "见习音乐人" },
    introduction: {
      en: [
        "Welcome to my Music Room.",
        "My name is Ren Cheng. I write songs, study computer science, and draw little pictures from time to time.",
        "What I want most from music is for it to be more than simply good to listen to. I also want there to be something in it that feels interesting. It might be a sound, a rhythm, a melody, or a few things that once existed separately in different corners of the world, coming together and creating a feeling that was not there before. When I write, I like to follow that feeling step by step and see where it leads.",
        "I did not always listen to all kinds of music. My taste used to be much narrower, and I often thought that only the styles I already knew could sound good. As I came across more music, I began to realise that very different sounds, rhythms, and arrangements could all be fun in their own ways. It felt a little like being a horse tasting a carrot for the first time. The world had suddenly gained a new flavour.",
        "That is also why I am not in a hurry to define my music too clearly. I keep working with the things I already know, while staying open to new sounds and new ways of making things. When something feels fresh, I like to try it and see what it changes in the song.",
        "I often think of making music as keeping a scrapbook that grows along with you. The sounds I hear, the places I see, the smells I remember, the work I love, and all the small fragments of memory are things I want to keep in my pocket for a while. They do not have to be useful straight away. Maybe one day, when the weather and the mood feel right, a little cutting, rearranging, and pasting will turn them into a page in that scrapbook, or into my music.",
        "I have already written some songs, and I will keep writing. I cannot say what the next one will be like yet, but I think that is part of what makes creating so much fun.",
      ],
      zh: [
        "欢迎来到我的音乐房间。",
        "我是程仁，写歌，学计算机，也会画一点小画。",
        "我对音乐最直接的期待，是它在好听之外，还能有一点让人觉得有意思的地方。可能是一个声音、一段节奏、一条旋律，也可能只是几样原本自由分布在世界各处的东西，放在一起之后忽然诞生了新的感受。写歌的时候，我很喜欢顺着这种感觉一步步往下走，看看它最后会把我带到哪里。",
        "我并不是一开始就喜欢各种各样的音乐。以前的我听得范围很窄，总觉得只有自己熟悉的那几种风格才算好听。后来逐渐接触到更多作品，我才发现，差异很大的声音、节奏和编排，也都有各自好玩的地方。像是第一次吃到胡萝卜的马，世界里突然多出了一种新的美味。",
        "也正因为这样，我现在没有特别急着替自己的音乐划出一个很清楚的范围。继续做着熟悉的东西，同时积极的期待新的邂逅，遇到新鲜的声音和做法，就拿来试试，看看歌曲会因此发生什么变化。",
        "我常常觉得，创作有点像在做一本会跟着人一起变厚的手账。一路上听到的声音、见过的风景、闻过的气味、喜欢过的作品，还有一些细碎的回忆，我都先将它们装进口袋里。它们未必要马上派上用场，也许过了一段时间，正好遇上合适的天气和心情，再经过一点裁剪、排列和粘贴，就成了手账里的一页，或者说，成了我的音乐。",
        "我已经写下了一些歌，也还会继续往前写。下一首会是什么样，我暂时说不准，不过我想，这大概就是创作里好玩的地方。",
      ],
    },
    photoSrc: "/images/music-room/ren-cheng-portrait.jpg",
    photoAlt: {
      en: "Portrait of Ren Cheng in the Music Room",
      zh: "程仁在音乐房间中的人物照片",
    },
    photoCaption: { en: "Ren Cheng", zh: "程仁" },
    continueLabel: { en: "Go to the Record Shelf", zh: "前往唱片架" },
  },
};
