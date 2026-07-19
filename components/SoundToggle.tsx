"use client";

import { useSound } from "@/components/SoundProvider";
import type { SiteLanguage } from "@/types";

export default function SoundToggle({
  language,
  slot = "secondary",
}: {
  language: SiteLanguage;
  slot?: "secondary" | "tertiary";
}) {
  const { soundEnabled, toggleSound } = useSound();
  const label = soundEnabled
    ? language === "en"
      ? "Turn off interface sounds"
      : "关闭界面音效"
    : language === "en"
      ? "Turn on interface sounds"
      : "开启界面音效";

  return (
    <button
      className={`house-control house-control--top-right-${slot} sound-toggle ${soundEnabled ? "is-on" : "is-off"}`}
      type="button"
      onClick={toggleSound}
      aria-label={label}
      aria-pressed={soundEnabled}
      title={label}
    >
      <span className="sound-icon" aria-hidden="true">
        <span className="speaker-box" />
        <span className="speaker-cone" />
        <span className="sound-wave wave-one" />
        <span className="sound-wave wave-two" />
        <span className="mute-slash" />
      </span>
      <span className="sound-label">
        {language === "en"
          ? soundEnabled
            ? "Sound On"
            : "Sound Off"
          : soundEnabled
            ? "音效开启"
            : "音效关闭"}
      </span>

      <style jsx>{`
        .sound-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid rgba(101, 65, 39, 0.38);
          border-radius: var(--radius-round);
          background: rgba(255, 248, 236, 0.84);
          color: #5a321d;
          box-shadow: var(--shadow-raised);
          backdrop-filter: blur(8px);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
        }

        .sound-toggle.is-off {
          color: #745f50;
          background: rgba(242, 236, 226, 0.86);
        }

        .sound-icon {
          position: relative;
          display: block;
          width: 20px;
          height: 18px;
          flex: 0 0 20px;
        }

        .speaker-box {
          position: absolute;
          left: 1px;
          top: 6px;
          width: 5px;
          height: 7px;
          border-radius: 1px;
          background: currentColor;
        }

        .speaker-cone {
          position: absolute;
          left: 5px;
          top: 3px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 7px solid currentColor;
          transform: rotate(180deg);
        }

        .sound-wave {
          position: absolute;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
        }

        .wave-one {
          right: 4px;
          top: 5px;
          width: 5px;
          height: 8px;
        }

        .wave-two {
          right: 0;
          top: 2px;
          width: 9px;
          height: 14px;
        }

        .mute-slash {
          display: none;
          position: absolute;
          left: 9px;
          top: 1px;
          width: 2px;
          height: 17px;
          border-radius: 999px;
          background: currentColor;
          transform: rotate(-42deg);
          box-shadow: 0 0 0 1px rgba(255, 248, 236, 0.72);
        }

        .is-off .sound-wave {
          display: none;
        }

        .is-off .mute-slash {
          display: block;
        }

        @media (max-width: 560px) {
          .sound-toggle {
            width: 44px;
            min-height: 44px;
            justify-content: center;
            padding: 8px;
          }

          .sound-label {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        }
      `}</style>
    </button>
  );
}
