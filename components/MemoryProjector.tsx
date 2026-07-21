"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";

import { useSound } from "@/components/SoundProvider";
import Projector from "@/components/projector-3d/Projector";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import type { SiteLanguage, SongMemory } from "@/types";

type MemoryProjectorProps = {
  memories?: SongMemory[];
  language: SiteLanguage;
  onProjectionChange?: (open: boolean) => void;
};

export default function MemoryProjector({
  memories = [],
  language,
  onProjectionChange,
}: MemoryProjectorProps) {
  const { playUISound } = useSound();
  const [isProjecting, setIsProjecting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragOverProjector, setIsDragOverProjector] = useState(false);
  const [pressedSlideIndex, setPressedSlideIndex] = useState<number | null>(null);
  const [failedMediaIds, setFailedMediaIds] = useState<Set<string>>(new Set());
  const projectionRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const projectorTriggerRef = useRef<HTMLButtonElement>(null);
  const slidePressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMemories = memories.length > 0;
  const currentMemory = memories[currentIndex];

  useEffect(() => {
    if (!isProjecting) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        playUISound("select");
        setCurrentIndex((previousIndex) =>
          previousIndex === memories.length - 1 ? 0 : previousIndex + 1
        );
      }

      if (event.key === "ArrowLeft") {
        playUISound("select");
        setCurrentIndex((previousIndex) =>
          previousIndex === 0 ? memories.length - 1 : previousIndex - 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjecting, memories.length, playUISound]);

  useEffect(
    () => () => {
      if (slidePressTimerRef.current) clearTimeout(slidePressTimerRef.current);
    },
    []
  );

  const closeProjection = useCallback(() => {
    playUISound("close");
    setIsProjecting(false);
    onProjectionChange?.(false);
  }, [onProjectionChange, playUISound]);

  useAccessibleDialog({
    open: isProjecting,
    dialogRef: projectionRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef: projectorTriggerRef,
    onClose: closeProjection,
  });

  if (!hasMemories) return null;

  function showPrevious() {
    playUISound("select");
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? memories.length - 1 : previousIndex - 1
    );
  }

  function showNext() {
    playUISound("select");
    setCurrentIndex((previousIndex) =>
      previousIndex === memories.length - 1 ? 0 : previousIndex + 1
    );
  }

  function openProjection(index = currentIndex) {
    playUISound("open");
    setCurrentIndex(index);
    setIsProjecting(true);
    onProjectionChange?.(true);
  }

  function activateMiniSlide(index: number) {
    if (slidePressTimerRef.current) clearTimeout(slidePressTimerRef.current);
    setPressedSlideIndex(index);
    slidePressTimerRef.current = setTimeout(() => {
      setPressedSlideIndex(null);
      openProjection(index);
    }, 190);
  }

  function selectProjectedSlide(index: number) {
    playUISound("select");
    setCurrentIndex(index);
  }

  function handleSlideDragStart(
    event: DragEvent<HTMLButtonElement>,
    index: number
  ) {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleProjectorDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragOverProjector(false);

    const droppedIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(droppedIndex) || !memories[droppedIndex]) return;

    openProjection(droppedIndex);
  }

  function renderProjectedMemory(memory: SongMemory) {
    const failed = failedMediaIds.has(memory.id);
    const markFailed = () => setFailedMediaIds((current) => new Set(current).add(memory.id));
    if (memory.type === "image" && memory.src && !failed) {
      return (
        <Image
          className="projected-image"
          src={memory.src}
          alt={memory.title[language]}
          fill
          sizes="(max-width: 760px) 88vw, 760px"
          onError={markFailed}
        />
      );
    }

    if (memory.type === "video" && memory.src && !failed) {
      return (
        <video className="projected-media" controls preload="metadata" src={memory.src} onError={markFailed} />
      );
    }

    if (memory.type === "audio" && memory.src && !failed) {
      return (
        <div className="projected-note">
          <span>{memory.title[language]}</span>
          <audio controls preload="metadata" src={memory.src} onError={markFailed} />
        </div>
      );
    }

    if (failed || ((memory.type === "image" || memory.type === "audio" || memory.type === "video") && !memory.src)) {
      return <div className="projected-note media-placeholder"><span>{language === "en" ? "Media unavailable" : "媒体无法加载"}</span><p>{memory.description[language]}</p></div>;
    }

    return (
      <div className="projected-note">
        <span>{memory.title[language]}</span>
        <p>{memory.description[language]}</p>
      </div>
    );
  }

  return (
    <div className="memory-projector-wrap">
      <p className="projector-kicker">
        {language === "en" ? "Memory Wall" : "记忆墙"}
      </p>

      <div className="projector-table">
        <button
          ref={projectorTriggerRef}
          className="projector-trigger"
          type="button"
          onClick={() => openProjection()}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setIsDragOverProjector(true);
          }}
          onDragLeave={() => setIsDragOverProjector(false)}
          onDrop={handleProjectorDrop}
          aria-label={
            language === "en"
              ? "Start the slide projector"
              : "启动幻灯片投影机"
          }
        >
          <Projector isDropTarget={isDragOverProjector} />
        </button>

        <div
          className="slide-case"
          aria-label={language === "en" ? "Memory slides" : "记忆幻灯片"}
        >
          <span className="case-lip" aria-hidden="true" />
          <div className="slide-row">
            {memories.map((memory, index) => (
              <button
                key={memory.id}
                className={`mini-slide ${
                  index === currentIndex ? "is-current" : ""
                } ${pressedSlideIndex === index ? "is-pressed" : ""}`}
                type="button"
                onClick={() => activateMiniSlide(index)}
                draggable
                onDragStart={(event) => handleSlideDragStart(event, index)}
                aria-label={memory.title[language]}
              >
                <span
                  className="mini-slide-window"
                  style={
                    isProjecting && memory.thumbnail
                      ? { backgroundImage: `url(${memory.thumbnail})` }
                      : undefined
                  }
                >
                  {!isProjecting || !memory.thumbnail
                    ? memory.type === "note"
                      ? "Aa"
                      : memory.type === "image"
                        ? "IMG"
                        : memory.type === "audio"
                          ? "AUD"
                          : "VID"
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isProjecting && currentMemory && (
        <div
          ref={projectionRef}
          className="projection-mode"
          aria-modal="true"
          role="dialog"
          aria-labelledby="projection-title"
          tabIndex={-1}
        >
          <h2 id="projection-title" className="visually-hidden">
            {language === "en" ? "Memory projector" : "记忆投影机"}
          </h2>
          <div className="projection-room" />

          <div className="active-projector is-3d" aria-hidden="true">
            <Projector enableCanvas isLit className="active-projector-visual" />
          </div>
          <div className="projection-beam is-3d" aria-hidden="true" />

          <button
            ref={closeButtonRef}
            className="projection-close"
            type="button"
            onClick={closeProjection}
            aria-label={language === "en" ? "Close projection" : "关闭放映"}
          >
            ×
          </button>

          <button
            className="projection-nav previous"
            type="button"
            onClick={showPrevious}
            aria-label={language === "en" ? "Previous slide" : "上一张幻灯片"}
          >
            ‹
          </button>

          <section className="projection-screen" key={currentMemory.id}>
            <div className="projection-surface">
              {renderProjectedMemory(currentMemory)}
            </div>

            <div className="story-note">
              <span className="story-date">{currentMemory.date}</span>
              <strong>{currentMemory.title[language]}</strong>
              <p>{currentMemory.description[language]}</p>
            </div>
          </section>

          <button
            className="projection-nav next"
            type="button"
            onClick={showNext}
            aria-label={language === "en" ? "Next slide" : "下一张幻灯片"}
          >
            ›
          </button>

          <div className="projection-track">
            {memories.map((memory, index) => (
              <button
                key={`projected-${memory.id}`}
                className={`track-slide ${index === currentIndex ? "active" : ""}`}
                type="button"
                onClick={() => selectProjectedSlide(index)}
                aria-label={memory.title[language]}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .memory-projector-wrap {
          --projector-brass: #aa7b3f;
          width: 100%;
          margin: 0;
          position: relative;
        }

        .projector-kicker {
          margin: 0 0 8px;
          color: #234f5d;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
          text-align: left;
          text-transform: uppercase;
        }

        .projector-table {
          position: relative;
          display: grid;
          grid-template-columns: minmax(320px, 410px) minmax(300px, 480px);
          justify-content: center;
          align-items: center;
          gap: clamp(18px, 3vw, 40px);
          min-height: 164px;
          padding: 8px clamp(14px, 2.4vw, 26px);
          border: 1px solid rgba(37, 91, 103, 0.42);
          border-right: 0;
          border-left: 0;
          background:
            linear-gradient(112deg, rgba(255, 252, 239, 0.58) 0 20%, transparent 20.2%),
            radial-gradient(circle at 2px 2px, rgba(45, 76, 74, 0.07) 1px, transparent 1.2px),
            #d8c6aa;
          background-size: auto, 8px 8px, auto;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 15px 30px rgba(62, 69, 62, 0.14);
        }

        .projector-trigger {
          position: relative;
          display: grid;
          width: min(100%, 380px);
          height: 164px;
          place-items: center;
          justify-self: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .slide-case {
          position: relative;
          width: min(100%, 470px);
          min-width: 0;
          box-sizing: border-box;
          justify-self: center;
          padding: 12px 14px 9px;
          border: 1px solid #0d5575;
          border-left: 5px solid #e0b54e;
          border-radius: 4px;
          background:
            linear-gradient(112deg, rgba(117, 191, 209, 0.24) 0 22%, transparent 22.2%),
            #176b91;
          box-shadow:
            7px 9px 0 rgba(33, 66, 72, 0.16),
            inset 0 1px 0 rgba(220, 244, 244, 0.24);
        }

        .case-lip {
          position: absolute;
          left: 8px;
          right: 8px;
          top: 6px;
          height: 4px;
          border-bottom: 1px solid rgba(221, 240, 238, 0.38);
        }

        .slide-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 76px;
          overflow-x: auto;
          padding: 5px 2px 2px;
          scrollbar-width: thin;
        }

        .mini-slide {
          width: 72px;
          height: 72px;
          flex: 0 0 72px;
          padding: 7px;
          border: 1px solid #8b7048;
          border-radius: 1px;
          background: #f0e5cf;
          cursor: pointer;
          box-shadow: 3px 3px 0 rgba(53, 45, 40, 0.13);
          transform: translateY(0);
          transition:
            transform var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
        }

        .mini-slide:hover,
        .mini-slide:focus-visible,
        .mini-slide.is-pressed {
          transform: translateY(-7px);
          box-shadow:
            0 6px 0 -3px var(--projector-brass),
            3px 5px 0 rgba(53, 42, 33, 0.14);
        }

        .mini-slide.is-current {
          border-color: #e0b54e;
          box-shadow:
            0 0 0 2px rgba(224, 181, 78, 0.38),
            3px 3px 0 rgba(53, 45, 40, 0.13);
        }

        .mini-slide.is-pressed {
          animation: miniSlideTap 190ms var(--ease-object);
        }

        .mini-slide-window {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          background: #315846 center / cover no-repeat;
          color: #fff3d7;
          font-size: 12px;
          font-weight: 700;
        }

        .projection-mode {
          --active-projector-left: clamp(26px, 6vw, 86px);
          --active-projector-bottom: clamp(28px, 5vh, 60px);
          --active-projector-scale: 1.32;
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .projection-room {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(112deg, rgba(54, 101, 104, 0.16) 0 22%, transparent 22.3%),
            radial-gradient(circle at 54% 43%, rgba(239, 208, 145, 0.13), transparent 35%),
            rgba(24, 31, 29, 0.82);
          backdrop-filter: blur(3px) saturate(0.72);
        }

        .active-projector {
          position: fixed;
          left: var(--active-projector-left);
          bottom: var(--active-projector-bottom);
          z-index: calc(var(--z-dialog) + 2);
          width: 204px;
          height: 116px;
          transform: scale(var(--active-projector-scale));
          transform-origin: left bottom;
          pointer-events: none;
        }

        .active-projector.is-3d {
          inset: 0;
          z-index: calc(var(--z-dialog) + 1);
          width: 100vw;
          height: 100dvh;
          transform: none;
          overflow: hidden;
        }

        .projection-beam {
          position: fixed;
          left: calc(
            var(--active-projector-left) +
              196px * var(--active-projector-scale)
          );
          bottom: calc(
            var(--active-projector-bottom) +
              54px * var(--active-projector-scale)
          );
          z-index: calc(var(--z-dialog) + 1);
          width: min(55vw, 720px);
          height: min(43vw, 520px);
          background: linear-gradient(
            90deg,
            rgba(244, 213, 143, 0.27),
            rgba(244, 213, 143, 0.09) 56%,
            transparent
          );
          clip-path: polygon(0 100%, 100% 0, 100% 72%);
          animation: beamPulse 2400ms ease-in-out infinite;
          pointer-events: none;
        }

        .projection-beam.is-3d {
          display: none;
        }

        .projection-screen {
          position: relative;
          z-index: calc(var(--z-dialog) + 2);
          width: min(70vw, 760px);
          margin-top: 10px;
          padding-bottom: 92px;
          animation: slideClick 300ms var(--ease-object);
        }

        .projection-surface {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          border: 2px solid rgba(239, 222, 180, 0.56);
          border-radius: 4px;
          background: #eee4cf;
          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.42),
            inset 0 0 54px rgba(74, 57, 38, 0.16);
        }

        .projection-surface::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(70, 55, 38, 0.03) 0 1px,
            transparent 1px 5px
          );
          pointer-events: none;
        }

        .projected-image {
          position: absolute;
          inset: 0;
          background-position: center;
          background-size: cover;
          filter: sepia(0.06) saturate(0.94) contrast(0.97);
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .projected-media {
          width: 100%;
          height: 100%;
          background: #171717;
          object-fit: contain;
        }

        .projected-note {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          box-sizing: border-box;
          background: linear-gradient(135deg, #fff8e8, #d9c9aa);
          color: #26444a;
          text-align: center;
        }

        .projected-note span {
          margin-bottom: 14px;
          font-size: 34px;
          font-weight: 700;
          line-height: 1.16;
        }

        .projected-note p {
          max-width: 520px;
          margin: 0;
          color: #5c5547;
          font-size: 18px;
          line-height: 1.75;
        }

        .story-note {
          position: relative;
          width: min(430px, 56%);
          margin: 12px 0 0 auto;
          padding: 15px 17px 17px;
          border: 1px solid rgba(25, 91, 118, 0.32);
          border-radius: 3px;
          background: #f7ecd5;
          color: #26444a;
          box-shadow: 8px 10px 0 rgba(0, 0, 0, 0.14);
        }

        .story-date {
          display: block;
          margin-bottom: 6px;
          color: #176b91;
          font-size: 12px;
          letter-spacing: 0.1em;
        }

        .story-note strong {
          display: block;
          margin-bottom: 7px;
          font-size: 17px;
        }

        .story-note p {
          margin: 0;
          color: #5f5549;
          font-size: 14px;
          line-height: 1.6;
        }

        .projection-close,
        .projection-nav {
          position: fixed;
          z-index: calc(var(--z-dialog) + 3);
          border: 1px solid rgba(239, 215, 158, 0.5);
          background: rgba(25, 74, 80, 0.78);
          color: #f6e3b8;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
        }

        .projection-close {
          top: max(20px, env(safe-area-inset-top));
          right: max(22px, env(safe-area-inset-right));
          width: 42px;
          height: 42px;
          border-radius: 50%;
          font-size: 25px;
        }

        .projection-nav {
          top: 50%;
          width: 46px;
          height: 62px;
          border-radius: 5px;
          transform: translateY(-50%);
          font-size: 38px;
        }

        .projection-nav.previous { left: 24px; }
        .projection-nav.next { right: 24px; }

        .projection-track {
          position: fixed;
          left: 50%;
          bottom: max(22px, env(safe-area-inset-bottom));
          z-index: calc(var(--z-dialog) + 3);
          display: flex;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid rgba(246, 224, 174, 0.28);
          border-radius: 3px;
          background: rgba(45, 35, 26, 0.64);
          transform: translateX(-50%);
        }

        .track-slide {
          width: 25px;
          height: 31px;
          padding: 4px;
          border: 1px solid rgba(246, 224, 174, 0.28);
          background: #d9d0ba;
          cursor: pointer;
          transition: transform var(--duration-fast) var(--ease-object);
        }

        .track-slide span {
          display: block;
          width: 100%;
          height: 100%;
          background: #514a3f;
        }

        .track-slide.active { transform: translateY(-5px); }

        @keyframes beamPulse {
          0%, 100% { opacity: 0.68; }
          50% { opacity: 0.84; }
        }

        @keyframes slideClick {
          from { opacity: 0.35; transform: translateX(-7px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes miniSlideTap {
          0%, 100% { transform: translateY(0); }
          55% { transform: translateY(-8px); }
        }

        @media (max-width: 760px) {
          .projection-mode {
            --active-projector-left: 64px;
            --active-projector-bottom: 82px;
            --active-projector-scale: 0.8;
          }

          .projector-table {
            grid-template-columns: 1fr;
            gap: 4px;
            min-height: 0;
            padding: 6px 10px 8px;
          }

          .projector-trigger {
            width: min(100%, 310px);
            height: 142px;
          }

          .slide-case {
            width: min(100%, 360px);
            box-sizing: border-box;
            justify-self: center;
            padding: 10px 12px 7px;
          }

          .slide-row {
            min-height: 66px;
            padding-top: 3px;
          }

          .mini-slide {
            width: 62px;
            height: 62px;
            flex-basis: 62px;
            padding: 6px;
          }

          .active-projector {
            left: var(--active-projector-left);
            bottom: var(--active-projector-bottom);
            transform: scale(var(--active-projector-scale));
          }

          .active-projector.is-3d {
            inset: 0;
            width: 100vw;
            height: 100dvh;
            transform: none;
          }

          .projection-beam {
            left: calc(
              var(--active-projector-left) +
                196px * var(--active-projector-scale)
            );
            bottom: calc(
              var(--active-projector-bottom) +
                54px * var(--active-projector-scale)
            );
            width: 76vw;
            height: 330px;
          }

          .projection-beam.is-3d {
            display: none;
            animation: none;
          }

          .projection-screen {
            width: min(88vw, 620px);
            margin-top: -80px;
            padding-bottom: 126px;
          }

          .story-note {
            width: min(100%, 82vw);
            margin-left: 0;
          }

          .projection-nav {
            top: auto;
            bottom: 82px;
            width: 42px;
            height: 50px;
            transform: none;
            font-size: 32px;
          }

          .projection-nav.previous { left: 16px; }
          .projection-nav.next { right: 16px; }

          .projected-note { padding: 24px; }
          .projected-note span { font-size: clamp(23px, 8vw, 31px); }
          .projected-note p { font-size: 14px; line-height: 1.55; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mini-slide,
          .track-slide {
            transition: none;
          }

          .projection-beam,
          .projection-screen,
          .mini-slide.is-pressed {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
