"use client";

import { useEffect, useRef } from "react";

import MusicShelf from "@/components/MusicShelf";
import RoomIntro from "@/components/RoomIntro";
import { useSound } from "@/components/SoundProvider";
import type { RoomIntroData, SiteLanguage, SongId } from "@/types";

type MusicRoomProps = {
  intro: RoomIntroData;
  language: SiteLanguage;
  restoreScrollPosition: number | null;
  restoreFocusSongId: SongId | null;
  onBack: () => void;
  onSelectSong: (songId: SongId) => void;
};

export default function MusicRoom({
  intro,
  language,
  restoreScrollPosition,
  restoreFocusSongId,
  onBack,
  onSelectSong,
}: MusicRoomProps) {
  const { playUISound } = useSound();
  const shelfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetPosition = restoreScrollPosition ?? 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetPosition, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [restoreScrollPosition]);

  function scrollToShelf() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    shelfRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <main className="music-room-page">
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
        <span>{language === "en" ? "Back" : "返回"}</span>
      </button>

      <RoomIntro
        key={intro.roomId}
        intro={intro}
        language={language}
        onContinue={scrollToShelf}
      />

      <div className="room-transition" aria-hidden="true">
        <span className="vine-pot" />
        <span className="transition-vine">
          <i className="vine-branch branch-one" />
          <i className="vine-branch branch-two" />
          <i className="vine-leaf-detail leaf-detail-one" />
          <i className="vine-leaf-detail leaf-detail-two" />
          <i className="vine-leaf-detail leaf-detail-three" />
        </span>
        <span className="record-spine spine-one" />
        <span className="record-spine spine-two" />
        <span className="record-spine spine-three" />
        <span className="shelf-crown" />
      </div>

      <div ref={shelfRef} className="shelf-destination">
        <MusicShelf
          onSelectSong={onSelectSong}
          language={language}
          restoreFocusSongId={restoreFocusSongId}
        />
      </div>

      <style jsx>{`
        .music-room-page {
          --music-wall: #f3ecdd;
          --music-wall-light: #fffaf0;
          --music-wall-shadow: #d8c4a5;
          --music-cobalt: #176b91;
          --music-sky: #66b4cf;
          --music-sun: #e3b64f;
          --music-terracotta: #b96e4c;
          --music-earth: #8f5c3f;
          --music-vine: #78a67b;
          --music-leaf: #88b96f;
          --music-shelf-wood: #b98553;
          --music-shelf-dark: #70452e;
          --music-ink: #24434b;
          --music-linen: #eee2cc;
          min-height: 100vh;
          overflow-x: clip;
          color: var(--music-ink);
          background:
            linear-gradient(116deg, rgba(255, 253, 244, 0.82) 0 19%, transparent 19.2% 100%),
            radial-gradient(circle at 12% 6%, rgba(255, 248, 211, 0.92), transparent 24%),
            repeating-linear-gradient(8deg, rgba(89, 76, 62, 0.025) 0 1px, transparent 1px 36px),
            var(--music-wall);
          font-family: var(--font-body);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--music-ink);
          cursor: pointer;
          font: inherit;
          font-weight: 700;
        }

        .back-icon {
          display: inline-flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(33, 81, 94, 0.32);
          border-radius: var(--radius-round);
          background: rgba(255, 252, 244, 0.88);
          box-shadow: 0 5px 14px rgba(42, 70, 74, 0.12);
        }

        .back-arrow {
          font-size: 25px;
          line-height: 1;
          transform: translate(-1px, -1px);
        }

        .room-transition {
          position: relative;
          z-index: var(--z-object);
          width: min(1180px, calc(100% - 48px));
          height: clamp(130px, 17vh, 178px);
          margin: -26px auto 0;
          pointer-events: none;
        }

        .room-transition::before {
          position: absolute;
          left: 9%;
          right: 9%;
          bottom: 34px;
          height: 1px;
          background: rgba(30, 101, 131, 0.2);
          content: "";
        }

        .transition-vine {
          position: absolute;
          left: calc(7% + 15px);
          bottom: 54px;
          width: 72%;
          height: 92px;
          border-top: 2px solid color-mix(in srgb, var(--music-vine) 74%, transparent);
          border-left: 3px solid color-mix(in srgb, var(--music-vine) 82%, transparent);
          border-radius: 72% 0 0 0;
          transform: rotate(2deg);
        }

        .vine-pot {
          position: absolute;
          left: 7%;
          bottom: 27px;
          width: 34px;
          height: 25px;
          border: 1px solid rgba(114, 71, 44, 0.42);
          border-radius: 3px 3px 13px 13px;
          background:
            linear-gradient(180deg, rgba(255, 231, 191, 0.25), transparent 30%),
            var(--music-terracotta);
          box-shadow: 3px 5px 7px rgba(71, 49, 35, 0.13);
        }

        .vine-pot::before {
          position: absolute;
          left: -3px;
          right: -3px;
          top: -5px;
          height: 7px;
          border: 1px solid rgba(103, 65, 41, 0.45);
          border-radius: 4px;
          background: #c88159;
          content: "";
        }

        .transition-vine::before,
        .transition-vine::after {
          position: absolute;
          width: 24px;
          height: 13px;
          border-radius: 90% 0 90% 0;
          background: color-mix(in srgb, var(--music-leaf) 72%, transparent);
          content: "";
        }

        .transition-vine::before {
          left: -8px;
          top: 46%;
          transform: rotate(-31deg);
        }

        .transition-vine::after {
          left: 53%;
          top: -6px;
          transform: rotate(24deg) scale(0.86);
        }

        .vine-branch {
          position: absolute;
          height: 34px;
          border-top: 1.5px solid color-mix(in srgb, var(--music-vine) 66%, transparent);
          border-radius: 50%;
          transform-origin: left center;
        }

        .branch-one {
          left: 29%;
          top: -4px;
          width: 76px;
          transform: rotate(-12deg);
        }

        .branch-two {
          left: 69%;
          top: -2px;
          width: 58px;
          transform: rotate(14deg) scaleY(-1);
        }

        .vine-leaf-detail {
          position: absolute;
          width: 17px;
          height: 10px;
          border-radius: 90% 0 90% 0;
          background: color-mix(in srgb, var(--music-leaf) 66%, transparent);
        }

        .leaf-detail-one { left: 34%; top: -15px; transform: rotate(-24deg); }
        .leaf-detail-two { left: 63%; top: -8px; transform: rotate(37deg) scale(0.82); }
        .leaf-detail-three { left: 83%; top: 8px; transform: rotate(112deg) scale(0.72); }

        .record-spine {
          position: absolute;
          right: 11%;
          bottom: 35px;
          width: 23px;
          border: 1px solid rgba(38, 86, 93, 0.22);
          border-radius: 2px 2px 0 0;
          background: var(--music-sun);
          box-shadow: 3px 0 6px rgba(44, 67, 69, 0.09);
        }

        .spine-one {
          height: 66px;
          transform: rotate(3deg);
        }

        .spine-two {
          right: calc(11% + 27px);
          height: 54px;
          background: var(--music-cobalt);
          transform: rotate(-2deg);
        }

        .spine-three {
          right: calc(11% + 52px);
          height: 60px;
          background: var(--music-terracotta);
        }

        .shelf-crown {
          position: absolute;
          left: 5%;
          right: 5%;
          bottom: 18px;
          height: 18px;
          border: 1px solid rgba(28, 91, 119, 0.34);
          background:
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0 1px, transparent 1px 20px),
            linear-gradient(180deg, #2b83a5, var(--music-cobalt));
          box-shadow: 0 12px 18px rgba(38, 68, 76, 0.16);
        }

        .shelf-destination {
          position: relative;
          scroll-margin-top: 0;
        }

        @media (max-width: 760px) {
          .room-transition {
            width: calc(100% - 36px);
            height: 112px;
            margin-top: -10px;
          }

          .transition-vine {
            left: calc(4% + 13px);
            bottom: 50px;
            width: 56%;
            height: 68px;
          }

          .vine-pot { left: 4%; }

          .branch-two,
          .leaf-detail-three { display: none; }

          .record-spine {
            right: 8%;
          }

          .spine-two { right: calc(8% + 27px); }
          .spine-three { right: calc(8% + 52px); }

          .shelf-crown {
            left: 0;
            right: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .music-room-page,
          .back-link {
            scroll-behavior: auto;
            transition: none;
          }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 640px) {
          .music-room-page ~ .contact-trigger {
            width: 46px;
            min-width: 46px;
            height: 46px;
            padding: 0;
            justify-content: center;
          }

          .music-room-page ~ .contact-trigger .contact-trigger-label {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
