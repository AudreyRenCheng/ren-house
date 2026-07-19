"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

import { useSound } from "@/components/SoundProvider";
import { songs } from "@/data/songs";
import type { SongId, SiteLanguage } from "@/types";

export default function MusicShelf({
  onSelectSong,
  language,
  restoreFocusSongId,
}: {
  onSelectSong: (songId: SongId) => void;
  language: SiteLanguage;
  restoreFocusSongId: SongId | null;
}) {
  const { playUISound } = useSound();
  const songButtonRefs = useRef<Partial<Record<SongId, HTMLButtonElement | null>>>(
    {}
  );

  useEffect(() => {
    if (!restoreFocusSongId) return;

    const frame = window.requestAnimationFrame(() => {
      songButtonRefs.current[restoreFocusSongId]?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [restoreFocusSongId]);

  function getSongTitle(songId: SongId) {
    const song = songs[songId];
    const title = song.title;

    if (title.originalLanguage === language) return title.original;

    const translatedTitle = title.translation[language];
    if (!translatedTitle) return title.original;

    return language === "zh"
      ? `${title.original}（${translatedTitle}）`
      : `${title.original} (${translatedTitle})`;
  }

  function getBoatLabelTitles(songId: SongId) {
    const { title } = songs[songId];
    const translatedTitle =
      title.originalLanguage === language
        ? undefined
        : title.translation[language];

    return {
      primary: language === "zh" ? `《${title.original}》` : title.original,
      secondary: translatedTitle
        ? language === "zh"
          ? `（${translatedTitle}）`
          : `(${translatedTitle})`
        : undefined,
    };
  }

  function getBoatTextWidth(text: string) {
    return Array.from(text).reduce((width, character) => {
      if (character === " ") return width + 0.5;
      return width + (character.charCodeAt(0) > 255 ? 1.8 : 1);
    }, 0);
  }

  const songIds = Object.keys(songs) as SongId[];
  const primarySongIds = songIds.slice(0, 3);
  const secondarySongIds = songIds.slice(3, 6);

  function renderSongExhibit(songId: SongId) {
    const song = songs[songId];
    const songTitle = getSongTitle(songId);
    const boatTitles = getBoatLabelTitles(songId);
    const boatTitleLength =
      boatTitles.primary.length + (boatTitles.secondary?.length ?? 0);
    const widestBoatLine = Math.max(
      getBoatTextWidth(boatTitles.primary),
      getBoatTextWidth(boatTitles.secondary ?? "")
    );
    const boatWidth = Math.round(
      Math.min(280, Math.max(160, 60 + widestBoatLine * 5.4))
    );
    const boatLabelStyle = {
      "--boat-width": `${boatWidth}px`,
    } as CSSProperties;
    const boatSize =
      boatTitleLength > 20
        ? "is-long"
        : boatTitleLength > 14
          ? "is-medium"
          : "is-short";
    const index = songIds.indexOf(songId);

    return (
      <button
        key={songId}
        ref={(node) => {
          songButtonRefs.current[songId] = node;
        }}
        className={`song-exhibit variant-${(index % 3) + 1}`}
        type="button"
        aria-label={`${songTitle}. ${song.completedDate}`}
        onClick={() => {
          playUISound("open");
          onSelectSong(songId);
        }}
      >
        <span className="album-cover">
          <span className="cover-fallback" aria-hidden="true">
            <span>ARCHIVE</span>
          </span>
          <Image
            src={song.cover}
            alt=""
            fill
            sizes="(max-width: 760px) 190px, (max-width: 980px) 156px, 210px"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </span>

        <span
          className={`paper-boat-label ${boatSize} ${
            boatTitles.secondary ? "has-translation" : ""
          }`}
          style={boatLabelStyle}
          aria-hidden="true"
        >
          <span className="boat-sail">
            <span>{song.completedDate}</span>
          </span>
          <span className="boat-hull">
            <strong>{boatTitles.primary}</strong>
            {boatTitles.secondary && (
              <span className="boat-translation">{boatTitles.secondary}</span>
            )}
          </span>
        </span>
      </button>
    );
  }

  return (
    <section id="music-shelf" className="music-shelf-section" aria-labelledby="shelf-title">
      <div className="shelf-room">
        <header className="archive-sign">
          <span className="sign-pin left" aria-hidden="true" />
          <span className="sign-pin right" aria-hidden="true" />
          <p>{language === "en" ? "My Little Creations" : "我的孩子们"}</p>
          <h2 id="shelf-title">
            {language === "en" ? "Record Shelf" : "唱片架"}
          </h2>
        </header>

        <div className="shelf-furniture">
          <div className="wall-bracket left" aria-hidden="true" />
          <div className="wall-bracket right" aria-hidden="true" />

          <div className="record-tier primary-tier">
            <div className="record-line">
              {primarySongIds.map(renderSongExhibit)}
            </div>
            <div className="shelf-board" aria-hidden="true" />
          </div>

          <div
            className={`record-tier secondary-tier ${
              secondarySongIds.length === 0 ? "is-reserved" : ""
            }`}
          >
            <div className="record-line secondary-record-line">
              {secondarySongIds.map(renderSongExhibit)}
              {Array.from({ length: 3 - secondarySongIds.length }).map(
                (_, index) => (
                  <span
                    className={`future-work-slot future-work-${index + 1}`}
                    key={`future-record-${index}`}
                    aria-hidden="true"
                  >
                    <i className="future-cover-outline" />
                    <i className="future-label-outline">
                      <b />
                    </i>
                  </span>
                )
              )}
            </div>
            <div className="shelf-board" aria-hidden="true" />
          </div>

          <div className="lived-in-shelf" aria-hidden="true">
            <span className="lyric-notebook">
              <i />
              <i />
              <i />
            </span>
            <span className="small-plant">
              <i />
              <i />
              <i />
            </span>
            <span className="blue-white-vessel" />
            <span className="ochre-sculpture">
              <i />
            </span>
            <span className="clay-bowl" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .music-shelf-section {
          position: relative;
          min-height: 100vh;
          box-sizing: border-box;
          padding: 54px 48px 120px;
          color: var(--music-ink);
          background:
            linear-gradient(180deg, transparent 0 78%, rgba(176, 101, 69, 0.14) 78.2% 100%),
            transparent;
        }

        .music-shelf-section::before {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(112deg, rgba(255, 254, 246, 0.64) 0 21%, transparent 21.2%),
            radial-gradient(circle at 86% 8%, rgba(227, 182, 79, 0.16), transparent 25%),
            repeating-linear-gradient(7deg, rgba(72, 73, 65, 0.025) 0 1px, transparent 1px 34px);
          content: "";
          pointer-events: none;
        }

        .shelf-room {
          position: relative;
          z-index: var(--z-object);
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .archive-sign {
          position: relative;
          width: fit-content;
          max-width: calc(100% - 36px);
          margin: 0 0 34px 6%;
          padding: 12px 42px 13px;
          border: 1px solid rgba(17, 83, 112, 0.62);
          border-radius: 4px;
          background:
            linear-gradient(110deg, rgba(255, 255, 255, 0.18), transparent 40%),
            var(--music-cobalt);
          color: #fff8e8;
          box-shadow:
            0 9px 18px rgba(33, 69, 77, 0.2),
            inset 0 1px 0 rgba(213, 239, 242, 0.28);
          transform: rotate(-0.45deg);
        }

        .archive-sign p {
          margin: 0 0 3px;
          color: #f0cf78;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .archive-sign h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(23px, 2.3vw, 32px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .sign-pin {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          border: 1px solid #7c582d;
          border-radius: var(--radius-round);
          background: var(--music-sun);
          transform: translateY(-50%);
        }

        .sign-pin.left { left: 14px; }
        .sign-pin.right { right: 14px; }

        .shelf-furniture {
          position: relative;
          min-height: 770px;
          padding: 86px 54px 0;
          border: 24px solid #f5efe3;
          border-bottom: 0;
          border-radius: 160px 160px 5px 5px;
          background:
            linear-gradient(118deg, rgba(127, 198, 214, 0.24) 0 25%, transparent 25.4%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 46px),
            linear-gradient(145deg, #247da0, #17698e 58%, #0f587a);
          box-shadow:
            0 34px 62px rgba(43, 69, 73, 0.2),
            inset 14px 0 22px rgba(7, 54, 76, 0.15),
            inset -14px 0 22px rgba(7, 43, 61, 0.2);
        }

        .shelf-furniture::before {
          position: absolute;
          left: 9%;
          right: 9%;
          top: 26px;
          height: 34px;
          border-top: 1px solid rgba(224, 242, 240, 0.42);
          border-radius: 50%;
          background: transparent;
          box-shadow: none;
          content: "";
        }

        .wall-bracket {
          position: absolute;
          top: 25px;
          width: 22px;
          height: 45px;
          border: 2px solid #85622f;
          background: linear-gradient(90deg, #a77b35, #e0bf65, #93672f);
          box-shadow: 2px 5px 9px rgba(16, 52, 65, 0.2);
        }

        .wall-bracket.left { left: 7%; }
        .wall-bracket.right { right: 7%; }

        .record-line {
          position: relative;
          z-index: calc(var(--z-object) + 4);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: end;
          gap: clamp(20px, 3vw, 42px);
          min-height: 270px;
          padding: 0 10px 36px;
        }

        .record-tier {
          position: relative;
        }

        .secondary-record-line {
          min-height: 224px;
        }

        .secondary-tier {
          margin-top: 42px;
        }

        .future-work-slot {
          position: relative;
          z-index: calc(var(--z-object) + 4);
          display: block;
          width: 100%;
          height: 206px;
          align-self: end;
          justify-self: center;
          opacity: 0.3;
        }

        .future-cover-outline {
          position: absolute;
          left: 50%;
          bottom: 36px;
          width: min(74%, 170px);
          aspect-ratio: 1;
          border: 2px dashed rgba(190, 218, 220, 0.62);
          border-radius: var(--radius-detail);
          background: rgba(242, 238, 220, 0.025);
          box-shadow: inset 0 0 0 7px rgba(233, 243, 239, 0.025);
          transform: translateX(-50%);
        }

        .future-label-outline {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 138px;
          height: 66px;
          border: 2px dashed rgba(190, 218, 220, 0.68);
          clip-path: polygon(3% 46%, 37% 46%, 50% 0, 63% 46%, 97% 46%, 84% 100%, 16% 100%);
          transform: translateX(-50%);
        }

        .future-label-outline b {
          position: absolute;
          left: 23%;
          right: 23%;
          bottom: 12px;
          height: 0;
          border-top: 2px dashed rgba(190, 218, 220, 0.56);
        }

        .song-exhibit {
          position: relative;
          z-index: calc(var(--z-object) + 4);
          display: flex;
          min-width: 0;
          min-height: 236px;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          text-align: left;
        }

        .album-cover {
          position: relative;
          display: block;
          width: min(74%, 205px);
          aspect-ratio: 1;
          flex: 0 0 auto;
          overflow: hidden;
          border: 1px solid rgba(255, 250, 235, 0.5);
          border-radius: var(--radius-detail);
          background: #d9c9ad;
          box-shadow:
            9px 14px 24px rgba(5, 43, 60, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.48);
          transition:
            transform var(--duration-object) var(--ease-object),
            box-shadow var(--duration-object) var(--ease-object);
          transform-origin: center bottom;
        }

        .album-cover::after {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: linear-gradient(90deg, transparent, rgba(31, 22, 16, 0.2));
          content: "";
          pointer-events: none;
        }

        .album-cover img,
        .cover-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .album-cover img {
          display: block;
          object-fit: cover;
        }

        .cover-fallback {
          display: grid;
          place-items: center;
          background:
            linear-gradient(135deg, transparent 49%, rgba(78, 55, 36, 0.12) 50%, transparent 51%),
            #d8cab1;
          color: rgba(38, 65, 68, 0.62);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .paper-boat-label {
          --boat-hull-height: 36px;
          --boat-width: 150px;
          position: absolute;
          left: 50%;
          bottom: -36px;
          z-index: calc(var(--z-object) + 5);
          display: block;
          width: min(92%, var(--boat-width));
          height: calc(var(--boat-hull-height) + 36px);
          color: #25464e;
          filter: drop-shadow(3px 6px 5px rgba(8, 48, 63, 0.17));
          transform: translateX(-50%);
        }

        .paper-boat-label.is-short { --boat-width: 138px; }
        .paper-boat-label.is-medium { --boat-width: 140px; }
        .paper-boat-label.is-long { --boat-width: 178px; }

        .boat-sail {
          position: absolute;
          left: 50%;
          bottom: calc(var(--boat-hull-height) - 5px);
          z-index: 1;
          display: grid;
          width: 66px;
          height: 36px;
          place-items: end center;
          padding-bottom: 8px;
          box-sizing: border-box;
          background: #89bdca;
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
          transform: translateX(-50%);
        }

        .boat-sail::before {
          position: absolute;
          inset: 1px 2px 0;
          background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.5), transparent 58%),
            #f7f2e6;
          clip-path: inherit;
          content: "";
        }

        .boat-sail span {
          position: relative;
          z-index: 1;
          color: #6c8588;
          font-size: 7.5px;
          font-weight: 650;
          line-height: 1;
          white-space: nowrap;
        }

        .boat-hull {
          position: absolute;
          inset: auto 0 0;
          z-index: 2;
          display: flex;
          height: var(--boat-hull-height);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 4px 13px 5px;
          box-sizing: border-box;
          background: #89bdca;
          clip-path: polygon(0 0, 97% 0, 82% 100%, 18% 100%);
        }

        .boat-hull::before {
          position: absolute;
          inset: 2px 3px;
          z-index: 0;
          background:
            linear-gradient(112deg, rgba(255, 255, 255, 0.62), transparent 42%),
            #f7f2e6;
          clip-path: inherit;
          content: "";
        }

        .boat-hull strong {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          overflow: visible;
          color: #173f49;
          font-family: var(--font-body);
          font-size: clamp(11.5px, 0.9vw, 13px);
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1.1;
          text-align: center;
          text-overflow: clip;
          white-space: nowrap;
        }

        .boat-translation {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          overflow: visible;
          color: #496c70;
          font-size: clamp(8.5px, 0.68vw, 10px);
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0;
          line-height: 1.1;
          text-align: center;
          text-overflow: clip;
          white-space: nowrap;
        }

        .paper-boat-label.has-translation .boat-hull {
          gap: 0;
          padding-top: 3px;
          padding-bottom: 4px;
        }

        .paper-boat-label.has-translation .boat-hull strong {
          font-size: clamp(10.5px, 0.78vw, 11.5px);
          line-height: 1;
        }

        .paper-boat-label.has-translation .boat-translation {
          font-size: clamp(7.5px, 0.58vw, 8.5px);
          line-height: 1;
        }

        .paper-boat-label.is-long .boat-hull strong {
          font-size: clamp(10.5px, 0.82vw, 12px);
        }

        .paper-boat-label.is-long .boat-translation {
          font-size: clamp(8px, 0.64vw, 9.5px);
        }

        .variant-1 .album-cover,
        .variant-2 .album-cover,
        .variant-3 .album-cover { transform: translateY(0); }

        .song-exhibit:hover .album-cover {
          transform: translateY(-4px) rotate(0deg);
          box-shadow:
            10px 18px 28px rgba(5, 43, 60, 0.36),
            inset 0 1px 0 rgba(255, 255, 255, 0.52);
        }

        .song-exhibit:active .album-cover {
          transform: translateY(1px) rotate(0deg);
          box-shadow: 5px 9px 15px rgba(72, 42, 23, 0.2);
        }

        .song-exhibit:focus-visible {
          outline: none !important;
        }

        .song-exhibit:focus-visible .album-cover {
          box-shadow:
            0 0 0 4px rgba(242, 198, 83, 0.92),
            0 0 0 7px rgba(233, 246, 241, 0.88),
            10px 18px 28px rgba(5, 43, 60, 0.34);
        }

        .shelf-board {
          position: relative;
          z-index: calc(var(--z-object) + 3);
          height: 36px;
          margin: -36px -14px 0;
          border: 1px solid rgba(87, 54, 31, 0.36);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.26), transparent 30%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 2px, transparent 2px 44px),
            linear-gradient(180deg, #c59868, var(--music-shelf-wood));
          box-shadow:
            0 18px 24px rgba(8, 42, 55, 0.28),
            inset 0 -8px 0 rgba(82, 45, 22, 0.14);
        }

        .lived-in-shelf {
          position: relative;
          height: 142px;
          margin: 0 8%;
          isolation: isolate;
          border-left: 2px solid rgba(95, 55, 35, 0.28);
          border-right: 2px solid rgba(95, 55, 35, 0.28);
          background:
            repeating-linear-gradient(90deg, rgba(255, 235, 210, 0.06) 0 1px, transparent 1px 48px),
            rgba(157, 83, 57, 0.46);
          box-shadow: inset 0 16px 24px rgba(87, 49, 33, 0.16);
        }

        .lyric-notebook {
          position: absolute;
          left: 8%;
          bottom: 18px;
          width: 112px;
          height: 76px;
          border: 1px solid rgba(81, 56, 37, 0.28);
          background: #eee3cb;
          box-shadow: 5px 8px 12px rgba(77, 45, 24, 0.15);
          transform: rotate(-2deg);
        }

        .lyric-notebook i {
          display: block;
          width: 62%;
          height: 1px;
          margin: 17px 0 -9px 20%;
          background: rgba(91, 66, 45, 0.2);
        }

        .small-plant {
          position: absolute;
          right: 13%;
          bottom: 18px;
          width: 54px;
          height: 39px;
          z-index: 3;
          border-radius: 2px 2px 10px 10px;
          background: transparent;
        }

        .small-plant::after {
          position: absolute;
          inset: 0;
          z-index: 2;
          border-radius: 2px 2px 10px 10px;
          background: var(--music-terracotta);
          box-shadow: 4px 7px 10px rgba(70, 43, 25, 0.17);
          content: "";
        }

        .small-plant i {
          position: absolute;
          left: 50%;
          bottom: 30px;
          width: 28px;
          height: 48px;
          z-index: 1;
          border-left: 2px solid var(--music-vine);
          border-radius: 60% 0 0;
          transform-origin: bottom;
        }

        .small-plant i:nth-child(1) { transform: rotate(-27deg); }
        .small-plant i:nth-child(2) { transform: translateX(-1px) rotate(5deg); }
        .small-plant i:nth-child(3) { transform: rotate(31deg); }

        .small-plant i::after {
          position: absolute;
          left: -3px;
          top: 5px;
          width: 20px;
          height: 12px;
          border-radius: 90% 0 90% 0;
          background: var(--music-leaf);
          content: "";
        }

        .blue-white-vessel {
          position: absolute;
          left: 33%;
          bottom: 18px;
          width: 42px;
          height: 56px;
          border: 2px solid rgba(21, 86, 111, 0.76);
          border-radius: 45% 45% 34% 34% / 23% 23% 54% 54%;
          background:
            linear-gradient(180deg, transparent 0 38%, #237b9d 39% 47%, transparent 48% 68%, #237b9d 69% 77%, transparent 78%),
            #eee8d7;
          box-shadow: 4px 7px 10px rgba(12, 48, 57, 0.18);
        }

        .ochre-sculpture {
          position: absolute;
          left: 52%;
          bottom: 19px;
          width: 48px;
          height: 43px;
          border-radius: 46% 54% 36% 40%;
          background: #d6a43f;
          box-shadow: 4px 7px 10px rgba(72, 51, 25, 0.16);
          transform: rotate(-5deg);
        }

        .ochre-sculpture i {
          position: absolute;
          left: 13px;
          top: 8px;
          width: 20px;
          height: 20px;
          border: 2px solid #f1dc9b;
          border-radius: 50%;
        }

        .clay-bowl {
          position: absolute;
          right: 29%;
          bottom: 19px;
          width: 68px;
          height: 24px;
          border: 2px solid #8e563d;
          border-radius: 5px 5px 44px 44px;
          background: #b96e4d;
          box-shadow: 4px 7px 9px rgba(64, 40, 28, 0.15);
        }

        @media (max-width: 980px) {
          .music-shelf-section { padding-inline: 28px; }

          .shelf-furniture {
            padding-inline: 30px;
            border-width: 18px;
            border-bottom-width: 0;
          }

          .record-line {
            gap: 12px;
            padding-inline: 0;
          }

          .song-exhibit { min-height: 205px; }
          .album-cover { width: min(72%, 170px); }
          .paper-boat-label.is-short { --boat-width: 128px; }
          .paper-boat-label.is-medium { --boat-width: 152px; }
          .paper-boat-label.is-long { --boat-width: 178px; }
          .boat-hull strong { font-size: 9px; }
          .boat-translation { font-size: 6.5px; }
          .future-work-slot { height: 158px; }
          .future-cover-outline { width: min(72%, 170px); }
          .future-label-outline { width: 138px; }
        }

        @media (max-width: 980px) {
          .music-shelf-section {
            padding: 42px 18px 104px;
          }

          .archive-sign {
            margin: 0 auto 30px;
            padding-inline: 34px;
          }

          .shelf-furniture {
            min-height: 0;
            padding: 56px 18px 0;
            border-width: 14px;
            border-bottom-width: 0;
            border-radius: 96px 96px 4px 4px;
          }

          .record-line {
            display: flex;
            min-height: 0;
            flex-direction: column;
            gap: 34px;
            padding: 0 2px 24px;
          }

          .song-exhibit {
            --mobile-group-left: 34px;
            width: 100%;
            min-height: 184px;
            flex-shrink: 0;
            flex-direction: row;
            align-items: flex-end;
            justify-content: flex-start;
            padding: 0 4px 24px var(--mobile-group-left);
          }

          .song-exhibit::after {
            position: absolute;
            left: -10px;
            right: -10px;
            bottom: 0;
            z-index: 0;
            height: 24px;
            border: 1px solid rgba(87, 54, 31, 0.34);
            background: linear-gradient(180deg, #c99b6b, var(--music-shelf-wood));
            box-shadow: 0 12px 17px rgba(7, 42, 57, 0.28);
            content: "";
          }

          .album-cover {
            width: min(38vw, 160px);
            flex-basis: min(38vw, 160px);
            z-index: 1;
          }

          .paper-boat-label {
            --boat-hull-height: 34px;
            position: absolute;
            left: calc(var(--mobile-group-left) + min(38vw, 160px));
            bottom: 24px;
            width: min(38vw, var(--boat-width));
            height: calc(var(--boat-hull-height) + 36px);
            flex-basis: auto;
            transform: none;
          }

          .paper-boat-label.is-short {
            --boat-width: 116px;
          }

          .paper-boat-label.is-medium {
            --boat-width: 134px;
          }

          .paper-boat-label.is-long {
            --boat-width: 148px;
          }

          .paper-boat-label.has-translation,
          .paper-boat-label.is-long:not(.has-translation) {
            --boat-hull-height: 52px;
          }

          .boat-hull {
            padding: 4px 10px 5px;
          }

          .boat-hull strong {
            font-size: clamp(10.5px, 2.9vw, 12.5px);
            font-weight: 600;
            line-height: 13px;
          }
          .boat-translation {
            font-size: clamp(8.5px, 2.25vw, 9.5px);
            font-weight: 450;
            line-height: 10px;
          }

          .paper-boat-label.is-long .boat-hull strong {
            display: block;
            overflow: visible;
            font-size: clamp(10.5px, 2.8vw, 12px);
            text-overflow: clip;
            white-space: normal;
          }

          .paper-boat-label.is-long .boat-translation {
            display: block;
            overflow: visible;
            font-size: clamp(8.5px, 2.25vw, 9.5px);
            line-height: 10px;
            text-overflow: clip;
            white-space: normal;
          }

          .shelf-board { display: none; }

          .secondary-tier.is-reserved { display: none; }

          .secondary-tier:not(.is-reserved) {
            margin-top: 34px;
          }

          .future-work-slot { display: none; }

          .lived-in-shelf {
            height: 118px;
            margin-inline: 4%;
          }

          .lyric-notebook { left: 7%; width: 92px; height: 64px; }
          .small-plant { right: 10%; }
          .blue-white-vessel { left: 39%; transform: scale(0.88); transform-origin: bottom; }
          .ochre-sculpture { display: none; }
          .clay-bowl { display: none; }
        }

        @media (min-width: 500px) and (max-width: 980px) {
          .song-exhibit {
            --mobile-group-left: calc((100% - 308px) / 2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .album-cover,
          .paper-boat-label {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
