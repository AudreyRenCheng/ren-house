import type { Room, RoomId } from "@/types";

export const rooms: Record<RoomId, Room> = {
  room1: {
    theme: "music",
    title: { en: "Music Room", zh: "音乐房间" },
    color: "#e7b86a",
    status: "open",
  },
  room2: {
    theme: "story",
    title: { en: "Picture Book Room", zh: "绘本房间" },
    color: "#d98fa3",
    status: "under-construction",
    constructionNotice: {
      theme: "story",
      roomTitle: {
        en: "Picture Book and Animation Room",
        zh: "绘本动画房间",
      },
      label: {
        en: "Still Being Put Together",
        zh: "施工中，请稍后再来",
      },
      title: {
        en: "The stories are still growing in here",
        zh: "故事还在房间里慢慢长大",
      },
      description: {
        en: [
          "This room is not quite ready yet.",
          "Some picture books only have a beginning so far, and some drawings are still rough sketches.",
          "Once everything is a little more complete, I will open the door and show you around.",
        ],
        zh: [
          "这里还没收拾好。",
          "有些绘本只写了开头，有些画还停在草稿里。",
          "等我再准备得完整一点，就打开门给你看。",
        ],
      },
      dismissLabel: {
        en: "I'll Come Back Later",
        zh: "那我之后再来",
      },
    },
  },
  room3: {
    theme: "cs",
    title: { en: "Computer Room", zh: "计算机房间" },
    color: "#78b7b0",
    status: "under-construction",
    constructionNotice: {
      theme: "cs",
      roomTitle: { en: "Computer Room", zh: "计算机房间" },
      label: {
        en: "Still Being Put Together",
        zh: "施工中，请稍后再来",
      },
      title: {
        en: "The projects still need a little work",
        zh: "项目还在接受调试",
      },
      description: {
        en: [
          "This room is not quite ready yet.",
          "Some projects still need changes, and a few ideas are only half written for now.",
          "Once I sort out the problems they are having, I will open the door and show you around.",
        ],
        zh: [
          "这里还没收拾好。",
          "有些项目还在修改，也有些想法暂时只写到一半。",
          "等我先解决它们目前的问题，就打开门给你看。",
        ],
      },
      dismissLabel: {
        en: "I'll Come Back Later",
        zh: "那我之后再来",
      },
    },
  },
};
