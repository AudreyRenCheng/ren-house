"use client";

import { useMemo, useRef, useState } from "react";

import { useSound } from "@/components/SoundProvider";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import { playMusicalNote } from "@/lib/soundManager";
import type { SiteLanguage } from "@/types";

type NoteName = "Do" | "Re" | "Mi" | "Fa" | "Sol";
type MelodySlotSource = "hint" | "user" | null;
type SlotStatus = "neutral" | "correct" | "wrong";

type MelodySlot = {
  note: NoteName | null;
  source: MelodySlotSource;
};

type MelodyLockProps = {
  language: SiteLanguage;
  onUnlock: () => void;
  onCancel?: () => void;
};

const targetMelody: NoteName[] = ["Do", "Mi", "Sol", "Mi"];
const availableNotes: NoteName[] = ["Do", "Re", "Mi", "Fa", "Sol"];

const noteFrequencies: Record<NoteName, number> = {
  Do: 261.63,
  Re: 293.66,
  Mi: 329.63,
  Fa: 349.23,
  Sol: 392,
};

const emptySlots = targetMelody.map(() => ({
  note: null,
  source: null,
})) satisfies MelodySlot[];

export default function MelodyLock({
  language,
  onUnlock,
  onCancel,
}: MelodyLockProps) {
  const panelRef = useRef<HTMLElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const [slots, setSlots] = useState<MelodySlot[]>(() =>
    emptySlots.map((slot) => ({ ...slot }))
  );

  useAccessibleDialog({
    open: true,
    dialogRef: panelRef,
    initialFocusRef,
    onClose: onCancel,
  });
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const { playUISound } = useSound();

  async function playNote(note: NoteName) {
    await playMusicalNote(noteFrequencies[note]);
  }

  async function playMelody(notes: NoteName[]) {
    for (const note of notes) {
      await playNote(note);
      await new Promise((resolve) => window.setTimeout(resolve, 520));
    }
  }

  const text = useMemo(
    () =>
      language === "en"
        ? {
            title: "Melody Lock",
            intro: "Listen to the short melody, then play it back in order.",
            listen: "Listen",
            hint: "Hint",
            reset: "Reset",
            close: "Back to door",
            success: "The melody matches. The door opens softly.",
            wrong:
              "That note feels a little off. You can listen again or use a hint.",
            completeHint: "All hints are already filled in.",
            noteLabel: "Note",
          }
        : {
            title: "旋律锁",
            intro: "先听一段短旋律，再按顺序把它弹回来。",
            listen: "听旋律",
            hint: "提示",
            reset: "重试",
            close: "回到门口",
            success: "旋律对上了。门轻轻打开了。",
            wrong: "这一个音好像不太对。可以重听或按提示。",
            completeHint: "提示已经填满了。",
            noteLabel: "音符",
          },
    [language]
  );

  function getSlotStatus(index: number): SlotStatus {
    const slot = slots[index];
    if (!slot.note) return "neutral";
    return slot.note === targetMelody[index] ? "correct" : "wrong";
  }

  function getFirstEmptyIndex(nextSlots = slots) {
    return nextSlots.findIndex((slot) => !slot.note);
  }

  function triggerSolved() {
    setIsSolved(true);
    setMessage(text.success);
    playUISound("door-unlock");

    window.setTimeout(() => {
      onUnlock();
    }, 900);
  }

  function fillSlot(note: NoteName, source: MelodySlotSource) {
    const emptyIndex = getFirstEmptyIndex();
    if (emptyIndex === -1) return null;

    const next = slots.map((slot) => ({ ...slot }));
    next[emptyIndex] = { note, source };
    setSlots(next);
    return { next, emptyIndex };
  }

  function handleListen() {
    setIsPlaying(true);
    void playMelody(targetMelody).finally(() => setIsPlaying(false));
  }

  function handleHint() {
    const emptyIndex = getFirstEmptyIndex();
    if (emptyIndex === -1) {
      setMessage(text.completeHint);
      return;
    }

    const note = targetMelody[emptyIndex];
    const filled = fillSlot(note, "hint");
    void playNote(note);
    setMessage("");

    if (
      filled?.next.every((slot, index) => slot.note === targetMelody[index]) &&
      filled.next.every((slot) => Boolean(slot.note))
    ) {
      triggerSolved();
    }
  }

  function handleReset() {
    playUISound("reset");
    setSlots((prev) =>
      prev.map((slot) =>
        slot.source === "hint" ? slot : { note: null, source: null }
      )
    );
    setMessage("");
    setIsSolved(false);
  }

  function handleKeyPress(note: NoteName) {
    const emptyIndex = getFirstEmptyIndex();
    if (emptyIndex === -1 || isSolved) return;

    const filled = fillSlot(note, "user");
    void playNote(note);

    if (note !== targetMelody[emptyIndex]) {
      setMessage(text.wrong);
      playUISound("cancel");
    } else {
      setMessage("");
    }

    if (
      filled?.next.every((slot, index) => slot.note === targetMelody[index]) &&
      filled.next.every((slot) => Boolean(slot.note))
    ) {
      triggerSolved();
    }
  }

  return (
    <div
      className="melody-lock"
      role="dialog"
      aria-modal="true"
      aria-labelledby="melody-title"
    >
      <section
        ref={panelRef}
        className="melody-panel"
        aria-labelledby="melody-title"
        tabIndex={-1}
      >
        <div className="melody-header">
          <p>{language === "en" ? "Music Room" : "音乐房间"}</p>
          <h2 id="melody-title">{text.title}</h2>
          <span>{text.intro}</span>
        </div>

        <div className="melody-actions">
          <button
            ref={initialFocusRef}
            type="button"
            onClick={handleListen}
            disabled={isPlaying}
          >
            {text.listen}
          </button>
          <button type="button" onClick={handleHint} disabled={isSolved}>
            {text.hint}
          </button>
          <button type="button" onClick={handleReset} disabled={isSolved}>
            {text.reset}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              {text.close}
            </button>
          )}
        </div>

        <div className="melody-slots" aria-label={text.title}>
          {slots.map((slot, index) => {
            const status = getSlotStatus(index);
            return (
              <div className="melody-slot" key={`${index}-${slot.source ?? "empty"}`}>
                <span className={`status-light ${status}`} aria-hidden="true" />
                <strong>{slot.note ?? "–"}</strong>
                <small>
                  {text.noteLabel} {index + 1}
                </small>
              </div>
            );
          })}
        </div>

        {message && <p className={isSolved ? "success-message" : "lock-message"}>{message}</p>}

        <div className="melody-keys">
          {availableNotes.map((note) => (
            <button
              className="melody-key"
              type="button"
              key={note}
              onClick={() => handleKeyPress(note)}
              disabled={isSolved}
            >
              {note}
            </button>
          ))}
        </div>
      </section>

      <style jsx>{`
        .melody-lock {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          padding-left: clamp(300px, 34vw, 500px);
          background: rgba(69, 43, 25, 0.34);
          backdrop-filter: blur(3px);
        }

        .melody-panel {
          position: relative;
          z-index: var(--z-dialog);
          width: min(100%, 540px);
          padding: 32px 30px 28px;
          border: 3px solid #9a6539;
          border-radius: 4px;
          background:
            linear-gradient(90deg, transparent 0 96%, rgba(107, 63, 28, 0.1) 96%),
            repeating-linear-gradient(2deg, rgba(125, 76, 36, 0.05) 0 1px, transparent 1px 13px),
            linear-gradient(145deg, #f8dfa1, #e8bd68 72%, #d9a04f);
          color: #3f2a1d;
          box-shadow:
            0 28px 70px rgba(80, 48, 28, 0.3),
            inset 0 0 0 7px rgba(255, 239, 190, 0.46),
            inset 0 0 0 10px rgba(120, 73, 34, 0.23);
        }

        .melody-panel::before {
          position: absolute;
          left: -28px;
          top: 18%;
          width: 28px;
          height: 64%;
          border: 4px solid #a87539;
          border-right: 0;
          content: "";
          opacity: 0.88;
        }

        .melody-panel::after {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 17px;
          height: 5px;
          border: 1px solid #9a6539;
          background: linear-gradient(90deg, #b47d36, #f3d475 50%, #b47d36);
          content: "";
        }

        .melody-header p {
          margin: 0 0 8px;
          color: #9b673c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .melody-header h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 38px);
          letter-spacing: 0;
        }

        .melody-header span {
          display: block;
          margin-top: 10px;
          color: #6d4a30;
          line-height: 1.6;
        }

        .melody-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .melody-actions button,
        .melody-key {
          border: 1px solid rgba(120, 70, 35, 0.38);
          border-radius: 3px;
          background: rgba(255, 238, 186, 0.74);
          color: #5a321d;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          transition:
            background var(--duration-fast) var(--ease-object),
            transform var(--duration-fast) var(--ease-object),
            opacity var(--duration-fast) var(--ease-object);
        }

        .melody-actions button {
          padding: 9px 14px;
        }

        .melody-actions button:hover,
        .melody-key:hover {
          background: rgba(255, 248, 218, 0.98);
        }

        .melody-actions button:disabled,
        .melody-key:disabled {
          cursor: default;
          opacity: 0.55;
          transform: none;
        }

        .melody-slots {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 22px;
        }

        .melody-slot {
          display: grid;
          min-height: 88px;
          place-items: center;
          padding: 10px 8px;
          border: 1px solid rgba(120, 70, 35, 0.18);
          border-radius: 2px;
          background: rgba(255, 242, 203, 0.58);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 0 0 3px rgba(155, 103, 60, 0.08);
        }

        .status-light {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #c9b9a3;
          box-shadow: 0 0 0 3px rgba(120, 70, 35, 0.06);
        }

        .status-light.correct {
          background: #58a870;
          box-shadow: 0 0 0 3px rgba(88, 168, 112, 0.18);
        }

        .status-light.wrong {
          background: #c85b55;
          box-shadow: 0 0 0 3px rgba(200, 91, 85, 0.16);
        }

        .melody-slot strong {
          font-size: 22px;
          line-height: 1;
        }

        .melody-slot small {
          color: #7a533a;
          font-size: 11px;
        }

        .lock-message,
        .success-message {
          margin: 16px 0 0;
          color: #9b673c;
          font-size: 14px;
          line-height: 1.5;
        }

        .success-message {
          color: #437c52;
          font-weight: 800;
        }

        .melody-keys {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 9px;
          margin-top: 22px;
        }

        .melody-key {
          min-height: 58px;
          padding: 10px 8px;
          border-radius: 8px 8px 18px 18px;
          background: linear-gradient(180deg, #fffdf5, #f3dfb7);
        }

        @media (max-width: 760px) {
          .melody-lock {
            align-items: flex-end;
            padding: 16px;
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }

          .melody-panel {
            max-height: calc(100svh - 32px);
            overflow-y: auto;
            padding: 22px 16px;
          }

          .melody-panel::before {
            display: none;
          }

          .melody-slots {
            gap: 7px;
          }

          .melody-slot {
            min-height: 76px;
          }

          .melody-keys {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .melody-actions button,
          .melody-key {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
