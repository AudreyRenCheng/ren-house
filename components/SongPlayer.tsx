"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import ContactInfo from "@/components/ContactInfo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MemoryProjector from "@/components/MemoryProjector";
import { useSound } from "@/components/SoundProvider";
import { useSongs } from "@/components/SongsProvider";
import type { Song } from "@/types";
import type { SongId, SiteLanguage } from "@/types";

export default function SongPlayer({
  currentSong,
  onBack,
  language,
  setLanguage,
  showLyricTranslation,
  setShowLyricTranslation,
}: {
  currentSong: SongId;
  onBack: () => void;
  language: SiteLanguage;
  setLanguage: Dispatch<SetStateAction<SiteLanguage>>;
  showLyricTranslation: boolean;
  setShowLyricTranslation: Dispatch<SetStateAction<boolean>>;
}) {
  const songs = useSongs();
  const { playUISound } = useSound();
  const song = songs[currentSong];
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolumeRef = useRef(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioError, setAudioError] = useState("");
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    setAudioError("");
    setCoverError(false);
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function formatPlaybackTime(value: number) {
    if (!Number.isFinite(value) || value < 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setAudioError("");
      } catch {
        setIsPlaying(false);
        setAudioError(
          language === "en"
            ? "This audio file could not be loaded or is not supported."
            : "音频无法加载或格式不受支持。"
        );
      }
    } else {
      audio.pause();
    }
  }

  function toggleMute() {
    if (volume > 0) {
      previousVolumeRef.current = volume;
      setVolume(0);
      return;
    }

    setVolume(previousVolumeRef.current || 0.8);
  }

  function getSongTitle(
    selectedSong: Song,
    currentLanguage: SiteLanguage
  ) {
    const title = selectedSong.title;

    if (title.originalLanguage === currentLanguage) return title.original;

    const translatedTitle = title.translation[currentLanguage];
    if (!translatedTitle) return title.original;

    return currentLanguage === "zh"
      ? `${title.original}（${translatedTitle}）`
      : `${title.original} (${translatedTitle})`;
  }

  const songTitle = getSongTitle(song, language);
  const translatedSongTitle =
    song.title.originalLanguage === language
      ? null
      : song.title.translation[language] ?? null;
  const hasTranslatableLyrics = song.lyrics.lines.some(
    (line) => line.translation && Object.values(line.translation).some(Boolean)
  );

  return (
    <main className={`song-player-page language-${language}`}>
      <button
        className="house-control house-control--top-left back-link"
        type="button"
        onClick={() => {
          playUISound("back");
          onBack();
        }}
      >
        <span className="back-icon" aria-hidden="true">
          <span className="back-arrow">{"‹"}</span>
        </span>
        <span>{language === "en" ? "Music Shelf" : "唱片架"}</span>
      </button>

      <section className="song-stage" aria-labelledby="song-title">
        <div className="listening-room">
          <section className="song-object" aria-label={songTitle}>
            <div className="object-index" aria-hidden="true">
              <span>{language === "en" ? "Music archive" : "音乐档案"}</span>
              <span>{currentSong.replace("song", "0")}</span>
            </div>

            <figure className="cover-exhibit">
              <div className="cover-mount">
                <div className="album-cover-large">
                  {song.cover && !coverError ? <Image
                    src={song.cover}
                    alt={songTitle}
                    fill
                    priority
                    sizes="(max-width: 600px) 78vw, (max-width: 980px) 320px, 34vw"
                    onError={() => setCoverError(true)}
                  /> : <span className="cover-fallback">{language === "en" ? "Cover unavailable" : "封面无法加载"}</span>}
                </div>
              </div>
            </figure>

            <div className="song-info">
              <p className="archive-label">
                {language === "en" ? "A song from this room" : "收藏于音乐房"}
              </p>
              <h1 id="song-title">
                <span className="title-primary">{song.title.original}</span>
                {translatedSongTitle && (
                  <span className="title-translation">
                    {translatedSongTitle}
                  </span>
                )}
              </h1>
              <p className="song-description">{song.description[language]}</p>

              <div className="audio-console">
                <div className="console-heading" aria-hidden="true">
                  <span />
                  <span>{language === "en" ? "Playback" : "播放"}</span>
                </div>
                <audio
                  ref={audioRef}
                  src={song.audio}
                  preload="metadata"
                  onLoadedMetadata={(event) =>
                    setDuration(
                      Number.isFinite(event.currentTarget.duration)
                        ? event.currentTarget.duration
                        : 0
                    )
                  }
                  onDurationChange={(event) =>
                    setDuration(
                      Number.isFinite(event.currentTarget.duration)
                        ? event.currentTarget.duration
                        : 0
                    )
                  }
                  onTimeUpdate={(event) =>
                    setCurrentTime(event.currentTarget.currentTime)
                  }
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setIsPlaying(false);
                    setDuration(0);
                    setAudioError(language === "en" ? "This audio file could not be loaded or is not supported." : "音频无法加载或格式不受支持。");
                  }}
                >
                  {language === "en"
                    ? "Your browser does not support the audio element."
                    : "你的浏览器不支持音频播放。"}
                </audio>
                {audioError && <p role="alert" className="audio-error">{audioError}</p>}
                <div className="audio-controls">
                  <button
                    className="audio-play-button"
                    type="button"
                    onClick={togglePlayback}
                    disabled={Boolean(audioError)}
                    aria-label={
                      isPlaying
                        ? language === "en"
                          ? "Pause"
                          : "暂停"
                        : language === "en"
                          ? "Play"
                          : "播放"
                    }
                  >
                    <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
                  </button>

                  <span className="audio-time">
                    {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
                  </span>

                  <input
                    className="audio-progress"
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={Math.min(currentTime, duration || 0)}
                    aria-label={language === "en" ? "Song progress" : "歌曲进度"}
                    style={{
                      background: `linear-gradient(90deg, var(--med-blue) 0 ${
                        duration > 0 ? (currentTime / duration) * 100 : 0
                      }%, #b9cdc7 ${
                        duration > 0 ? (currentTime / duration) * 100 : 0
                      }% 100%)`,
                    }}
                    onChange={(event) => {
                      const nextTime = Number(event.currentTarget.value);
                      if (audioRef.current) audioRef.current.currentTime = nextTime;
                      setCurrentTime(nextTime);
                    }}
                  />

                  <button
                    className="audio-volume-button"
                    type="button"
                    onClick={toggleMute}
                    aria-label={
                      volume > 0
                        ? language === "en"
                          ? "Mute"
                          : "静音"
                        : language === "en"
                          ? "Unmute"
                          : "取消静音"
                    }
                  >
                    <span aria-hidden="true">{volume > 0 ? "◖))" : "◖×"}</span>
                  </button>

                  <input
                    className="audio-volume-range"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    aria-label={language === "en" ? "Volume" : "音量"}
                    style={{
                      background: `linear-gradient(90deg, var(--med-olive) 0 ${
                        volume * 100
                      }%, #c7d2ca ${volume * 100}% 100%)`,
                    }}
                    onChange={(event) => {
                      const nextVolume = Number(event.currentTarget.value);
                      if (nextVolume > 0) previousVolumeRef.current = nextVolume;
                      setVolume(nextVolume);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="lyrics-section" aria-labelledby="lyrics-title">
            <div className="reader-housing">
              <span className="housing-detail top-left" aria-hidden="true" />
              <span className="housing-detail top-right" aria-hidden="true" />
              <span className="housing-detail bottom-left" aria-hidden="true" />
              <span className="housing-detail bottom-right" aria-hidden="true" />

              <div className="lyrics-screen">
                <header className="lyrics-header">
                  <div>
                    <p className="screen-kicker">
                      {language === "en" ? "Wall lyric reader" : "墙面歌词阅读板"}
                    </p>
                    <h2 id="lyrics-title">
                      {language === "en" ? "Lyrics" : "歌词"}
                    </h2>
                  </div>

                  {hasTranslatableLyrics && (
                    <button
                      type="button"
                      onClick={() => {
                        playUISound("switch");
                        setShowLyricTranslation((previous) => !previous);
                      }}
                      className="translation-button"
                    >
                      {showLyricTranslation
                        ? language === "en"
                          ? "Original only"
                          : "只看原词"
                        : language === "en"
                          ? "Show translation"
                          : "显示翻译"}
                    </button>
                  )}
                </header>

                <div className="lyrics-content">
                  {song.lyrics.lines.map((line, index) => {
                    const translatedLine =
                      line.language === language
                        ? undefined
                        : line.translation?.[language];

                    return (
                      <div
                        key={`${line.original}-${index}`}
                        className={`lyric-line ${line.startsStanza ? "starts-stanza" : ""}`}
                      >
                        <p className="original-line">{line.original}</p>
                        {showLyricTranslation && translatedLine && (
                          <p className="translated-line">
                            {language === "zh"
                              ? `（${translatedLine}）`
                              : `(${translatedLine})`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <footer className="reader-footer" aria-hidden="true">
                  <span>{song.lyrics.lines.length.toString().padStart(2, "0")}</span>
                  <span className="reader-rule" />
                  <span>LYR</span>
                </footer>
              </div>
            </div>
          </section>
        </div>

        {Boolean(song.memories?.length) && <section className="memory-gallery" aria-labelledby="memory-title">
          <header className="memory-heading">
            <p>{language === "en" ? "Song archive" : "歌曲档案"}</p>
            <h2 id="memory-title">
              {language === "en" ? "Memories in projection" : "投影中的记忆"}
            </h2>
            <span>
              {language === "en"
                ? "Fragments gathered while this song was taking shape."
                : "这首歌慢慢成形时留下的片段。"}
            </span>
          </header>
          <MemoryProjector memories={song.memories} language={language} />
        </section>}
      </section>

      <LanguageSwitcher
        language={language}
        setLanguage={setLanguage}
        theme={{
          color: "#214a58",
          border: "1px solid rgba(23, 107, 145, 0.46)",
          background: "rgba(255, 250, 238, 0.92)",
        }}
      />

      <ContactInfo language={language} theme="music" />

      <style jsx>{`
        .song-player-page {
          --med-wall: #f2ecdf;
          --med-white: #fffaf0;
          --med-blue: #176b91;
          --med-sky: #6cb8d0;
          --med-yellow: #e0b54e;
          --med-terracotta: #b96e4d;
          --med-olive: #315846;
          --med-wood: #b88453;
          --med-ink: #213f47;
          min-height: 100vh;
          box-sizing: border-box;
          overflow-x: hidden;
          padding: 86px clamp(28px, 5vw, 76px) 112px;
          background:
            linear-gradient(112deg, rgba(255, 253, 244, 0.88) 0 18%, transparent 18.2%),
            radial-gradient(circle at 85% 9%, rgba(224, 181, 78, 0.2), transparent 23%),
            repeating-linear-gradient(8deg, rgba(67, 71, 63, 0.025) 0 1px, transparent 1px 38px),
            var(--med-wall);
          color: var(--med-ink);
          font-family: var(--font-body);
        }

        .song-stage {
          width: min(100%, 1240px);
          margin: 0 auto;
        }

        .listening-room {
          position: relative;
          display: grid;
          grid-template-columns: minmax(330px, 0.88fr) minmax(460px, 1.12fr);
          grid-template-rows: 806px;
          gap: clamp(34px, 5vw, 72px);
          padding: clamp(28px, 4vw, 52px);
          border: 1px solid rgba(31, 93, 116, 0.26);
          border-left: 6px solid var(--med-blue);
          border-radius: 72px 72px 5px 5px;
          background:
            linear-gradient(114deg, rgba(255, 255, 255, 0.76) 0 20%, transparent 20.2%),
            linear-gradient(180deg, rgba(255, 251, 239, 0.88), rgba(232, 219, 197, 0.68)),
            var(--med-white);
          box-shadow: 0 30px 72px rgba(51, 74, 77, 0.15);
        }

        .listening-room::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: calc(42.5% + 4px);
          width: 1px;
          background: linear-gradient(transparent, rgba(23, 107, 145, 0.38) 12%, rgba(23, 107, 145, 0.38) 88%, transparent);
          pointer-events: none;
        }

        .song-object,
        .lyrics-section {
          min-width: 0;
        }

        .song-object {
          display: flex;
          flex-direction: column;
        }

        .lyrics-section {
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        .object-index {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          color: #617578;
          font: 600 11px/1.2 var(--font-label);
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .cover-exhibit {
          margin: 0;
        }

        .cover-mount {
          position: relative;
          width: min(100%, 400px);
          margin: 0 auto;
          padding: clamp(12px, 2vw, 20px);
          border: 1px solid rgba(42, 95, 107, 0.32);
          border-bottom: 10px solid var(--med-wood);
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.68) 0 24%, transparent 24.2%),
            #eee3d1;
          box-shadow:
            13px 16px 0 rgba(71, 87, 84, 0.1),
            inset 0 0 0 5px rgba(255, 251, 239, 0.58);
        }

        .cover-mount::before,
        .cover-mount::after {
          content: "";
          position: absolute;
          top: 17%;
          bottom: 17%;
          width: 3px;
          background: var(--med-blue);
        }

        .cover-mount::before { left: -4px; }
        .cover-mount::after { right: -4px; }

        .album-cover-large {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #c9b99e;
          box-shadow:
            0 16px 28px rgba(42, 36, 33, 0.21),
            0 0 0 1px rgba(46, 39, 36, 0.5);
        }

        .album-cover-large::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, rgba(255, 255, 255, 0.12), transparent 34%, rgba(28, 25, 23, 0.08));
          pointer-events: none;
        }

        .album-cover-large :global(img) {
          object-fit: cover;
        }

        .song-info {
          display: flex;
          width: min(100%, 420px);
          flex: 1;
          flex-direction: column;
          margin: 34px auto 0;
        }

        .archive-label,
        .screen-kicker,
        .memory-heading p {
          margin: 0;
          color: var(--med-blue);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .song-info h1 {
          margin: 10px 0 15px;
          color: var(--med-ink);
          font-family: var(--font-display);
          font-weight: 600;
          letter-spacing: 0;
        }

        .title-primary,
        .title-translation {
          display: block;
          overflow-wrap: break-word;
        }

        .title-primary {
          max-width: 13ch;
          font-size: 39px;
          line-height: 1.1;
        }

        .title-translation {
          max-width: 18ch;
          margin-top: 7px;
          color: #49656a;
          font-family: var(--font-body);
          font-size: 24px;
          font-weight: 650;
          line-height: 1.24;
        }

        .song-description {
          max-width: 38em;
          margin: 0;
          color: #5b5d53;
          font-size: 15px;
          line-height: 1.72;
        }

        .audio-console {
          margin-top: auto;
          padding-top: 13px;
          padding: 13px 15px 15px;
          border: 1px solid rgba(25, 92, 120, 0.46);
          border-left: 5px solid var(--med-olive);
          background:
            radial-gradient(circle at 2px 2px, rgba(37, 78, 81, 0.1) 1px, transparent 1.2px) right 12px top 10px / 6px 6px no-repeat,
            #e5d7bd;
          box-shadow: 5px 7px 0 rgba(93, 77, 58, 0.12);
        }

        .console-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: #425b5f;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .console-heading > span:first-child {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--med-terracotta);
        }

        .audio-console audio { display: none; }

        .audio-controls {
          display: grid;
          min-height: 44px;
          grid-template-columns: 38px auto minmax(82px, 1fr) 42px 64px;
          align-items: center;
          gap: 9px;
          padding: 5px 8px;
          border: 1px solid rgba(23, 107, 145, 0.17);
          border-radius: 999px;
          background: #fbf6e9;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .audio-play-button,
        .audio-volume-button {
          display: grid;
          padding: 0;
          border: 0;
          background: transparent;
          color: #174f65;
          cursor: pointer;
          place-items: center;
        }

        .audio-play-button {
          width: 34px;
          height: 34px;
          border: 1px solid rgba(23, 107, 145, 0.36);
          border-radius: 50%;
          background: #e2eff0;
          font-size: 13px;
        }

        .audio-volume-button {
          min-width: 42px;
          height: 32px;
          color: var(--med-olive);
          font: 700 12px/1 var(--font-geist-mono);
        }

        .audio-time {
          color: #36565c;
          font: 600 12px/1 var(--font-geist-mono);
          white-space: nowrap;
        }

        .audio-progress,
        .audio-volume-range {
          height: 6px;
          margin: 0;
          border-radius: 999px;
          cursor: pointer;
          appearance: none;
        }

        .audio-progress::-webkit-slider-thumb,
        .audio-volume-range::-webkit-slider-thumb {
          width: 15px;
          height: 15px;
          border: 2px solid #fff8e8;
          border-radius: 50%;
          background: var(--med-yellow);
          box-shadow: 0 0 0 1px rgba(84, 66, 38, 0.32);
          appearance: none;
        }

        .audio-progress::-moz-range-thumb,
        .audio-volume-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border: 2px solid #fff8e8;
          border-radius: 50%;
          background: var(--med-yellow);
        }

        .reader-housing {
          position: relative;
          min-height: 690px;
          height: auto;
          flex: 1;
          box-sizing: border-box;
          padding: 17px;
          border: 1px solid #0f5777;
          border-radius: 58px 58px 6px 6px;
          background:
            linear-gradient(118deg, rgba(119, 194, 211, 0.26) 0 20%, transparent 20.3%),
            linear-gradient(145deg, #247da0, #125e82 74%);
          box-shadow:
            13px 19px 36px rgba(33, 68, 76, 0.22),
            inset 0 1px 0 rgba(222, 244, 244, 0.25),
            inset 0 -5px 0 rgba(4, 52, 74, 0.18);
        }

        .housing-detail {
          position: absolute;
          z-index: 2;
          width: 5px;
          height: 5px;
          border: 1px solid #7d5b2d;
          border-radius: 50%;
          background: var(--med-yellow);
        }

        .housing-detail.top-left { top: 7px; left: 7px; }
        .housing-detail.top-right { top: 7px; right: 7px; }
        .housing-detail.bottom-left { bottom: 7px; left: 7px; }
        .housing-detail.bottom-right { right: 7px; bottom: 7px; }

        .lyrics-screen {
          position: relative;
          display: flex;
          height: 100%;
          box-sizing: border-box;
          flex-direction: column;
          overflow: hidden;
          padding: 28px 29px 18px;
          border: 1px solid rgba(56, 78, 74, 0.5);
          border-radius: 43px 43px 3px 3px;
          color: var(--med-ink);
          background:
            repeating-linear-gradient(0deg, rgba(67, 72, 64, 0.022) 0 1px, transparent 1px 5px),
            linear-gradient(118deg, rgba(255, 255, 255, 0.7) 0 18%, transparent 18.2%),
            #f2ead9;
          box-shadow:
            inset 0 0 18px rgba(89, 82, 66, 0.09),
            inset 3px 0 0 rgba(255, 255, 255, 0.28);
        }

        .lyrics-header {
          display: flex;
          flex: 0 0 auto;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(26, 92, 114, 0.3);
        }

        .screen-kicker { color: var(--med-blue); }

        .lyrics-header h2 {
          margin: 8px 0 0;
          color: var(--med-ink);
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 600;
          line-height: 1.1;
        }

        .translation-button {
          flex: 0 0 auto;
          min-height: 34px;
          padding: 7px 11px;
          border: 1px solid rgba(128, 91, 38, 0.52);
          border-radius: 3px;
          background: rgba(232, 191, 92, 0.38);
          color: #4f4b3f;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
          box-shadow: 2px 3px 0 rgba(111, 83, 42, 0.12);
        }

        .translation-button:hover {
          background: rgba(241, 205, 116, 0.52);
        }

        .lyrics-content {
          min-height: 0;
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 2px 17px 12px 2px;
          scrollbar-color: #47778a #d7cbb5;
          scrollbar-width: thin;
        }

        .lyrics-content::-webkit-scrollbar { width: 7px; }
        .lyrics-content::-webkit-scrollbar-track { background: #d7cbb5; }
        .lyrics-content::-webkit-scrollbar-thumb {
          border: 1px solid #d7cbb5;
          background: #47778a;
        }

        .lyric-line {
          position: relative;
          margin: 0 0 4px;
        }

        .lyric-line.starts-stanza {
          margin-top: 30px;
        }

        .original-line {
          margin: 0;
          color: #29464b;
          font-family: var(--font-display);
          font-size: 18px;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .translated-line {
          margin: 3px 0 0;
          color: #667069;
          font-size: 14px;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .song-player-page.language-en .original-line {
          font-size: 14px;
        }

        .song-player-page.language-en .translated-line {
          font-size: 18px;
        }

        .reader-footer {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 10px;
          padding-top: 13px;
          color: #5e7476;
          font: 700 10px/1 var(--font-geist-mono);
        }

        .reader-rule { height: 1px; background: rgba(28, 94, 116, 0.3); }

        .memory-gallery {
          position: relative;
          padding: 28px clamp(24px, 4vw, 50px) 24px;
          border-bottom: 1px solid rgba(98, 57, 39, 0.34);
          background:
            linear-gradient(112deg, rgba(255, 250, 233, 0.42) 0 19%, transparent 19.2%),
            radial-gradient(circle at 86% 14%, rgba(39, 112, 137, 0.14), transparent 28%),
            repeating-linear-gradient(90deg, rgba(255, 250, 235, 0.1) 0 1px, transparent 1px 52px),
            #d2b897;
        }

        .memory-gallery::before {
          content: "";
          position: absolute;
          top: 0;
          right: clamp(24px, 4vw, 50px);
          left: clamp(24px, 4vw, 50px);
          height: 1px;
          background: linear-gradient(90deg, var(--med-blue) 0 16%, rgba(255, 245, 224, 0.34) 16% 100%);
        }

        .memory-heading {
          display: grid;
          grid-template-columns: minmax(180px, 0.55fr) minmax(280px, 1fr);
          column-gap: 24px;
          align-items: end;
          margin-bottom: 10px;
        }

        .memory-heading h2 {
          grid-column: 1;
          margin: 5px 0 0;
          color: #243f45;
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 600;
          line-height: 1.15;
        }

        .memory-heading > span {
          grid-column: 2;
          grid-row: 1 / span 2;
          max-width: 38em;
          color: #5c4b42;
          font-size: 14px;
          line-height: 1.5;
        }

        .back-link {
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--med-ink);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 650;
          transition: transform var(--duration-fast) var(--ease-object);
        }

        .back-link:hover { transform: translateX(-2px); }

        .back-icon {
          display: inline-grid;
          width: 29px;
          height: 29px;
          place-items: center;
          border: 1px solid rgba(24, 91, 119, 0.42);
          border-radius: 50%;
          background: rgba(255, 251, 240, 0.88);
        }

        .back-arrow {
          display: block;
          transform: translate(-1px, -1px);
          font-size: 25px;
          font-weight: 500;
          line-height: 1;
        }

        @media (max-width: 980px) {
          .song-player-page { padding: 76px 24px 100px; }

          .listening-room {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            padding: 36px;
            border-radius: 54px 54px 5px 5px;
          }

          .listening-room::before { display: none; }

          .song-object {
            display: grid;
            grid-template-columns: minmax(260px, 0.8fr) minmax(300px, 1.2fr);
            gap: 34px;
            align-items: center;
          }

          .object-index { grid-column: 1 / -1; margin-bottom: -10px; }
          .song-info { display: block; margin: 0; }
          .audio-console { margin-top: 25px; }
          .lyrics-section { display: block; }
          .reader-housing { min-height: 600px; height: 600px; }
        }

        @media (max-width: 640px) {
          .song-player-page { padding: 72px 14px 94px; }

          .listening-room {
            gap: 32px;
            padding: 25px 16px 28px;
            border-left-width: 4px;
            border-radius: 34px 34px 4px 4px;
          }

          .song-object { display: block; }
          .object-index { margin-bottom: 16px; }
          .cover-mount { width: min(82vw, 330px); box-sizing: border-box; }
          .song-info { margin-top: 31px; }
          .title-primary { max-width: 15ch; font-size: 33px; }
          .title-translation { max-width: 20ch; font-size: 21px; }
          .audio-controls { grid-template-columns: 38px auto minmax(70px, 1fr) 38px; }
          .audio-volume-range { display: none; }

          .reader-housing { min-height: 560px; height: 560px; padding: 12px; border-radius: 34px 34px 5px 5px; }
          .lyrics-screen { padding: 22px 18px 15px; border-radius: 24px 24px 3px 3px; }
          .lyrics-header { flex-direction: column; align-items: stretch; }
          .translation-button { width: fit-content; }
          .original-line { font-size: 17px; }
          .song-player-page.language-en .original-line { font-size: 14px; }
          .song-player-page.language-en .translated-line { font-size: 17px; }

          .memory-gallery { padding: 22px 12px 16px; }
          .memory-gallery::before { right: 16px; left: 16px; }
          .memory-heading { display: block; }
          .memory-heading h2 { font-size: 26px; }
          .memory-heading > span { display: block; margin-top: 6px; line-height: 1.45; }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 640px) {
          .song-player-page .contact-trigger {
            width: 46px;
            min-width: 46px;
            height: 46px;
            padding: 0;
            justify-content: center;
          }

          .song-player-page .contact-trigger .contact-trigger-label {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
