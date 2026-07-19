"use client";

import { useCallback, useRef } from "react";

import { useSound } from "@/components/SoundProvider";
import { rooms } from "@/data/rooms";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import type { RoomId, SiteLanguage } from "@/types";

export default function PuzzleModal({
  puzzleRoom,
  answer,
  puzzleMessage,
  setAnswer,
  checkPuzzleAnswer,
  useMasterKey,
  setPuzzleRoom,
  language,
}: {
  puzzleRoom: RoomId | null;
  answer: string;
  puzzleMessage: string;
  setAnswer: (answer: string) => void;
  checkPuzzleAnswer: () => void;
  useMasterKey: () => void;
  setPuzzleRoom: (room: RoomId | null) => void;
  language: SiteLanguage;
}) {
  const { playUISound } = useSound();
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closePuzzle = useCallback(() => {
    playUISound("close");
    setPuzzleRoom(null);
  }, [playUISound, setPuzzleRoom]);

  useAccessibleDialog({
    open: Boolean(puzzleRoom),
    dialogRef,
    initialFocusRef: inputRef,
    onClose: closePuzzle,
  });

  if (!puzzleRoom) return null;

  const roomTitle = rooms[puzzleRoom].title[language];

  return (
    <div className="puzzle-overlay">
      <section
        ref={dialogRef}
        className="puzzle-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="puzzle-title"
        aria-describedby="puzzle-description"
        tabIndex={-1}
      >
        <p className="puzzle-room">
          {language === "en"
            ? `Locked door: ${roomTitle}`
            : `锁住的房间：${roomTitle}`}
        </p>

        <h2 id="puzzle-title">
          {language === "en" ? "Access Required" : "需要解锁"}
        </h2>

        <p id="puzzle-description" className="puzzle-hint">
          {language === "en"
            ? "Hint: Sometimes the simplest key is the right one."
            : "提示：有时候，最简单的钥匙就是正确答案。"}
        </p>

        <input
          ref={inputRef}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") checkPuzzleAnswer();
          }}
          aria-label={language === "en" ? "Access key" : "访问钥匙"}
          placeholder={language === "en" ? "Enter access key" : "请输入访问钥匙"}
        />

        {puzzleMessage && (
          <p className="puzzle-message" aria-live="polite">
            {puzzleMessage}
          </p>
        )}

        <div className="puzzle-actions">
          <button type="button" onClick={checkPuzzleAnswer}>
            {language === "en" ? "Unlock" : "解锁"}
          </button>

          <button type="button" className="secondary" onClick={closePuzzle}>
            {language === "en" ? "Cancel" : "取消"}
          </button>

          <button type="button" className="master-key" onClick={useMasterKey}>
            {language === "en" ? "Use Master Key" : "使用万能钥匙"}
          </button>
        </div>

        <p className="master-key-note">
          {language === "en"
            ? "Master Key unlocks this room only."
            : "万能钥匙只会解锁当前这个房间。"}
        </p>
      </section>

      <style jsx>{`
        .puzzle-overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: grid;
          place-items: center;
          padding: max(var(--space-4), env(safe-area-inset-top))
            max(var(--space-4), env(safe-area-inset-right))
            max(var(--space-4), env(safe-area-inset-bottom))
            max(var(--space-4), env(safe-area-inset-left));
          background: rgba(69, 43, 25, 0.34);
          backdrop-filter: blur(3px);
        }

        .puzzle-dialog {
          position: relative;
          z-index: var(--z-dialog);
          width: min(100%, 420px);
          max-height: calc(100svh - 36px);
          overflow-y: auto;
          box-sizing: border-box;
          padding: clamp(24px, 5vw, 32px);
          border: 1px solid rgba(120, 78, 42, 0.22);
          border-radius: var(--radius-object);
          background:
            radial-gradient(circle at 1px 1px, rgba(120, 90, 60, 0.06) 1px, transparent 1.2px),
            var(--house-paper);
          background-size: 5px 5px;
          color: var(--house-ink);
          box-shadow: var(--shadow-deep);
        }

        .puzzle-room {
          margin: 0;
          color: #9b673c;
          font-weight: 700;
        }

        h2 {
          margin: var(--space-3) 0 0;
          font-family: var(--font-display);
        }

        .puzzle-hint {
          margin: var(--space-3) 0 0;
          color: var(--house-ink-muted);
          line-height: 1.6;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          margin-top: var(--space-4);
          padding: 12px;
          border: 1px solid rgba(120, 70, 35, 0.38);
          border-radius: var(--radius-object);
          background: rgba(255, 255, 255, 0.68);
          color: var(--house-ink);
        }

        .puzzle-message {
          margin: var(--space-3) 0 0;
          color: #9b673c;
          font-size: 14px;
        }

        .puzzle-actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-5);
        }

        button {
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid rgba(120, 70, 35, 0.45);
          border-radius: var(--radius-control);
          background: rgba(255, 248, 236, 0.72);
          color: #5a321d;
          cursor: pointer;
          font-weight: 700;
          transition:
            transform var(--duration-fast) var(--ease-object),
            background var(--duration-fast) var(--ease-object);
        }

        button:hover {
          background: rgba(255, 248, 236, 0.96);
          transform: translateY(-1px);
        }

        .secondary {
          border-color: rgba(120, 70, 35, 0.28);
          background: transparent;
          color: #7a533a;
          font-weight: 500;
        }

        .master-key {
          border-color: rgba(95, 143, 166, 0.5);
          background: rgba(220, 236, 243, 0.34);
          color: #4f7181;
        }

        .master-key-note {
          margin: var(--space-4) 0 0;
          color: #8a6a50;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
