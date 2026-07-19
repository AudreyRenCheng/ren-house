import type { ContactMethod, LocalizedText } from "@/types";

type ContactCopy = {
  title: LocalizedText;
  introduction: LocalizedText;
  closeLabel: LocalizedText;
  copyLabel: LocalizedText;
  copiedEmail: LocalizedText;
  copiedValue: LocalizedText;
  copyUnavailable: LocalizedText;
  emptyState: LocalizedText;
  privacyNote: LocalizedText;
  letterKicker: LocalizedText;
};

export const contactCopy: ContactCopy = {
  title: { en: "Contact Me", zh: "联系我" },
  introduction: {
    en: "Whether you want to talk about music, share something interesting, or simply tell me what is on your mind, you can find me here.",
    zh: "想聊聊音乐、有趣的作品，或者只是有话想告诉我，都可以从这里找到我。",
  },
  closeLabel: { en: "Close contact panel", zh: "关闭联系面板" },
  copyLabel: { en: "Copy", zh: "复制" },
  copiedEmail: { en: "Email copied", zh: "邮箱已复制" },
  copiedValue: { en: "Copied", zh: "已复制" },
  copyUnavailable: {
    en: "Copy is unavailable. Please select the text instead.",
    zh: "暂时无法复制，请手动选择文字。",
  },
  emptyState: {
    en: "Public contact details are still being confirmed.",
    zh: "公开联系方式仍在确认中。",
  },
  privacyNote: {
    en: "Please include a short note when you add me.",
    zh: "添加时请简单备注一下来意。",
  },
  letterKicker: {
    en: "A Note from the House",
    zh: "来自小屋的便签",
  },
};

export const contactMethods: ContactMethod[] = [
  {
    id: "email",
    type: "email",
    label: { en: "Email:", zh: "邮箱：" },
    value: "renchengmusic@gmail.com",
    href: "mailto:renchengmusic@gmail.com",
    copyable: true,
  },
  {
    id: "wechat",
    type: "social",
    label: { en: "WeChat:", zh: "微信：" },
    value: "tony2016728",
    copyable: true,
  },
];
