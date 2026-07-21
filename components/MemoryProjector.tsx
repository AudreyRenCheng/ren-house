"use client";
/* eslint-disable @next/next/no-img-element -- Versioned same-origin memory images are intentionally rendered without an image runtime. */

import { useCallback, useEffect, useRef, useState } from "react";

import StaticProjector from "@/components/StaticProjector";
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedMediaId, setFailedMediaId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentMemory = isOpen ? memories[currentIndex] : undefined;

  const close = useCallback(() => {
    setIsOpen(false);
    onProjectionChange?.(false);
  }, [onProjectionChange]);

  useAccessibleDialog({
    open: isOpen,
    dialogRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef: triggerRef,
    onClose: close,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      setFailedMediaId(null);
      setCurrentIndex((index) =>
        event.key === "ArrowRight"
          ? (index + 1) % memories.length
          : (index - 1 + memories.length) % memories.length
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, memories.length]);

  if (memories.length === 0) return null;

  function open() {
    setIsOpen(true);
    onProjectionChange?.(true);
  }

  function move(offset: number) {
    setFailedMediaId(null);
    setCurrentIndex((index) => (index + offset + memories.length) % memories.length);
  }

  function renderCurrentMemory(memory: SongMemory) {
    const failed = failedMediaId === memory.id;
    const fail = () => setFailedMediaId(memory.id);

    if (memory.type === "image" && memory.src && !failed) {
      return <img src={memory.src} alt={memory.title[language]} decoding="async" onError={fail} />;
    }
    if (memory.type === "video" && memory.src && !failed) {
      return <video controls preload="metadata" src={memory.src} onError={fail} />;
    }
    if (memory.type === "audio" && memory.src && !failed) {
      return <audio controls preload="metadata" src={memory.src} onError={fail} />;
    }
    return (
      <div className="memory-note">
        <strong>{failed ? (language === "en" ? "Media unavailable" : "媒体暂时无法加载") : memory.title[language]}</strong>
        <p>{memory.description[language]}</p>
      </div>
    );
  }

  return (
    <div className="memory-projector">
      <button ref={triggerRef} className="projector-button" type="button" onClick={open}>
        <StaticProjector />
        <span>{language === "en" ? "Open song memories" : "打开歌曲花絮"}</span>
      </button>

      {isOpen && currentMemory && (
        <div ref={dialogRef} className="memory-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-title" tabIndex={-1}>
          <div className="memory-panel">
            <button ref={closeButtonRef} className="close" type="button" onClick={close}>
              {language === "en" ? "Close" : "关闭"}
            </button>
            <div className="current-media" key={currentMemory.id}>
              {renderCurrentMemory(currentMemory)}
            </div>
            <div className="memory-copy">
              <span>{currentMemory.date}</span>
              <h3 id="memory-title">{currentMemory.title[language]}</h3>
              <p>{currentMemory.description[language]}</p>
            </div>
            {memories.length > 1 && (
              <div className="navigation">
                <button type="button" onClick={() => move(-1)}>{language === "en" ? "Previous" : "上一项"}</button>
                <span>{currentIndex + 1} / {memories.length}</span>
                <button type="button" onClick={() => move(1)}>{language === "en" ? "Next" : "下一项"}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .memory-projector { width: 100%; }
        .projector-button {
          display: flex; width: min(100%, 560px); min-height: 240px; margin: 0 auto;
          flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border: 1px solid rgba(35, 85, 94, .24); border-radius: 18px;
          background: #e9ddc9; color: #264952; cursor: pointer;
        }
        .projector-button:active { transform: translateY(1px); }
        .projector-button span { font-weight: 700; }
        .memory-dialog {
          position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
          overflow: auto; padding: 18px; background: rgba(24, 36, 38, .88);
        }
        .memory-panel {
          position: relative; width: min(760px, 100%); padding: 52px 18px 18px;
          border-radius: 16px; background: #f5eddf; color: #213f47;
        }
        .close { position: absolute; top: 12px; right: 12px; }
        .current-media {
          display: grid; width: 100%; min-height: 220px; max-height: 62vh;
          place-items: center; overflow: hidden; border-radius: 10px; background: #d8cbb8;
        }
        .current-media :global(img), .current-media :global(video) {
          display: block; width: 100%; height: auto; max-height: 62vh; object-fit: contain;
        }
        .current-media :global(audio) { width: min(520px, calc(100% - 24px)); }
        .memory-note { padding: 32px; text-align: center; }
        .memory-copy { padding: 14px 2px 4px; }
        .memory-copy h3 { margin: 4px 0; }
        .memory-copy p { margin: 0; line-height: 1.55; }
        .navigation { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; }
        .navigation button, .close { min-height: 40px; padding: 7px 14px; border: 1px solid rgba(33, 63, 71, .35); border-radius: 8px; background: #fffaf0; color: inherit; cursor: pointer; }
        @media (max-width: 640px) {
          .projector-button { min-height: 190px; }
          .memory-dialog { padding: 10px; }
          .memory-panel { padding-inline: 10px; }
          .current-media { min-height: 180px; }
        }
      `}</style>
    </div>
  );
}
