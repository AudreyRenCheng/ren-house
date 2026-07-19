"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import ContactInfo from "@/components/ContactInfo";
import ConstructionNotice from "@/components/ConstructionNotice";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MelodyLock from "@/components/MelodyLock";
import ModeSwitcher from "@/components/ModeSwitcher";
import { useSound } from "@/components/SoundProvider";
import RoomDoor, { type DoorState } from "@/components/doors/RoomDoor";
import { rooms } from "@/data/rooms";
import type { Mode, RoomId, Screen, SiteLanguage } from "@/types";

const controlTheme = {
  color: "#5a321d",
  border: "1px solid rgba(120, 70, 35, 0.45)",
  background: "rgba(255, 248, 236, 0.72)",
};

const modeTheme = {
  ...controlTheme,
  mutedColor: "#7a533a",
};

const roomCopy: Record<
  RoomId,
  {
    eyebrow: Record<SiteLanguage, string>;
    description: Record<SiteLanguage, string>;
  }
> = {
  room1: {
    eyebrow: {
      en: "Welcome to the Music Room",
      zh: "欢迎来到音乐房间",
    },
    description: {
      en: "This is where I keep the songs I have written, along with a few traces of how they grew along the way. Come in and have a listen.",
      zh: "这里放着我写的歌，也留着一些它们一路长大的痕迹。进来听听看吧。",
    },
  },
  room2: {
    eyebrow: {
      en: "Welcome to the Picture Book and Animation Room",
      zh: "欢迎来到绘本动画房间",
    },
    description: {
      en: "This is where I keep the stories I have drawn, along with a few ideas that are still taking shape. Come in and have a look around.",
      zh: "这里放着我画下的故事，还有一些正在构思中的内容。进来翻翻看吧。",
    },
  },
  room3: {
    eyebrow: {
      en: "Welcome to the Computer Room",
      zh: "欢迎来到计算机房间",
    },
    description: {
      en: "This is where I keep the programs and projects I have worked on, along with a few things I am still tinkering with. Come in and click around.",
      zh: "这里放着我做过的程序和项目，也有一些还在慢慢折腾的东西。进来点点看吧。",
    },
  },
};

export default function RoomView({
  mode,
  screen,
  currentRoom,
  modalOpen,
  unlockedRooms,
  setCurrentRoom,
  setScreen,
  enterMusicRoom,
  setPuzzleRoom,
  setAnswer,
  setPuzzleMessage,
  unlockRoom,
  markRoomVisited,
  changeMode,
  language,
  setLanguage,
}: {
  mode: Mode;
  screen: Screen;
  currentRoom: RoomId;
  modalOpen: boolean;
  unlockedRooms: RoomId[];
  setCurrentRoom: (room: RoomId | null) => void;
  setScreen: (screen: Screen) => void;
  enterMusicRoom: (roomId: RoomId) => void;
  setPuzzleRoom: (room: RoomId | null) => void;
  setAnswer: (answer: string) => void;
  setPuzzleMessage: (message: string) => void;
  unlockRoom: (roomId: RoomId) => void;
  markRoomVisited: (roomId: RoomId) => void;
  changeMode: () => void;
  language: SiteLanguage;
  setLanguage: Dispatch<SetStateAction<SiteLanguage>>;
}) {
  const { playUISound } = useSound();
  const room = rooms[currentRoom];
  const copy = roomCopy[currentRoom];
  const roomTitle = room.title[language];
  const constructionNotice = room.constructionNotice;
  const isUnderConstruction = room.status === "under-construction";
  const isLocked =
    room.status === "open" &&
    mode === "explore" &&
    !unlockedRooms.includes(currentRoom);
  const shouldUseMelodyLock = isLocked && currentRoom === "room1";
  const [isInsidePlaceholder, setIsInsidePlaceholder] = useState(false);
  const [showMelodyLock, setShowMelodyLock] = useState(false);
  const [melodySuccess, setMelodySuccess] = useState(false);
  const [showConstructionNotice, setShowConstructionNotice] = useState(false);
  const constructionTriggerRef = useRef<HTMLElement | null>(null);

  const contactTheme =
    room.theme === "story" ? "story" : room.theme === "cs" ? "cs" : "house";

  const doorState: DoorState = isUnderConstruction
    ? "under-construction"
    : isLocked
      ? "locked"
      : "open";

  function handleDoorClick() {
    if (isUnderConstruction && constructionNotice) {
      constructionTriggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      playUISound("unavailable");
      setPuzzleRoom(null);
      setShowMelodyLock(false);
      setShowConstructionNotice(true);
      return;
    }

    if (shouldUseMelodyLock) {
      playUISound("door-locked");
      setPuzzleRoom(null);
      setAnswer("");
      setPuzzleMessage("");
      setShowMelodyLock(true);
      return;
    }

    if (isLocked) {
      playUISound("door-locked");
      setPuzzleRoom(currentRoom);
      setAnswer("");
      setPuzzleMessage("");
      return;
    }

    playUISound("door-open");
    markRoomVisited(currentRoom);

    if (currentRoom === "room1") {
      enterMusicRoom(currentRoom);
      return;
    }

    setIsInsidePlaceholder(true);
  }

  function dismissConstructionNotice() {
    playUISound("close");
    setShowConstructionNotice(false);
    window.requestAnimationFrame(() => constructionTriggerRef.current?.focus());
  }

  function handleMelodyUnlock() {
    unlockRoom("room1");
    setShowMelodyLock(false);
    setMelodySuccess(true);
  }

  const doorAriaLabel = isUnderConstruction
    ? language === "en"
      ? `${roomTitle} is under construction. View the notice.`
      : `${roomTitle}施工中，查看施工告示。`
    : isLocked
      ? language === "en"
        ? `${roomTitle} is locked. Open the melody lock.`
        : `${roomTitle}尚未解锁，打开旋律锁。`
      : language === "en"
        ? `Enter ${roomTitle}`
        : `进入${roomTitle}`;

  const doorStateLabel = isUnderConstruction
    ? room.theme === "cs"
      ? language === "en"
        ? "Building..."
        : "搭建中..."
      : language === "en"
        ? "Story in progress"
        : "故事未完待续"
    : language === "en"
      ? "Melody Lock"
      : "旋律锁";

  const guidance = isUnderConstruction
    ? constructionNotice?.label[language] ?? ""
    : melodySuccess
      ? language === "en"
        ? "The melody matches. Click the door again when you are ready."
        : "旋律已经对上了。准备好后，再点击房门进入。"
      : isLocked
        ? language === "en"
          ? "Try the melody puzzle beside the door handle."
          : "试试门把手旁的旋律机关。"
        : currentRoom === "room1"
          ? language === "en"
            ? "The door is open. Come in."
            : "门已开启，请进。"
          : isInsidePlaceholder
            ? language === "en"
              ? "You are inside. More of this room will be arranged later."
              : "你已经进入房间，之后这里会继续布置。"
            : copy.eyebrow[language];

  return (
    <main className={`room-page theme-${room.theme}`}>
      <button
        className="house-control house-control--top-left back-link"
        type="button"
        onClick={() => {
          if (showConstructionNotice) {
            dismissConstructionNotice();
            return;
          }

          playUISound("back");
          setShowMelodyLock(false);
          setCurrentRoom(null);
          setScreen("map");
        }}
      >
        <span className="back-icon" aria-hidden="true">
          <span className="back-arrow">{"‹"}</span>
        </span>
        <span>{language === "en" ? "Back" : "返回"}</span>
      </button>

      <section className="room-wall" aria-labelledby="room-title">
        <h1 id="room-title" className="visually-hidden">
          {roomTitle}
        </h1>

        <div className="scene-layout">
          <article className="room-writing">
            <p className="room-kicker">
              {language === "en" ? "At the room door" : "来到房间门前"}
            </p>
            <strong>{copy.eyebrow[language]}</strong>
            <p className="room-description">{copy.description[language]}</p>
            <p className={`door-guidance state-${doorState}`}>
              <span aria-hidden="true" />
              {guidance}
            </p>
          </article>

          <div className="door-stage">
            <RoomDoor
              theme={room.theme}
              title={roomTitle}
              state={doorState}
              stateLabel={doorStateLabel}
              ariaLabel={doorAriaLabel}
              onActivate={handleDoorClick}
            />
          </div>
        </div>

        <div className="room-floor" aria-hidden="true" />
      </section>

      {showMelodyLock && (
        <MelodyLock
          language={language}
          onUnlock={handleMelodyUnlock}
          onCancel={() => {
            playUISound("back");
            setShowMelodyLock(false);
          }}
        />
      )}

      {showConstructionNotice && constructionNotice && (
        <ConstructionNotice
          notice={constructionNotice}
          roomTitle={room.title}
          language={language}
          onDismiss={dismissConstructionNotice}
        />
      )}

      <ModeSwitcher
        mode={mode}
        screen={screen}
        changeMode={changeMode}
        language={language}
        theme={modeTheme}
      />

      <LanguageSwitcher
        language={language}
        setLanguage={setLanguage}
        theme={controlTheme}
        slot="secondary"
      />

      <ContactInfo
        language={language}
        theme={contactTheme}
        hidden={modalOpen || showConstructionNotice || showMelodyLock}
      />

      <style jsx>{`
        .room-page {
          --scene-wall: #f4ead7;
          --scene-wall-accent: rgba(232, 189, 103, 0.18);
          --scene-ink: var(--house-ink);
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          color: var(--scene-ink);
          background: var(--scene-wall);
          font-family: var(--font-body);
        }

        .theme-music {
          --scene-wall: #f2ead7;
          --scene-wall-accent: rgba(220, 178, 72, 0.17);
          --scene-ink: #314f50;
        }

        .theme-story {
          --scene-wall: #f5e8e7;
          --scene-wall-accent: rgba(217, 143, 163, 0.19);
          --scene-ink: #5f3545;
        }

        .theme-cs {
          --scene-wall: #e8f1ef;
          --scene-wall-accent: rgba(120, 183, 176, 0.2);
          --scene-ink: #315c68;
        }

        .room-page::before,
        .room-page::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: var(--z-scene);
          pointer-events: none;
        }

        .room-page::before {
          background:
            radial-gradient(circle at 24% 19%, rgba(255, 255, 255, 0.72), transparent 28%),
            radial-gradient(circle at 70% 42%, var(--scene-wall-accent), transparent 35%),
            repeating-linear-gradient(90deg, rgba(102, 72, 49, 0.035) 0 1px, transparent 1px 74px);
        }

        .theme-music.room-page::before {
          background:
            linear-gradient(112deg, rgba(255, 255, 255, 0.72) 0 19%, transparent 19.2% 68%, rgba(221, 174, 65, 0.08) 68.2%),
            radial-gradient(ellipse at 79% 18%, rgba(255, 248, 205, 0.78), transparent 31%),
            repeating-linear-gradient(7deg, rgba(116, 93, 57, 0.028) 0 1px, transparent 1px 13px),
            linear-gradient(180deg, #f7f0df, #efe4cf);
        }

        .theme-music.room-page::after {
          left: auto;
          right: 2%;
          top: 5%;
          bottom: auto;
          width: min(34vw, 500px);
          height: min(52vh, 480px);
          opacity: 0.28;
          background:
            radial-gradient(ellipse at 20% 78%, rgba(81, 113, 67, 0.38) 0 4%, transparent 5%),
            radial-gradient(ellipse at 37% 62%, rgba(81, 113, 67, 0.3) 0 6%, transparent 7%),
            radial-gradient(ellipse at 52% 43%, rgba(81, 113, 67, 0.25) 0 5%, transparent 6%),
            radial-gradient(ellipse at 69% 29%, rgba(81, 113, 67, 0.2) 0 7%, transparent 8%),
            linear-gradient(64deg, transparent 0 48%, rgba(78, 100, 61, 0.22) 49% 49.6%, transparent 50%);
          filter: blur(0.4px);
          transform: rotate(-9deg);
        }

        .theme-story::after {
          left: 4%;
          top: 23%;
          width: 170px;
          height: 110px;
          border: 2px solid rgba(145, 91, 107, 0.08);
          border-right: 0;
          border-bottom: 0;
          transform: rotate(-4deg);
        }

        .theme-cs::after {
          left: auto;
          right: 5%;
          top: 25%;
          width: 180px;
          height: 130px;
          background:
            linear-gradient(90deg, rgba(55, 113, 128, 0.07) 1px, transparent 1px),
            linear-gradient(180deg, rgba(55, 113, 128, 0.07) 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: linear-gradient(135deg, black, transparent 78%);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--scene-ink);
          cursor: pointer;
          font-weight: 700;
          transition: color var(--duration-fast) var(--ease-object);
        }

        .back-icon {
          display: inline-flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          border: 1px solid color-mix(in srgb, var(--scene-ink) 34%, transparent);
          border-radius: 50%;
          background: color-mix(in srgb, var(--scene-wall) 84%, white);
          box-shadow: var(--shadow-contact);
        }

        .back-arrow {
          font-size: 26px;
          line-height: 1;
          transform: translate(-1px, -1px);
        }

        .room-wall {
          position: relative;
          z-index: var(--z-object);
          min-height: 100svh;
        }

        .room-wall::before,
        .room-wall::after {
          position: absolute;
          z-index: var(--z-object);
          display: block;
          content: "";
          pointer-events: none;
        }

        .theme-music .room-wall::before {
          right: 4%;
          bottom: 88px;
          width: min(47vw, 680px);
          height: min(64vh, 610px);
          background:
            linear-gradient(102deg, rgba(255, 255, 255, 0.24), transparent 23% 78%, rgba(129, 96, 55, 0.05)),
            repeating-linear-gradient(0deg, rgba(120, 92, 52, 0.025) 0 1px, transparent 1px 17px);
          border: 1px solid rgba(141, 106, 61, 0.08);
          border-bottom: 0;
          border-radius: 48% 48% 0 0 / 15% 15% 0 0;
        }

        .theme-music .room-wall::after {
          right: 5%;
          bottom: 88px;
          width: min(45vw, 650px);
          height: 28px;
          border-top: 3px solid rgba(40, 112, 124, 0.42);
          border-bottom: 3px solid rgba(40, 112, 124, 0.35);
          background:
            repeating-linear-gradient(90deg, #eaf2df 0 26px, #2d7884 26px 29px, #e3b641 29px 33px, #eaf2df 33px 59px);
          box-shadow: 0 5px 9px rgba(77, 57, 34, 0.08);
        }

        .theme-story .room-wall::before {
          right: 7%;
          bottom: 104px;
          width: min(35vw, 480px);
          height: min(48vh, 430px);
          border: 2px solid rgba(143, 87, 104, 0.06);
          border-right: 0;
          border-bottom: 0;
          background:
            linear-gradient(12deg, transparent 0 64%, rgba(143, 87, 104, 0.045) 64% 65%, transparent 65%),
            radial-gradient(ellipse at 74% 12%, rgba(230, 194, 102, 0.12) 0 8%, transparent 9%);
          transform: rotate(2deg);
        }

        .theme-story .room-wall::after {
          right: 12%;
          bottom: 83px;
          width: 88px;
          height: 34px;
          background:
            linear-gradient(105deg, rgba(255, 248, 238, 0.38) 0 48%, transparent 49%),
            linear-gradient(18deg, transparent 0 48%, rgba(116, 139, 133, 0.1) 49% 54%, transparent 55%);
          clip-path: polygon(0 8%, 88% 0, 100% 92%, 8% 100%);
          transform: rotate(-5deg);
        }

        .theme-cs .room-wall::before {
          right: 0;
          bottom: 84px;
          width: min(42vw, 560px);
          height: min(58vh, 520px);
          border-top: 1px solid rgba(76, 146, 159, 0.08);
          border-left: 1px solid rgba(76, 146, 159, 0.07);
          background:
            linear-gradient(90deg, transparent 0 62%, rgba(172, 228, 226, 0.08) 62%),
            radial-gradient(circle at 82% 19%, rgba(199, 246, 242, 0.2) 0 2px, transparent 3px),
            radial-gradient(circle at 91% 42%, rgba(199, 246, 242, 0.18) 0 3px, transparent 4px);
          mask-image: linear-gradient(135deg, transparent, black 40%, black 82%, transparent);
        }

        .theme-cs .room-wall::after {
          right: 21%;
          bottom: 74px;
          width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(110, 194, 196, 0.26), transparent);
          box-shadow:
            34px -8px 0 rgba(183, 238, 235, 0.2),
            74px 5px 0 rgba(183, 238, 235, 0.14);
        }

        .scene-layout {
          position: relative;
          z-index: calc(var(--z-object) + 2);
          display: grid;
          width: min(1180px, calc(100% - 72px));
          min-height: 100svh;
          margin: 0 auto;
          padding: 104px 0 86px;
          grid-template-columns: minmax(250px, 0.72fr) minmax(390px, 1.28fr);
          align-items: end;
          gap: clamp(34px, 7vw, 112px);
          box-sizing: border-box;
        }

        .room-writing {
          align-self: center;
          max-width: 390px;
          margin-bottom: 9vh;
        }

        .theme-music .room-writing {
          position: relative;
          padding: 26px 28px 28px 30px;
          border-left: 3px solid #e1b23f;
          background: linear-gradient(90deg, rgba(255, 252, 237, 0.7), rgba(255, 252, 237, 0.12) 82%, transparent);
          box-shadow: -12px 14px 28px rgba(83, 62, 36, 0.04);
        }

        .theme-music .room-writing::before {
          position: absolute;
          left: -3px;
          top: 0;
          width: 82px;
          height: 3px;
          background: linear-gradient(90deg, #257887, #e1b23f);
          content: "";
        }

        .room-kicker {
          margin: 0;
          color: color-mix(in srgb, var(--scene-ink) 74%, transparent);
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .room-writing > strong {
          display: block;
          margin-top: var(--space-3);
          font-family: var(--font-display);
          font-size: clamp(29px, 3.1vw, 46px);
          font-weight: 700;
          line-height: 1.1;
        }

        .room-description {
          max-width: 38ch;
          margin: var(--space-4) 0 0;
          color: color-mix(in srgb, var(--scene-ink) 79%, transparent);
          font-size: clamp(14px, 1.3vw, 17px);
          line-height: 1.72;
        }

        .door-guidance {
          display: flex;
          max-width: 36ch;
          align-items: flex-start;
          gap: 10px;
          margin: var(--space-5) 0 0;
          color: color-mix(in srgb, var(--scene-ink) 82%, transparent);
          font-size: 13px;
          line-height: 1.55;
        }

        .door-guidance span {
          width: 9px;
          height: 9px;
          flex: 0 0 9px;
          margin-top: 5px;
          border: 1px solid currentColor;
          border-radius: 50%;
          background: var(--room-music);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--room-music) 23%, transparent);
        }

        .theme-story .door-guidance span {
          background: var(--room-story);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--room-story) 23%, transparent);
        }

        .theme-cs .door-guidance span {
          border-radius: 2px;
          background: var(--room-cs);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--room-cs) 23%, transparent);
        }

        .door-stage {
          position: relative;
          z-index: calc(var(--z-object) + 4);
          justify-self: center;
          width: clamp(370px, 33vw, 470px);
          height: clamp(550px, 74vh, 700px);
        }

        .theme-music .door-stage {
          width: clamp(470px, 42vw, 560px);
          height: clamp(590px, 79vh, 740px);
        }

        .theme-story .door-stage {
          width: clamp(390px, 35vw, 490px);
          height: clamp(540px, 72vh, 675px);
        }

        .theme-cs .door-stage {
          width: clamp(365px, 32vw, 450px);
          height: clamp(545px, 73vh, 680px);
        }

        .room-floor {
          position: absolute;
          inset: auto 0 0;
          z-index: var(--z-object);
          height: 88px;
          border-top: 2px solid rgba(108, 70, 39, 0.15);
          background:
            repeating-linear-gradient(90deg, rgba(106, 70, 39, 0.1) 0 1px, transparent 1px 84px),
            linear-gradient(180deg, #dfbf8e, #c99762);
          box-shadow: inset 0 1px 0 rgba(255, 246, 222, 0.46);
        }

        .theme-music .room-floor {
          height: 104px;
          border-top-color: rgba(125, 88, 46, 0.2);
          background:
            linear-gradient(12deg, transparent 0 49.5%, rgba(126, 84, 45, 0.09) 49.7% 50.2%, transparent 50.4%),
            repeating-linear-gradient(90deg, transparent 0 114px, rgba(126, 84, 45, 0.1) 114px 116px),
            linear-gradient(180deg, #d9b184, #bf875c);
          background-size: 230px 104px, auto, auto;
          box-shadow:
            inset 0 6px 12px rgba(91, 59, 34, 0.08),
            inset 0 1px 0 rgba(255, 238, 205, 0.48);
        }

        .theme-story .room-floor {
          border-top-color: rgba(126, 73, 89, 0.16);
          background:
            repeating-linear-gradient(90deg, rgba(126, 73, 89, 0.08) 0 1px, transparent 1px 84px),
            linear-gradient(180deg, #dfc3b1, #c99d8e);
        }

        .theme-cs .room-floor {
          border-top-color: rgba(53, 111, 130, 0.15);
          background:
            repeating-linear-gradient(90deg, rgba(53, 111, 130, 0.08) 0 1px, transparent 1px 84px),
            linear-gradient(180deg, #cad9d5, #aebfbd);
        }

        .room-floor::after {
          position: absolute;
          left: 54%;
          top: 10px;
          width: 31%;
          height: 34px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(87, 55, 31, 0.1), transparent 70%);
          content: "";
          pointer-events: none;
        }

        .theme-story .room-floor::after {
          background:
            linear-gradient(11deg, transparent 0 44%, rgba(151, 91, 111, 0.08) 45% 48%, transparent 49%),
            radial-gradient(ellipse, rgba(122, 72, 89, 0.07), transparent 70%);
        }

        .theme-cs .room-floor::after {
          background:
            radial-gradient(circle at 30% 45%, rgba(214, 255, 249, 0.7) 0 2px, transparent 3px),
            radial-gradient(circle at 62% 60%, rgba(195, 244, 241, 0.54) 0 3px, transparent 4px),
            linear-gradient(90deg, transparent, rgba(172, 229, 227, 0.2), transparent);
        }

        @media (max-width: 980px) {
          .scene-layout {
            width: min(100% - 48px, 920px);
            grid-template-columns: minmax(220px, 0.68fr) minmax(350px, 1.32fr);
            gap: 28px;
          }

          .door-stage,
          .theme-story .door-stage,
          .theme-cs .door-stage {
            width: min(42vw, 410px);
          }

          .theme-music .door-stage {
            width: min(52vw, 500px);
          }
        }

        @media (max-width: 760px) {
          .room-page {
            min-height: 100svh;
            overflow-x: hidden;
            overflow-y: auto;
          }

          .scene-layout {
            display: flex;
            width: 100%;
            min-height: 100svh;
            flex-direction: column;
            gap: 22px;
            padding: 176px 18px 88px;
          }

          .room-writing {
            width: min(100%, 520px);
            max-width: none;
            margin: 0 auto;
            padding-right: 72px;
            box-sizing: border-box;
          }

          .room-writing > strong {
            font-size: clamp(25px, 7.4vw, 34px);
          }

          .room-description {
            font-size: 14px;
            line-height: 1.62;
          }

          .door-guidance {
            margin-top: var(--space-4);
            font-size: 12px;
          }

          .door-stage,
          .theme-story .door-stage,
          .theme-cs .door-stage {
            width: min(84vw, 370px);
            height: min(60svh, 540px);
            min-height: 430px;
            flex: 0 0 auto;
            align-self: center;
          }

          .theme-music .door-stage {
            width: min(90vw, 410px);
            height: min(70svh, 620px);
            min-height: 500px;
          }

          .theme-story .door-stage {
            width: min(87vw, 385px);
          }

          .room-floor {
            height: 76px;
          }

          .theme-story::after,
          .theme-cs::after {
            display: none;
          }

          .theme-music .room-wall::before,
          .theme-story .room-wall::before,
          .theme-cs .room-wall::before {
            right: -8%;
            bottom: 72px;
            width: 64vw;
            opacity: 0.7;
          }

          .theme-music .room-wall::before {
            right: -18%;
            bottom: 76px;
            width: 108vw;
            height: 62%;
          }

          .theme-music .room-wall::after,
          .theme-story .room-wall::after,
          .theme-cs .room-wall::after {
            right: 8%;
          }

          .theme-music .room-wall::after {
            right: 4%;
            bottom: 76px;
            width: 92%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-link {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
