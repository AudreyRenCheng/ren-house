"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type SetStateAction } from "react";

import type {
  Screen,
  Mode,
  RoomId,
  MusicRoomSource,
  SongId,
  SiteLanguage,
} from "@/types";

import ContactInfo from "@/components/ContactInfo";
import ModeSwitcher from "@/components/ModeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HouseMap from "@/components/HouseMap";
import Entrance from "@/components/Entrance";
import RoomView from "@/components/RoomView";
import PuzzleModal from "@/components/PuzzleModal";
import { useSound } from "@/components/SoundProvider";
import SoundToggle from "@/components/SoundToggle";
import { roomIntros } from "@/data/roomIntros";
import { SongsProvider } from "@/components/SongsProvider";

const MusicRoom = dynamic(() => import("@/components/MusicRoom"), {
  loading: () => null,
});
const SongPlayer = dynamic(() => import("@/components/SongPlayer"), {
  loading: () => null,
});

const warmControlTheme = {
  color: "#5a321d",
  border: "1px solid rgba(120, 70, 35, 0.45)",
  background: "rgba(255, 248, 236, 0.72)",
};

const warmModeTheme = {
  ...warmControlTheme,
  mutedColor: "#7a533a",
};

function HomeContent() {
  const { playUISound } = useSound();
  const [screen, setScreen] = useState<Screen>("entrance");
  const [mode, setMode] = useState<Mode>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomId | null>(null);
  const [musicRoomSource, setMusicRoomSource] =
    useState<MusicRoomSource>("roomDoor");
  const [musicRoomScrollPosition, setMusicRoomScrollPosition] = useState<
    number | null
  >(null);
  const [visitedRooms, setVisitedRooms] = useState<RoomId[]>([]);
  const [unlockedRooms, setUnlockedRooms] = useState<RoomId[]>([]);
  const [puzzleRoom, setPuzzleRoom] = useState<RoomId | null>(null);
  const [answer, setAnswer] = useState("");
  const [puzzleMessage, setPuzzleMessage] = useState("");

  const [language, setLanguage] = useState<SiteLanguage>("en");
  const musicRoomLanguageScrollRef = useRef<number | null>(null);
  const [currentSong, setCurrentSong] = useState<SongId | null>(null);
  const [showLyricTranslation, setShowLyricTranslation] = useState(true);

  useEffect(() => {
    const resetTranslation = window.setTimeout(() => {
      setShowLyricTranslation(true);
    }, 0);

    return () => window.clearTimeout(resetTranslation);
  }, [currentSong, language]);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    if (screen !== "musicRoom" || musicRoomLanguageScrollRef.current === null) {
      return;
    }

    const scrollPosition = musicRoomLanguageScrollRef.current;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      musicRoomLanguageScrollRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [language, screen]);

  function setMusicRoomLanguage(nextLanguage: SetStateAction<SiteLanguage>) {
    musicRoomLanguageScrollRef.current = window.scrollY;
    setLanguage(nextLanguage);
  }

  function enterMode(selectedMode: Mode) {
    setMode(selectedMode);
    setMusicRoomSource("roomDoor");
    setScreen("map");
  }

  function enterMusicFromEntrance() {
    setCurrentRoom("room1");
    setMusicRoomSource("quickEntry");
    setMusicRoomScrollPosition(null);
    setScreen("musicRoom");
  }

  function enterMusicRoom(roomId: RoomId) {
    setCurrentRoom(roomId);
    setMusicRoomSource("roomDoor");
    setMusicRoomScrollPosition(null);
    setScreen("musicRoom");
  }

  function unlockRoom(roomId: RoomId) {
    setUnlockedRooms((prev) =>
      prev.includes(roomId) ? prev : [...prev, roomId]
    );
  }

  function markRoomVisited(roomId: RoomId) {
    setVisitedRooms((prev) =>
      prev.includes(roomId) ? prev : [...prev, roomId]
    );
  }

  function actuallyOpenRoom(roomId: RoomId) {
    setCurrentRoom(roomId);
    unlockRoom(roomId);
    setScreen("room");
  }

  function handleRoomClick(roomId: RoomId) {
    setCurrentRoom(roomId);
    setMusicRoomSource("roomDoor");
    setScreen("room");
  }

  function checkPuzzleAnswer() {
    if (!puzzleRoom) return;

    if (answer.trim().toLowerCase() === "open") {
      const roomToOpen = puzzleRoom;
      playUISound("door-unlock");
      unlockRoom(roomToOpen);
      setPuzzleRoom(null);
      setAnswer("");
      setPuzzleMessage("");
      actuallyOpenRoom(roomToOpen);
    } else {
      playUISound("cancel");
      setPuzzleMessage(
        language === "en"
          ? "Not quite. Try again, or use the master key."
          : "还不太对。可以再试一次，或者使用万能钥匙。"
      );
    }
  }

  function useMasterKey() {
    if (!puzzleRoom) return;

    const roomToOpen = puzzleRoom;
    playUISound("door-unlock");
    unlockRoom(roomToOpen);
    setPuzzleRoom(null);
    setAnswer("");
    setPuzzleMessage("");
    actuallyOpenRoom(roomToOpen);
  }

  function changeMode() {
    setMode((prev) => (prev === "casual" ? "explore" : "casual"));
    setPuzzleRoom(null);
    setAnswer("");
    setPuzzleMessage("");
  }

  function openSong(songId: SongId) {
    setMusicRoomScrollPosition(window.scrollY);
    window.scrollTo({ top: 0, behavior: "auto" });
    setCurrentSong(songId);
    setScreen("song");
  }

  function resetToHome() {
    playUISound("back");
    setScreen("entrance");
    setMode(null);
    setCurrentRoom(null);
    setMusicRoomSource("roomDoor");
    setMusicRoomScrollPosition(null);
    setVisitedRooms([]);
    setUnlockedRooms([]);
    setPuzzleRoom(null);
    setAnswer("");
    setPuzzleMessage("");
    setCurrentSong(null);
    setShowLyricTranslation(true);
  }

  if (screen === "entrance") {
    return (
      <>
        <Entrance
          enterMode={enterMode}
          onQuickMusicEntry={enterMusicFromEntrance}
          language={language}
        />

        <LanguageSwitcher
          language={language}
          setLanguage={setLanguage}
          theme={{
            color: "#67243a",
            border: "1px solid rgba(255, 211, 111, 0.68)",
            background: "rgba(255, 240, 184, 0.78)",
          }}
        />
        <ContactInfo language={language} theme="house" />
        <SoundToggle language={language} />
      </>
    );
  }

  if (screen === "map") {
    return (
      <main className="map-page">
        <button
          className="house-control house-control--top-left back-link map-home-link"
          onClick={resetToHome}
        >
          <span className="back-icon" aria-hidden="true">
            <span className="back-arrow">{"‹"}</span>
          </span>
          <span>{language === "en" ? "Home" : "返回首页"}</span>
        </button>

        <div className="map-desk">
          <section className="paper-map" aria-labelledby="map-title">
            <div className="paper-tape left" aria-hidden="true" />
            <div className="paper-tape right" aria-hidden="true" />

            <header className="paper-header">
              <p>{language === "en" ? "In the Entryway" : "玄关处的"}</p>
              <h1 id="map-title">
                {language === "en" ? "House Floor Plan" : "小屋平面图"}
              </h1>
              <span>
                {language === "en"
                  ? "Which room would you like to visit first?"
                  : "想先去哪个房间看看？"}
              </span>
            </header>

            <div className="map-sheet">
              <HouseMap
                mode={mode}
                screen={screen}
                currentRoom={currentRoom}
                visitedRooms={visitedRooms}
                unlockedRooms={unlockedRooms}
                handleRoomClick={handleRoomClick}
                language={language}
              />
            </div>
          </section>
        </div>

        <PuzzleModal
          puzzleRoom={puzzleRoom}
          answer={answer}
          puzzleMessage={puzzleMessage}
          setAnswer={setAnswer}
          checkPuzzleAnswer={checkPuzzleAnswer}
          useMasterKey={useMasterKey}
          setPuzzleRoom={setPuzzleRoom}
          language={language}
        />

        <ModeSwitcher
          mode={mode}
          screen={screen}
          changeMode={changeMode}
          language={language}
          theme={warmModeTheme}
        />

        <LanguageSwitcher
          language={language}
          setLanguage={setLanguage}
          theme={warmControlTheme}
          slot="secondary"
        />

        <ContactInfo
          language={language}
          theme="house"
          hidden={Boolean(puzzleRoom)}
        />
        <SoundToggle language={language} slot="tertiary" />

        <style jsx>{`
          .map-page {
            position: relative;
            min-height: 100vh;
            overflow-x: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 36px 22px 72px;
            color: #3f2a1d;
            background:
              radial-gradient(circle at top, rgba(255, 255, 255, 0.45), transparent 45%),
              repeating-linear-gradient(
                90deg,
                rgba(120, 78, 42, 0.035) 0,
                rgba(120, 78, 42, 0.035) 1px,
                transparent 1px,
                transparent 42px
              ),
              linear-gradient(180deg, #f7f0e6 0%, #eadcc8 100%);
            font-family: var(--font-sans);
          }

          .map-page::before {
            content: "";
            position: absolute;
            inset: auto 0 0;
            height: 31vh;
            background:
              repeating-linear-gradient(
                90deg,
                rgba(120, 78, 42, 0.07) 0 1px,
                transparent 1px 92px
              ),
              linear-gradient(180deg, rgba(221, 184, 128, 0.2), rgba(199, 143, 82, 0.26));
            border-top: 1px solid rgba(120, 78, 42, 0.13);
            pointer-events: none;
          }

          .map-desk {
            position: relative;
            z-index: var(--z-object);
            display: flex;
            width: min(100%, 1080px);
            flex-direction: column;
            align-items: center;
          }

          .paper-map {
            position: relative;
            width: min(100%, 1040px);
            padding: clamp(20px, 2vw, 28px);
            border: 1px solid rgba(120, 78, 42, 0.22);
            border-radius: 2px;
            background:
              repeating-linear-gradient(
                7deg,
                transparent 0 23px,
                rgba(119, 82, 49, 0.025) 23px 24px
              ),
              radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.62), transparent 34%),
              radial-gradient(circle at 78% 74%, rgba(196, 153, 103, 0.055), transparent 37%),
              #fff8ec;
            box-shadow:
              0 28px 70px rgba(120, 78, 42, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.75);
            transform: rotate(-0.45deg);
          }

          .paper-map::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(90deg, transparent 49.8%, rgba(117, 77, 43, 0.045) 50%, transparent 50.2%),
              linear-gradient(180deg, transparent 61.8%, rgba(117, 77, 43, 0.035) 62%, transparent 62.2%);
            pointer-events: none;
          }

          .paper-tape {
            position: absolute;
            top: -13px;
            z-index: calc(var(--z-object) + 2);
            width: 84px;
            height: 24px;
            border-radius: 2px;
            background: rgba(219, 235, 239, 0.78);
            box-shadow: 0 5px 10px rgba(104, 67, 38, 0.08);
          }

          .paper-tape.left {
            left: 12%;
            transform: rotate(-4deg);
          }

          .paper-tape.right {
            right: 13%;
            transform: rotate(3deg);
          }

          .paper-header {
            position: relative;
            z-index: var(--z-object);
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: end;
            gap: 5px 18px;
            padding-bottom: 18px;
            border-bottom: 1px dashed rgba(120, 78, 42, 0.28);
            color: #3f2a1d;
          }

          .paper-header p {
            grid-column: 1 / -1;
            margin: 0;
            color: #9b673c;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .paper-header h1 {
            margin: 0;
            font-size: clamp(30px, 3.2vw, 46px);
            line-height: 1.05;
            letter-spacing: 0;
          }

          .paper-header span {
            color: #725038;
            font-size: clamp(14px, 1.3vw, 17px);
            line-height: 1.5;
            text-align: right;
          }

          .map-sheet {
            position: relative;
            z-index: var(--z-object);
            display: flex;
            justify-content: center;
            width: 100%;
            padding-top: clamp(16px, 2vw, 24px);
          }

          .back-link {
            padding: 0;
            border: none;
            background: transparent;
            color: #7a4a28;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font: inherit;
            font-size: 16px;
            font-weight: 600;
            transition:
              color var(--duration-fast) var(--ease-object),
              transform var(--duration-fast) var(--ease-object);
          }

          .map-home-link {
            justify-content: flex-start;
          }

          .back-link:hover {
            color: #4f2d18;
            transform: translateX(-2px);
          }

          .back-link:focus-visible {
            outline: 3px solid rgba(95, 143, 166, 0.3);
            outline-offset: 6px;
            border-radius: 999px;
          }

          .back-icon {
            width: 26px;
            height: 26px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 248, 236, 0.72);
            border: 1px solid rgba(120, 70, 35, 0.28);
            color: #7a4a28;
            box-shadow: 0 4px 10px rgba(112, 74, 39, 0.1);
            transition:
              background var(--duration-fast) var(--ease-object),
              transform var(--duration-fast) var(--ease-object),
              border-color var(--duration-fast) var(--ease-object);
          }

          .back-link:hover .back-icon {
            background: rgba(255, 248, 236, 0.95);
            border-color: rgba(120, 70, 35, 0.45);
          }

          .back-arrow {
            display: inline-block;
            font-size: 24px;
            font-weight: 500;
            line-height: 1;
            transform: translate(-1px, -1px);
          }

          @media (max-width: 760px) {
            .map-page {
              align-items: flex-start;
              padding: 196px 12px 88px;
            }

            .paper-map {
              padding: 18px 12px 20px;
              transform: rotate(-0.25deg);
            }

            .paper-tape {
              width: 62px;
              height: 19px;
            }

            .paper-header {
              display: block;
              padding-bottom: 14px;
            }

            .paper-header p {
              font-size: 10px;
            }

            .paper-header h1 {
              margin-top: 5px;
              font-size: clamp(27px, 8vw, 34px);
            }

            .paper-header span {
              display: block;
              margin-top: 8px;
              text-align: left;
              font-size: 13px;
            }

            .map-sheet {
              padding-top: 14px;
            }

          }
        `}</style>
      </main>
    );
  }

  if (screen === "room" && currentRoom) {
    return (
      <>
        <RoomView
          mode={mode}
          screen={screen}
          currentRoom={currentRoom}
          modalOpen={Boolean(puzzleRoom)}
          unlockedRooms={unlockedRooms}
          setCurrentRoom={setCurrentRoom}
          setScreen={setScreen}
          enterMusicRoom={enterMusicRoom}
          setPuzzleRoom={setPuzzleRoom}
          setAnswer={setAnswer}
          setPuzzleMessage={setPuzzleMessage}
          unlockRoom={unlockRoom}
          markRoomVisited={markRoomVisited}
          changeMode={changeMode}
          language={language}
          setLanguage={setLanguage}
        />

        <PuzzleModal
          puzzleRoom={puzzleRoom}
          answer={answer}
          puzzleMessage={puzzleMessage}
          setAnswer={setAnswer}
          checkPuzzleAnswer={checkPuzzleAnswer}
          useMasterKey={useMasterKey}
          setPuzzleRoom={setPuzzleRoom}
          language={language}
        />
        <SoundToggle language={language} slot="tertiary" />
      </>
    );
  }

  if ((screen === "musicRoom" || screen === "song") && currentRoom === "room1") {
    const intro = roomIntros[currentRoom];

    if (!intro) return null;
    const musicRoomActive = screen === "musicRoom";

    return (
      <>
        <div hidden={!musicRoomActive}>
          <MusicRoom
            intro={intro}
            language={language}
            restoreScrollPosition={musicRoomScrollPosition}
            restoreFocusSongId={
              musicRoomScrollPosition !== null ? currentSong : null
            }
            onSelectSong={openSong}
            active={musicRoomActive}
            onBack={() => {
              setMusicRoomScrollPosition(null);
              window.scrollTo({ top: 0, behavior: "auto" });

              if (musicRoomSource === "quickEntry") {
                setCurrentRoom(null);
                setScreen("entrance");
                return;
              }

              setScreen("room");
            }}
          />

          <LanguageSwitcher
            language={language}
            setLanguage={setMusicRoomLanguage}
            theme={warmControlTheme}
          />
          <ContactInfo language={language} theme="music" />
          <SoundToggle language={language} />
        </div>

        {screen === "song" && currentSong && (
          <>
            <SongPlayer
              currentSong={currentSong}
              onBack={() => setScreen("musicRoom")}
              language={language}
              setLanguage={setLanguage}
              showLyricTranslation={showLyricTranslation}
              setShowLyricTranslation={setShowLyricTranslation}
            />
            <SoundToggle language={language} />
          </>
        )}
      </>
    );
  }

  return null;
}

export default function Home() {
  return <SongsProvider><HomeContent /></SongsProvider>;
}
