"use client";

import { useEffect, useRef, useState } from "react";

import { useSound } from "@/components/SoundProvider";
import { entranceCopy } from "@/data/entrance";
import type { Mode, SiteLanguage } from "@/types";

type EntranceProps = {
  enterMode: (selectedMode: Mode) => void;
  onQuickMusicEntry: () => void;
  language: SiteLanguage;
};

function Keychain({
  mode,
  title,
  shortDescription,
  description,
  selected,
  disabled,
  onSelect,
}: {
  mode: "casual" | "explore";
  title: string;
  shortDescription: string;
  description: string[];
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`keychain ${mode}${selected ? " is-selected" : ""}`}
      type="button"
      onClick={onSelect}
      aria-label={`${title}. ${shortDescription}. ${description.join(" ")}`}
      aria-describedby={`mode-${mode}-detail`}
      aria-pressed={selected}
      disabled={disabled}
    >
      <span className="mode-plaque">
        <strong>{title}</strong>
      </span>
      <span className="key-assembly" aria-hidden="true">
        <span className="hanger-line" />
        <span className="key-ring" />
        <span className="key-body">
          <span className="key-head" />
          <span className="key-collar" />
          <span className="key-stem" />
          <span className="key-teeth" />
        </span>
        <span className="key-charm"><span /></span>
      </span>
      <span className="mobile-mode-note">{shortDescription}</span>
      <span id={`mode-${mode}-detail`} className="mode-description">
        <strong>{title}</strong>
        <span>{description.join(" ")}</span>
      </span>
    </button>
  );
}

export default function Entrance({
  enterMode,
  onQuickMusicEntry,
  language,
}: EntranceProps) {
  const { playUISound } = useSound();
  const text = entranceCopy[language];
  const [selectedMode, setSelectedMode] = useState<"casual" | "explore" | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
      }
    },
    []
  );

  function enterHouse(mode: "casual" | "explore") {
    if (selectedMode) return;

    setSelectedMode(mode);
    playUISound("door-open");
    enterTimerRef.current = window.setTimeout(() => {
      enterMode(mode);
      enterTimerRef.current = null;
    }, 240);
  }

  function handleQuickMusicEntry() {
    playUISound("open");
    onQuickMusicEntry();
  }

  return (
    <main className="entrance-page">
      <section className="entrance-wall" aria-labelledby="entrance-title">
        <div className="wall-panel upper" aria-hidden="true" />
        <div className="wall-panel lower" aria-hidden="true" />
        <div className="wall-ornament left" aria-hidden="true" />
        <div className="wall-ornament right" aria-hidden="true" />

        <div className="welcome-writing">
          <p className="house-kicker">{text.kicker}</p>
          <h1 id="entrance-title">{text.ownerName}</h1>
          <div className="role-summary">{text.role}</div>
          <div className="intro-copy">
            {text.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <button
            className="quick-music-pass"
            type="button"
            onClick={handleQuickMusicEntry}
          >
            <span className="pass-note" aria-hidden="true">♪</span>
            <span className="pass-copy">
              <small>{text.quickEyebrow}</small>
              <strong>{text.quickLabel}</strong>
            </span>
            <span className="pass-arrow" aria-hidden="true">
              →
            </span>
          </button>
          <p className="explore-hint">{text.exploreHint}</p>
        </div>

        <div className="door-scene" aria-label={text.kicker}>
          <div className={`house-sign ${language}`}>
            <span>{text.houseSign}</span>
          </div>

          <div className="door-frame">
            <div className="frame-pattern top" aria-hidden="true" />
            <div className="frame-pattern left" aria-hidden="true" />
            <div className="frame-pattern right" aria-hidden="true" />

            <div className="double-door">
              <div className="door-leaf left-leaf" aria-hidden="true">
                <div className="leaf-medallion" />
                <div className="leaf-panel upper" />
                <div className="leaf-panel lower" />
                <div className="painted-band" />
              </div>

              <div className="door-leaf right-leaf" aria-hidden="true">
                <div className="leaf-medallion" />
                <div className="leaf-panel upper" />
                <div className="leaf-panel lower" />
                <div className="painted-band" />
              </div>

              <div className="center-join" aria-hidden="true" />
              <div className="door-pulls" aria-hidden="true">
                <span />
                <span />
              </div>

              <p className="mode-prompt">{text.modePrompt}</p>

              <Keychain
                mode="casual"
                title={text.casualTitle}
                shortDescription={text.casualShort}
                description={text.casualText}
                selected={selectedMode === "casual"}
                disabled={selectedMode !== null}
                onSelect={() => enterHouse("casual")}
              />

              <Keychain
                mode="explore"
                title={text.exploreTitle}
                shortDescription={text.exploreShort}
                description={text.exploreText}
                selected={selectedMode === "explore"}
                disabled={selectedMode !== null}
                onSelect={() => enterHouse("explore")}
              />

            </div>
          </div>
        </div>

      </section>

      <style jsx>{`
        .entrance-page {
          min-height: 100vh;
          overflow: hidden;
          box-sizing: border-box;
          color: #fff6dc;
          background: #0f6f78;
          font-family: var(--font-sans);
        }

        .entrance-page :global(*),
        .entrance-page :global(*::before),
        .entrance-page :global(*::after) {
          box-sizing: inherit;
        }

        .entrance-wall {
          position: relative;
          min-height: 100vh;
          isolation: isolate;
          overflow: hidden;
          background:
            radial-gradient(circle at 16% 16%, rgba(255, 226, 162, 0.18), transparent 20%),
            radial-gradient(circle at 85% 22%, rgba(255, 113, 115, 0.2), transparent 21%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 24px),
            linear-gradient(180deg, #087d83 0%, #087d83 55%, #145f70 55%, #145f70 100%);
        }

        .entrance-wall::before {
          content: "";
          position: absolute;
          inset: 18px;
          z-index: var(--z-object);
          border: 2px solid rgba(255, 214, 120, 0.28);
          box-shadow: inset 0 0 0 1px rgba(4, 65, 76, 0.28);
          pointer-events: none;
        }

        .entrance-wall::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: var(--z-scene);
          background:
            radial-gradient(circle at 1px 1px, rgba(255, 246, 220, 0.08) 1px, transparent 1.5px),
            linear-gradient(90deg, rgba(4, 65, 76, 0.12) 1px, transparent 1px);
          background-size: 13px 13px, 74px 100%;
          mix-blend-mode: soft-light;
          pointer-events: none;
        }

        .wall-panel {
          position: absolute;
          left: 0;
          right: 0;
          z-index: var(--z-scene);
          pointer-events: none;
        }

        .wall-panel.upper {
          top: 0;
          height: 55%;
          background:
            linear-gradient(90deg, rgba(255, 214, 120, 0.18) 0 8px, transparent 8px 42px),
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent);
          opacity: 0.72;
        }

        .wall-panel.lower {
          bottom: 0;
          height: 45%;
          background:
            repeating-linear-gradient(
              135deg,
              rgba(255, 246, 220, 0.08) 0 10px,
              transparent 10px 22px
            ),
            linear-gradient(180deg, rgba(4, 65, 76, 0.05), rgba(4, 65, 76, 0.18));
          border-top: 4px solid rgba(255, 214, 120, 0.3);
        }

        .wall-ornament {
          position: absolute;
          top: clamp(150px, 25vh, 250px);
          z-index: var(--z-object);
          width: clamp(78px, 9vw, 150px);
          aspect-ratio: 1;
          border: 2px solid rgba(255, 214, 120, 0.32);
          background:
            radial-gradient(circle, rgba(255, 214, 120, 0.3) 0 10%, transparent 11%),
            conic-gradient(
              from 45deg,
              transparent 0 12.5%,
              rgba(255, 214, 120, 0.22) 12.5% 25%,
              transparent 25% 37.5%,
              rgba(231, 83, 90, 0.22) 37.5% 50%,
              transparent 50% 62.5%,
              rgba(255, 214, 120, 0.22) 62.5% 75%,
              transparent 75% 100%
            );
          opacity: 0.72;
          transform: rotate(45deg);
        }

        .wall-ornament.left {
          display: none;
        }

        .wall-ornament.right {
          right: clamp(16px, 4vw, 70px);
        }

        .welcome-writing {
          position: absolute;
          left: clamp(30px, 6vw, 104px);
          top: clamp(70px, 9vh, 104px);
          z-index: calc(var(--z-object) + 5);
          width: clamp(320px, 29vw, 440px);
          min-width: 0;
          color: #fff4cf;
          text-shadow: 0 2px 10px rgba(4, 49, 57, 0.28);
        }

        .house-kicker {
          margin: 0 0 12px;
          color: #ffd36f;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(40px, 4vw, 62px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0;
        }

        .role-summary {
          max-width: 420px;
          margin-top: 12px;
          color: #ffd986;
          font-size: clamp(14px, 1.12vw, 17px);
          font-weight: 800;
          line-height: 1.5;
        }

        .intro-copy {
          display: grid;
          gap: 9px;
          margin-top: 18px;
          color: rgba(255, 246, 220, 0.88);
          font-size: clamp(13px, 0.98vw, 15px);
          line-height: 1.65;
        }

        .intro-copy p {
          margin: 0;
        }

        .intro-copy p:first-child {
          color: #fff7dc;
          font-size: 16px;
          font-weight: 800;
        }

        .quick-music-pass {
          position: relative;
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 26px;
          align-items: center;
          column-gap: 12px;
          width: min(100%, 410px);
          min-height: 78px;
          margin-top: 24px;
          padding: 12px 12px;
          border: 2px solid rgba(255, 215, 121, 0.7);
          border-radius: 5px;
          background:
            radial-gradient(circle at 1px 1px, rgba(104, 56, 33, 0.08) 1px, transparent 1.5px),
            linear-gradient(100deg, #fff1bd, #f1c774 72%, #e9ad56);
          background-size: 6px 6px, auto;
          color: #642a3b;
          cursor: pointer;
          font: inherit;
          text-align: left;
          text-shadow: none;
          box-shadow:
            0 13px 24px rgba(2, 45, 54, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.66),
            inset 0 -4px 0 rgba(139, 74, 35, 0.12);
          transform: none;
          transition:
            transform var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
        }

        .quick-music-pass::before,
        .quick-music-pass::after {
          content: "";
          position: absolute;
          top: 8px;
          bottom: 8px;
          width: 1px;
          background: repeating-linear-gradient(
            180deg,
            rgba(100, 42, 59, 0.36) 0 4px,
            transparent 4px 8px
          );
        }

        .quick-music-pass::before {
          left: 62px;
        }

        .quick-music-pass::after {
          right: 38px;
        }

        .quick-music-pass:hover,
        .quick-music-pass:focus-visible {
          transform: translateY(-4px);
          box-shadow:
            0 18px 28px rgba(2, 45, 54, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.72),
            inset 0 -4px 0 rgba(139, 74, 35, 0.12);
        }

        .quick-music-pass:active {
          transform: translateY(1px);
          box-shadow:
            0 8px 15px rgba(2, 45, 54, 0.2),
            inset 0 2px 5px rgba(100, 42, 59, 0.12);
        }

        .pass-note {
          position: static;
          display: grid;
          width: 34px;
          height: 40px;
          place-items: center;
          color: #743449;
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
          transform: none;
        }

        .pass-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: center;
        }

        .pass-copy small {
          color: #0a7077;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .pass-copy strong {
          margin-top: 4px;
          font-size: clamp(15px, 1.25vw, 19px);
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .pass-arrow {
          position: static;
          justify-self: center;
          font-size: 22px;
          font-weight: 900;
          transform: none;
        }

        .explore-hint {
          margin: 11px 0 0;
          color: rgba(255, 246, 220, 0.74);
          font-size: 12px;
          line-height: 1.5;
        }

        .door-scene {
          position: absolute;
          left: 61%;
          bottom: 0;
          z-index: calc(var(--z-object) + 4);
          display: flex;
          width: clamp(560px, 50vw, 790px);
          height: clamp(650px, 91vh, 920px);
          align-items: flex-end;
          justify-content: center;
          transform: translateX(-50%);
        }

        .door-frame {
          position: relative;
          width: 100%;
          height: 100%;
          padding: clamp(30px, 2.6vw, 44px) clamp(28px, 2.3vw, 40px) 0;
          border-radius: 46% 46% 0 0 / 14% 14% 0 0;
          background:
            radial-gradient(circle at 50% 9%, rgba(255, 244, 195, 0.26), transparent 24%),
            linear-gradient(90deg, #0b6571 0 9%, #f0bd57 9% 13%, #0b6571 13% 87%, #f0bd57 87% 91%, #0b6571 91%),
            linear-gradient(180deg, #10818c, #084d5a);
          box-shadow:
            0 0 0 2px rgba(255, 214, 120, 0.38),
            0 28px 70px rgba(2, 45, 54, 0.45),
            inset 0 0 0 8px rgba(4, 65, 76, 0.5);
        }

        .door-frame::before {
          content: "";
          position: absolute;
          inset: clamp(10px, 0.9vw, 16px);
          border: 3px solid rgba(255, 214, 120, 0.62);
          border-bottom: 0;
          border-radius: 45% 45% 0 0 / 13% 13% 0 0;
          pointer-events: none;
        }

        .door-frame::after {
          content: "";
          position: absolute;
          inset: clamp(20px, 1.8vw, 30px) clamp(18px, 1.6vw, 28px) 0;
          border: 2px solid rgba(91, 33, 44, 0.34);
          border-bottom: 0;
          border-radius: 44% 44% 0 0 / 12% 12% 0 0;
          pointer-events: none;
        }

        .frame-pattern {
          position: absolute;
          z-index: calc(var(--z-object) + 3);
          pointer-events: none;
        }

        .frame-pattern.top {
          left: 20%;
          right: 20%;
          top: clamp(19px, 1.7vw, 30px);
          height: 24px;
          background:
            linear-gradient(135deg, transparent 0 35%, #ef4f5c 36% 48%, transparent 49%),
            linear-gradient(45deg, transparent 0 35%, #ffd36f 36% 48%, transparent 49%);
          background-size: 30px 24px;
          opacity: 0.9;
        }

        .frame-pattern.left,
        .frame-pattern.right {
          top: 18%;
          bottom: 8%;
          width: 18px;
          background:
            radial-gradient(circle at 50% 14px, #ffd36f 0 4px, transparent 5px),
            linear-gradient(180deg, #ef4f5c 0 10px, transparent 10px 24px);
          background-size: 18px 34px, 18px 34px;
          opacity: 0.82;
        }

        .frame-pattern.left {
          left: clamp(16px, 1.5vw, 24px);
        }

        .frame-pattern.right {
          right: clamp(16px, 1.5vw, 24px);
        }

        .double-door {
          position: relative;
          z-index: calc(var(--z-object) + 2);
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 5px solid #6f2037;
          border-bottom: 0;
          border-radius: 43% 43% 0 0 / 12% 12% 0 0;
          background: #9f3043;
          box-shadow:
            inset 0 4px 0 rgba(255, 226, 162, 0.28),
            inset 0 0 0 8px rgba(255, 214, 120, 0.22),
            inset 0 -40px 70px rgba(71, 20, 34, 0.18);
        }

        .door-leaf {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 28%, rgba(255, 214, 120, 0.22), transparent 18%),
            repeating-linear-gradient(
              90deg,
              rgba(255, 244, 195, 0.08) 0 1px,
              transparent 1px 48px
            ),
            linear-gradient(180deg, #e96368 0%, #ce4054 48%, #a92f45 100%);
        }

        .door-leaf::before {
          content: "";
          position: absolute;
          inset: 22px 20px 20px;
          border: 2px solid rgba(255, 214, 120, 0.48);
          border-radius: 40% 40% 8px 8px / 12% 12% 8px 8px;
          box-shadow:
            inset 0 0 0 6px rgba(91, 33, 44, 0.12),
            inset 0 0 0 12px rgba(255, 244, 195, 0.05);
        }

        .door-leaf::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, transparent 0 38%, rgba(255, 214, 120, 0.16) 39% 42%, transparent 43%),
            linear-gradient(45deg, transparent 0 38%, rgba(10, 116, 126, 0.14) 39% 42%, transparent 43%);
          background-size: 58px 58px;
          mix-blend-mode: soft-light;
        }

        .left-leaf {
          border-right: 2px solid rgba(91, 33, 44, 0.45);
        }

        .right-leaf {
          border-left: 2px solid rgba(255, 214, 120, 0.28);
        }

        .leaf-panel {
          position: absolute;
          left: 18%;
          right: 18%;
          z-index: calc(var(--z-object) + 2);
          border: 2px solid rgba(255, 214, 120, 0.44);
          background:
            radial-gradient(circle at 50% 50%, rgba(255, 214, 120, 0.2) 0 4px, transparent 5px),
            linear-gradient(180deg, rgba(255, 244, 195, 0.08), rgba(91, 33, 44, 0.08));
          box-shadow: inset 0 0 0 6px rgba(111, 32, 55, 0.12);
        }

        .leaf-panel.upper {
          top: 31%;
          height: 20%;
          border-radius: 50% 50% 8px 8px / 30% 30% 8px 8px;
        }

        .leaf-panel.lower {
          bottom: 14%;
          height: 23%;
          border-radius: 8px;
        }

        .leaf-medallion {
          position: absolute;
          left: 50%;
          top: 18%;
          z-index: calc(var(--z-object) + 3);
          width: clamp(54px, 6vw, 86px);
          aspect-ratio: 1;
          border: 3px solid rgba(255, 214, 120, 0.66);
          border-radius: 50%;
          background:
            radial-gradient(circle, #ffd36f 0 10%, transparent 11%),
            conic-gradient(
              from 0deg,
              rgba(255, 214, 120, 0.72) 0 12%,
              rgba(9, 121, 130, 0.54) 12% 24%,
              rgba(255, 246, 220, 0.6) 24% 36%,
              rgba(111, 32, 55, 0.38) 36% 48%,
              rgba(255, 214, 120, 0.72) 48% 60%,
              rgba(9, 121, 130, 0.54) 60% 72%,
              rgba(255, 246, 220, 0.6) 72% 84%,
              rgba(111, 32, 55, 0.38) 84% 100%
            );
          box-shadow:
            0 8px 16px rgba(91, 33, 44, 0.22),
            inset 0 0 0 9px rgba(206, 64, 84, 0.62);
          transform: translateX(-50%);
        }

        .painted-band {
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 8%;
          z-index: calc(var(--z-object) + 2);
          height: 26px;
          background:
            linear-gradient(135deg, transparent 0 35%, #ffd36f 36% 48%, transparent 49%),
            linear-gradient(45deg, transparent 0 35%, #0b7f87 36% 48%, transparent 49%);
          background-size: 30px 26px;
          opacity: 0.9;
        }

        .center-join {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          z-index: calc(var(--z-object) + 5);
          width: 12px;
          background:
            linear-gradient(90deg, rgba(71, 20, 34, 0.34), #ffd36f 42% 58%, rgba(71, 20, 34, 0.34)),
            linear-gradient(180deg, rgba(255, 244, 195, 0.32), rgba(111, 32, 55, 0.2));
          transform: translateX(-50%);
          box-shadow:
            -4px 0 12px rgba(91, 33, 44, 0.18),
            4px 0 12px rgba(91, 33, 44, 0.18);
        }

        .door-pulls {
          position: absolute;
          left: 50%;
          top: 57%;
          z-index: calc(var(--z-object) + 7);
          display: flex;
          gap: 24px;
          transform: translateX(-50%);
        }

        .door-pulls span {
          width: 18px;
          height: 56px;
          border: 3px solid #ffd36f;
          border-radius: 999px;
          background: rgba(255, 246, 220, 0.12);
          box-shadow:
            0 8px 14px rgba(91, 33, 44, 0.22),
            inset 0 0 0 2px rgba(111, 32, 55, 0.2);
        }

        .door-plate {
          position: absolute;
          left: 25%;
          top: 12%;
          z-index: calc(var(--z-object) + 8);
          width: min(34%, 190px);
          padding: 13px 12px 11px;
          border: 2px solid rgba(255, 214, 120, 0.7);
          border-radius: 8px 8px 14px 6px;
          background:
            radial-gradient(circle at 8px 8px, rgba(255, 214, 120, 0.24) 0 2px, transparent 2.5px),
            linear-gradient(135deg, #fff0b8, #f1bd66);
          background-size: 12px 12px, auto;
          color: #67243a;
          text-align: center;
          transform: translateX(-50%) rotate(-1.4deg);
          box-shadow: 0 14px 22px rgba(91, 33, 44, 0.2);
        }

        .door-plate span,
        .door-plate small {
          display: block;
        }

        .door-plate span {
          font-size: clamp(22px, 1.8vw, 31px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: 0.08em;
        }

        .door-plate small {
          margin-top: 7px;
          color: #0a6d75;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        :global(.keychain) {
          position: absolute;
          z-index: calc(var(--z-object) + 9);
          width: 112px;
          min-height: 150px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #3f1e25;
          cursor: pointer;
          font: inherit;
          transform-origin: 50% 4px;
          transition:
            transform var(--duration-object) var(--ease-object),
            filter var(--duration-object) var(--ease-object);
        }

        :global(.keychain.casual) {
          left: 27%;
          top: 38%;
          transform: translateX(-50%) rotate(-3deg);
        }

        :global(.keychain.explore) {
          left: 73%;
          top: 41%;
          transform: translateX(-50%) rotate(3deg);
        }

        :global(.keychain:hover),
        :global(.keychain:focus-visible) {
          filter: drop-shadow(0 14px 14px rgba(71, 20, 34, 0.22));
        }

        :global(.keychain.casual:hover),
        :global(.keychain.casual:focus-visible) {
          transform: translateX(-50%) translateY(-5px) rotate(-5deg);
        }

        :global(.keychain.explore:hover),
        :global(.keychain.explore:focus-visible) {
          transform: translateX(-50%) translateY(-5px) rotate(5deg);
        }

        :global(.keychain:focus-visible) {
          outline: 3px solid rgba(255, 214, 120, 0.44);
          outline-offset: 10px;
          border-radius: 8px;
        }

        :global(.hanger-line) {
          position: absolute;
          left: 50%;
          top: -36px;
          width: 2px;
          height: 46px;
          background: linear-gradient(180deg, rgba(255, 214, 120, 0.28), rgba(255, 214, 120, 0.84));
          transform: translateX(-50%);
        }

        :global(.hanger-line::before) {
          content: "";
          position: absolute;
          left: 50%;
          top: -4px;
          width: 13px;
          height: 13px;
          border: 2px solid rgba(111, 32, 55, 0.34);
          border-radius: 50%;
          background: #ffd36f;
          box-shadow: inset 0 1px 2px rgba(91, 33, 44, 0.24);
          transform: translateX(-50%);
        }

        :global(.key-ring) {
          position: absolute;
          left: 50%;
          top: 0;
          width: 38px;
          height: 38px;
          border: 5px solid #ffd36f;
          border-radius: 50%;
          background: rgba(255, 246, 220, 0.14);
          box-shadow:
            inset 0 0 0 2px rgba(255, 250, 226, 0.42),
            0 6px 12px rgba(71, 20, 34, 0.22);
          transform: translateX(-50%);
        }

        :global(.key-body) {
          position: absolute;
          left: 50%;
          top: 43px;
          width: 34px;
          height: 78px;
          transform: translateX(-50%);
        }

        :global(.explore .key-body) {
          top: 40px;
          height: 86px;
        }

        :global(.key-head) {
          position: absolute;
          left: 3px;
          top: 0;
          width: 26px;
          height: 26px;
          border: 5px solid #ffd36f;
          border-radius: 50%;
          background: rgba(255, 248, 228, 0.22);
        }

        :global(.casual .key-head) {
          border-color: #93d9d8;
        }

        :global(.key-stem) {
          position: absolute;
          left: 15px;
          top: 28px;
          width: 7px;
          height: 43px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ffd36f, #b87522);
          box-shadow: inset 2px 0 0 rgba(255, 246, 209, 0.28);
        }

        :global(.casual .key-stem) {
          background: linear-gradient(180deg, #d9ffff, #0b9298);
        }

        :global(.key-teeth) {
          position: absolute;
          left: 15px;
          top: 64px;
          width: 23px;
          height: 14px;
          border-radius: 1px;
          background:
            linear-gradient(90deg, transparent 0 7px, currentColor 7px 13px, transparent 13px),
            linear-gradient(180deg, #b87522, #7e4d1c);
          clip-path: polygon(0 0, 100% 0, 100% 42%, 74% 42%, 74% 100%, 45% 100%, 45% 48%, 0 48%);
          color: rgba(91, 33, 44, 0.44);
        }

        :global(.casual .key-teeth) {
          background:
            linear-gradient(90deg, transparent 0 7px, currentColor 7px 13px, transparent 13px),
            linear-gradient(180deg, #0b9298, #086b73);
        }

        :global(.key-tag) {
          position: absolute;
          left: 50%;
          top: 78px;
          display: flex;
          min-width: 96px;
          min-height: 58px;
          flex-direction: column;
          justify-content: center;
          padding: 9px 10px;
          border: 1px solid rgba(91, 33, 44, 0.18);
          border-radius: 9px 9px 10px 3px;
          background:
            radial-gradient(circle at 8px 8px, rgba(255, 255, 255, 0.66) 0 2px, transparent 2.4px),
            #d9ffff;
          box-shadow: 0 10px 16px rgba(71, 20, 34, 0.18);
          text-align: left;
          transform: translateX(-50%) rotate(-3deg);
          transition:
            background var(--duration-object) var(--ease-object),
            transform var(--duration-object) var(--ease-object);
        }

        :global(.explore .key-tag) {
          border-radius: 9px 9px 3px 10px;
          background:
            radial-gradient(circle at 8px 8px, rgba(255, 255, 255, 0.5) 0 2px, transparent 2.4px),
            #ffd36f;
          transform: translateX(-50%) rotate(3deg);
        }

        :global(.keychain:hover .key-tag),
        :global(.keychain:focus-visible .key-tag) {
          transform: translateX(-50%) translateY(-2px) rotate(0deg);
        }

        :global(.key-tag span),
        :global(.key-tag small) {
          display: block;
        }

        :global(.key-tag span) {
          color: #3f1e25;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.16;
        }

        :global(.key-tag small) {
          margin-top: 5px;
          color: rgba(63, 30, 37, 0.72);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        :global(.key-note) {
          position: absolute;
          left: 50%;
          top: 149px;
          display: block;
          width: 180px;
          padding: 10px 12px;
          border: 1px solid rgba(91, 33, 44, 0.18);
          border-radius: 4px;
          background:
            radial-gradient(circle at 1px 1px, rgba(91, 33, 44, 0.06) 1px, transparent 1.4px),
            #fff4cf;
          background-size: 5px 5px;
          color: #67243a;
          font-size: 12px;
          line-height: 1.5;
          box-shadow: 0 12px 20px rgba(71, 20, 34, 0.18);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 8px) rotate(-1deg);
          transition:
            opacity var(--duration-fast) var(--ease-object),
            transform var(--duration-fast) var(--ease-object);
        }

        :global(.explore .key-note) {
          transform: translate(-50%, 8px) rotate(1deg);
        }

        :global(.key-note::before) {
          content: "";
          position: absolute;
          top: -7px;
          left: 50%;
          width: 20px;
          height: 14px;
          background: rgba(245, 103, 107, 0.72);
          transform: translateX(-50%) rotate(-2deg);
        }

        :global(.key-note span) {
          display: block;
        }

        :global(.keychain:hover .key-note),
        :global(.keychain:focus-visible .key-note) {
          opacity: 1;
          transform: translate(-50%, 0) rotate(-1deg);
        }

        :global(.explore:hover .key-note),
        :global(.explore:focus-visible .key-note) {
          transform: translate(-50%, 0) rotate(1deg);
        }

        /* The entry choices read as one fitted door mechanism, not loose notes. */
        .door-pulls {
          top: 77%;
        }

        .door-plate {
          top: 11.5%;
          width: min(30%, 166px);
          padding: 10px 14px 9px;
          border: 1px solid rgba(255, 224, 145, 0.82);
          border-radius: 7px 7px 11px 7px;
          background:
            linear-gradient(90deg, transparent 5px, rgba(103, 36, 58, 0.16) 5px 6px, transparent 6px calc(100% - 6px), rgba(103, 36, 58, 0.16) calc(100% - 6px) calc(100% - 5px), transparent calc(100% - 5px)),
            linear-gradient(145deg, #fff0bc, #e9b75d);
          transform: translateX(-50%);
          box-shadow:
            0 8px 14px rgba(71, 20, 34, 0.2),
            inset 0 0 0 3px rgba(255, 248, 215, 0.3);
        }

        .door-plate::before,
        .door-plate::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #98612a;
          box-shadow: inset 0 1px rgba(255, 235, 169, 0.72);
          transform: translateY(-50%);
        }

        .door-plate::before { left: 5px; }
        .door-plate::after { right: 5px; }

        .door-plate span {
          font-size: clamp(20px, 1.55vw, 27px);
          letter-spacing: 0;
        }

        .door-plate small {
          margin-top: 5px;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .mode-prompt {
          position: absolute;
          left: 50%;
          top: 27.5%;
          z-index: calc(var(--z-object) + 8);
          width: 68%;
          margin: 0;
          color: rgba(255, 241, 196, 0.88);
          font-size: clamp(10px, 0.85vw, 12px);
          font-weight: 700;
          line-height: 1.35;
          text-align: center;
          text-shadow: 0 1px 2px rgba(71, 20, 34, 0.5);
          transform: translateX(-50%);
        }

        :global(.keychain) {
          top: 33.5%;
          width: 36%;
          min-width: 118px;
          min-height: 210px;
          border-radius: 10px;
          transform: none;
        }

        :global(.keychain.casual) {
          left: 7%;
          top: 33.5%;
          transform: rotate(-1deg);
        }

        :global(.keychain.explore) {
          left: 57%;
          top: 34.5%;
          transform: rotate(1deg);
        }

        :global(.keychain:hover),
        :global(.keychain:focus-visible),
        :global(.keychain.is-selected) {
          filter: drop-shadow(0 12px 10px rgba(71, 20, 34, 0.2));
        }

        :global(.keychain.casual:hover),
        :global(.keychain.casual:focus-visible),
        :global(.keychain.casual.is-selected) {
          transform: translateY(-3px) rotate(-1.8deg);
        }

        :global(.keychain.explore:hover),
        :global(.keychain.explore:focus-visible),
        :global(.keychain.explore.is-selected) {
          transform: translateY(-3px) rotate(1.8deg);
        }

        :global(.keychain:disabled) {
          cursor: default;
        }

        :global(.keychain:disabled:not(.is-selected)) {
          opacity: 0.58;
          filter: saturate(0.72);
        }

        :global(.mode-plaque) {
          position: absolute;
          left: 50%;
          top: 0;
          display: grid;
          width: min(94%, 150px);
          min-height: 34px;
          place-items: center;
          padding: 6px 11px;
          border: 1px solid rgba(255, 220, 132, 0.72);
          border-radius: 4px 4px 8px 4px;
          background:
            linear-gradient(90deg, transparent 7px, rgba(255, 246, 213, 0.18) 7px 8px, transparent 8px),
            #743047;
          color: #fff0bd;
          box-shadow:
            0 5px 9px rgba(71, 20, 34, 0.22),
            inset 0 0 0 2px rgba(255, 214, 120, 0.09);
          transform: translateX(-50%);
          transition:
            background var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
        }

        :global(.explore .mode-plaque) {
          border-radius: 4px 4px 4px 8px;
          background:
            linear-gradient(90deg, transparent 7px, rgba(255, 246, 213, 0.18) 7px 8px, transparent 8px),
            #165f69;
        }

        :global(.mode-plaque strong) {
          font-size: clamp(11px, 0.95vw, 14px);
          line-height: 1.2;
        }

        :global(.keychain:hover .mode-plaque),
        :global(.keychain:focus-visible .mode-plaque),
        :global(.keychain.is-selected .mode-plaque) {
          background-color: #8b3c55;
          box-shadow:
            0 6px 11px rgba(71, 20, 34, 0.25),
            inset 0 0 0 2px rgba(255, 231, 160, 0.28);
        }

        :global(.hanger-line) {
          top: 35px;
          height: 33px;
        }

        :global(.hanger-line::before) {
          top: -1px;
          width: 10px;
          height: 10px;
        }

        :global(.key-ring) {
          top: 61px;
          width: 34px;
          height: 34px;
          border-width: 4px;
        }

        :global(.casual .key-ring) {
          border-color: #9fe0d9;
          background: rgba(220, 255, 247, 0.18);
        }

        :global(.explore .key-ring) {
          border-color: #f4c45e;
          border-radius: 8px;
          transform: translateX(-50%) rotate(45deg);
        }

        :global(.key-body) {
          top: 99px;
          height: 76px;
        }

        :global(.explore .key-body) {
          top: 97px;
          height: 82px;
        }

        :global(.key-head) {
          left: 2px;
          width: 29px;
          height: 29px;
          border-color: #8ed3ce;
          border-radius: 50%;
          background: rgba(222, 255, 248, 0.16);
        }

        :global(.explore .key-head) {
          border-color: #f4c45e;
          border-radius: 0;
          background: rgba(255, 224, 137, 0.14);
          clip-path: polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%);
        }

        :global(.key-collar) {
          position: absolute;
          left: 10px;
          top: 27px;
          width: 16px;
          height: 7px;
          border: 2px solid #0b9298;
          border-radius: 5px;
          background: #bfeee7;
        }

        :global(.explore .key-collar) {
          left: 8px;
          width: 20px;
          border-color: #9f6825;
          border-radius: 1px;
          background: #f4c45e;
        }

        :global(.key-stem) {
          top: 32px;
          background: linear-gradient(180deg, #d9ffff, #0b9298);
        }

        :global(.explore .key-stem) {
          top: 32px;
          width: 8px;
          height: 47px;
          background:
            linear-gradient(90deg, #9f6825 0 2px, #f9d77f 2px 6px, #9f6825 6px);
        }

        :global(.key-teeth) {
          top: 66px;
          background: linear-gradient(180deg, #0b9298, #086b73);
          clip-path: polygon(0 0, 100% 0, 100% 45%, 68% 45%, 68% 100%, 43% 100%, 43% 50%, 0 50%);
        }

        :global(.explore .key-teeth) {
          top: 69px;
          width: 27px;
          background: linear-gradient(180deg, #dba943, #8c581f);
          clip-path: polygon(0 0, 100% 0, 100% 38%, 78% 38%, 78% 100%, 57% 100%, 57% 55%, 34% 55%, 34% 100%, 12% 100%, 12% 42%, 0 42%);
        }

        :global(.key-charm) {
          position: absolute;
          left: calc(50% + 27px);
          top: 75px;
          width: 17px;
          height: 28px;
          border: 2px solid #ffd36f;
          border-radius: 50% 50% 55% 45%;
          background: #ef7180;
          box-shadow: 0 4px 7px rgba(71, 20, 34, 0.2);
          transform: rotate(10deg);
        }

        :global(.key-charm::before) {
          content: "";
          position: absolute;
          left: 50%;
          top: -13px;
          width: 1px;
          height: 13px;
          background: #ffd36f;
        }

        :global(.key-charm span) {
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(255, 244, 198, 0.72);
          border-radius: inherit;
        }

        :global(.explore .key-charm) {
          left: calc(50% + 29px);
          width: 21px;
          height: 21px;
          border-color: #f4c45e;
          border-radius: 2px;
          background: #176b72;
          transform: rotate(45deg);
        }

        :global(.explore .key-charm span) {
          inset: 4px;
          border-radius: 50%;
        }

        :global(.mobile-mode-note) {
          display: none;
        }

        .mode-detail {
          position: absolute;
          left: 50%;
          top: 68%;
          z-index: calc(var(--z-object) + 10);
          width: min(62%, 350px);
          min-height: 52px;
          padding: 9px 14px;
          border: 1px solid rgba(255, 221, 134, 0.52);
          border-radius: 5px;
          background: rgba(86, 31, 48, 0.9);
          color: #fff1c2;
          font-size: clamp(10px, 0.8vw, 12px);
          line-height: 1.45;
          text-align: center;
          box-shadow: 0 8px 15px rgba(71, 20, 34, 0.2);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 5px);
          transition:
            opacity var(--duration-fast) var(--ease-object),
            transform var(--duration-fast) var(--ease-object);
        }

        .mode-detail span {
          display: none;
        }

        .mode-detail strong {
          display: block;
          margin-bottom: 2px;
          color: #ffd36f;
        }

        :global(.keychain.casual:hover) ~ .mode-detail,
        :global(.keychain.casual:focus-visible) ~ .mode-detail,
        :global(.keychain.explore:hover) ~ .mode-detail,
        :global(.keychain.explore:focus-visible) ~ .mode-detail,
        :global(.keychain.is-selected) ~ .mode-detail {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        :global(.keychain.casual:hover) ~ .mode-detail .casual-copy,
        :global(.keychain.casual:focus-visible) ~ .mode-detail .casual-copy,
        :global(.keychain.casual.is-selected) ~ .mode-detail .casual-copy,
        :global(.keychain.explore:hover) ~ .mode-detail .explore-copy,
        :global(.keychain.explore:focus-visible) ~ .mode-detail .explore-copy,
        :global(.keychain.explore.is-selected) ~ .mode-detail .explore-copy {
          display: block;
        }

        /* Refine the mechanism so every part stays inside each upper door panel. */
        .leaf-panel.upper {
          top: 30%;
          height: 38%;
          border-radius: 34% 34% 8px 8px / 18% 18% 8px 8px;
        }

        .door-plate {
          top: 7.5%;
          width: min(25%, 145px);
          padding: 8px 12px 7px;
        }

        .door-plate span {
          font-size: clamp(19px, 1.4vw, 25px);
          white-space: nowrap;
        }

        .mode-prompt {
          top: 29.2%;
          width: min(46%, 280px);
          min-height: 30px;
          display: grid;
          place-items: center;
          padding: 5px 10px;
          border: 1px solid rgba(255, 221, 134, 0.42);
          border-radius: 4px;
          background: rgba(117, 43, 63, 0.94);
          color: #fff0bd;
          font-size: clamp(12px, 1vw, 14px);
          box-shadow: 0 5px 9px rgba(71, 20, 34, 0.18);
          text-shadow: none;
        }

        :global(.keychain) {
          top: 34%;
          width: 28%;
          min-width: 108px;
          min-height: 178px;
        }

        :global(.keychain.casual) {
          left: 9%;
          top: 34%;
        }

        :global(.keychain.explore) {
          left: 59%;
          top: 34.8%;
        }

        :global(.mode-plaque) {
          width: min(92%, 140px);
          min-height: 32px;
          padding: 5px 9px;
        }

        :global(.hanger-line) {
          top: 32px;
          height: 25px;
          width: 1px;
          background: linear-gradient(180deg, rgba(255, 225, 143, 0.48), #ffd36f);
        }

        :global(.hanger-line::before) {
          display: none;
        }

        :global(.key-ring),
        :global(.explore .key-ring) {
          z-index: 3;
          top: 51px;
          width: 18px;
          height: 18px;
          border: 2px solid #f4c45e;
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 2px 4px rgba(71, 20, 34, 0.18);
          transform: translateX(-50%);
        }

        :global(.key-body),
        :global(.explore .key-body) {
          z-index: 2;
          top: 67px;
          width: 34px;
          height: 68px;
        }

        :global(.key-head) {
          left: 3px;
          width: 28px;
          height: 28px;
        }

        :global(.key-head::before) {
          content: "";
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(224, 255, 248, 0.72);
          border-radius: inherit;
          background:
            repeating-conic-gradient(from 12deg, rgba(9, 108, 115, 0.45) 0 7deg, transparent 7deg 38deg);
        }

        :global(.explore .key-head::before) {
          inset: 5px;
          border-color: rgba(255, 239, 183, 0.82);
          border-radius: 1px;
          background:
            linear-gradient(45deg, transparent 43%, rgba(139, 86, 28, 0.42) 44% 56%, transparent 57%),
            linear-gradient(-45deg, transparent 43%, rgba(139, 86, 28, 0.42) 44% 56%, transparent 57%);
        }

        :global(.key-collar) {
          left: 9px;
          top: 26px;
          width: 16px;
          height: 6px;
        }

        :global(.explore .key-collar) {
          left: 8px;
          width: 18px;
        }

        :global(.key-stem),
        :global(.explore .key-stem) {
          left: 14px;
          top: 30px;
          width: 6px;
          height: 34px;
        }

        :global(.explore .key-stem) {
          background: linear-gradient(90deg, #9f6825 0 1px, #f9d77f 1px 5px, #9f6825 5px);
        }

        :global(.key-teeth) {
          left: 14px;
          top: 57px;
          width: 19px;
          height: 11px;
        }

        :global(.explore .key-teeth) {
          left: 14px;
          top: 57px;
          width: 22px;
          height: 11px;
        }

        :global(.key-charm),
        :global(.explore .key-charm) {
          z-index: 1;
          left: calc(50% - 34px);
          top: 54px;
          transform: rotate(-8deg);
        }

        :global(.key-charm::before) {
          left: auto;
          right: -17px;
          top: 2px;
          width: 19px;
          height: 1px;
          background: #ffd36f;
          transform: rotate(-25deg);
          transform-origin: right center;
        }

        :global(.explore .key-charm) {
          transform: rotate(37deg);
        }

        :global(.explore .key-charm::before) {
          right: -15px;
          top: -3px;
          width: 18px;
          transform: rotate(-58deg);
        }

        .mode-detail {
          left: 0;
          top: 56.5%;
          width: 100%;
          min-height: 48px;
          padding: 0;
          border: 0;
          background: transparent;
          box-shadow: none;
          transform: translateY(4px);
        }

        .mode-detail span {
          position: absolute;
          top: 0;
          width: 32%;
          min-height: 44px;
          padding: 7px 10px;
          border: 1px solid rgba(255, 221, 134, 0.5);
          border-radius: 4px;
          background: rgba(86, 31, 48, 0.91);
          box-shadow: 0 5px 10px rgba(71, 20, 34, 0.17);
        }

        .mode-detail .casual-copy { left: 11%; }
        .mode-detail .explore-copy { left: 61%; }

        :global(.keychain.casual:hover) ~ .mode-detail,
        :global(.keychain.casual:focus-visible) ~ .mode-detail,
        :global(.keychain.explore:hover) ~ .mode-detail,
        :global(.keychain.explore:focus-visible) ~ .mode-detail,
        :global(.keychain.is-selected) ~ .mode-detail {
          transform: translateY(0);
        }

        /* Final hierarchy: one centered vertical mechanism per door leaf. */
        .house-sign {
          position: absolute;
          left: 50%;
          top: clamp(-62px, -4.2vw, -48px);
          z-index: calc(var(--z-object) + 12);
          display: grid;
          width: clamp(164px, 19vw, 252px);
          min-height: clamp(42px, 3.7vw, 54px);
          place-items: center;
          padding: 8px 20px 7px;
          border: 2px solid rgba(255, 211, 111, 0.72);
          border-radius: 48% 48% 12px 12px / 42% 42% 12px 12px;
          background:
            repeating-linear-gradient(
              4deg,
              rgba(255, 255, 255, 0.035) 0 1px,
              transparent 1px 7px
            ),
            linear-gradient(180deg, #5a382d, #35231f);
          color: #fff8df;
          text-align: center;
          transform: translateX(-50%);
          box-shadow:
            0 7px 13px rgba(27, 22, 19, 0.28),
            inset 0 0 0 2px rgba(255, 243, 207, 0.09);
        }

        .house-sign span {
          display: block;
          font-family: "Segoe Print", "Bradley Hand", "FZShuTi", "STXingkai", "Microsoft YaHei UI", cursive;
          font-size: clamp(18px, 1.65vw, 25px);
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.015em;
          white-space: nowrap;
          text-shadow:
            0.4px 0 rgba(255, 255, 255, 0.52),
            -0.35px 0.45px rgba(255, 255, 255, 0.34),
            0 1px 1px rgba(0, 0, 0, 0.22);
          transform: rotate(-0.7deg);
        }

        .house-sign.zh span {
          font-size: clamp(17px, 1.5vw, 23px);
          font-family: "STXingkai", "FZShuTi", "Segoe Print", "Microsoft YaHei UI", cursive;
          font-weight: 400;
          letter-spacing: 0.055em;
          transform: rotate(-1.2deg);
        }

        .door-plate.en {
          width: min(24%, 142px);
        }

        .door-plate.zh {
          width: min(17%, 100px);
        }

        .door-plate.en span {
          padding-inline: 2px;
          font-size: clamp(17px, 1.25vw, 22px);
          letter-spacing: 0;
        }

        .frame-pattern.top {
          display: none;
        }

        .frame-pattern.left,
        .frame-pattern.right {
          opacity: 0.46;
        }

        .door-leaf::after {
          opacity: 0.42;
        }

        .leaf-panel {
          border-color: rgba(255, 214, 120, 0.27);
          background: rgba(111, 32, 55, 0.035);
          box-shadow: inset 0 0 0 4px rgba(111, 32, 55, 0.075);
        }

        .mode-prompt {
          width: min(48%, 300px);
          min-height: 30px;
          padding: 5px 10px;
          border-color: rgba(255, 224, 145, 0.24);
          background: rgba(194, 70, 87, 0.76);
          color: rgba(255, 246, 216, 0.96);
          font-size: clamp(15px, 1.15vw, 17px);
          font-weight: 700;
          box-shadow: none;
        }

        .leaf-panel.upper {
          left: 21%;
          right: 21%;
          top: 33%;
          height: 27%;
          border-color: rgba(255, 214, 120, 0.34);
          box-shadow: inset 0 0 0 4px rgba(111, 32, 55, 0.09);
        }

        :global(.keychain),
        :global(.keychain.casual),
        :global(.keychain.explore) {
          top: 35.5%;
          width: 30%;
          min-width: 112px;
          min-height: 158px;
          transform: translateX(-50%);
        }

        :global(.keychain.casual) { left: 25%; }
        :global(.keychain.explore) { left: 75%; }

        :global(.keychain.casual:hover),
        :global(.keychain.casual:focus-visible),
        :global(.keychain.casual.is-selected),
        :global(.keychain.explore:hover),
        :global(.keychain.explore:focus-visible),
        :global(.keychain.explore.is-selected) {
          transform: translate(-50%, -2px);
        }

        :global(.mode-plaque) {
          width: min(96%, 154px);
          min-height: 36px;
          padding: 6px 10px;
          border-radius: 4px 4px 6px 4px;
          transform: translateX(-50%);
        }

        :global(.explore .mode-plaque) {
          border-radius: 4px 4px 4px 6px;
        }

        :global(.mode-plaque strong) {
          font-size: clamp(15px, 1.2vw, 17px);
        }

        :global(.key-assembly) {
          position: absolute;
          inset: 0;
          opacity: 1;
          pointer-events: none;
          transform: translateY(0);
          transition:
            opacity var(--duration-fast) var(--ease-object),
            transform var(--duration-fast) var(--ease-object);
        }

        :global(.hanger-line) {
          top: 28px;
          height: 25px;
        }

        :global(.key-ring),
        :global(.explore .key-ring) {
          top: 51px;
          width: 15px;
          height: 25px;
          border-width: 2px;
          border-radius: 50%;
        }

        :global(.key-body),
        :global(.explore .key-body) {
          top: 73px;
          transform: translateX(-50%) scale(1.14);
          transform-origin: top center;
        }

        :global(.key-charm),
        :global(.explore .key-charm) {
          left: calc(50% - 31px);
          top: 59px;
        }

        :global(.mode-description) {
          position: absolute;
          left: 50%;
          top: 36px;
          display: flex;
          width: min(96%, 154px);
          min-height: 110px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 11px 10px;
          border: 1px solid rgba(139, 91, 39, 0.34);
          border-radius: 5px;
          background:
            radial-gradient(circle at 1px 1px, rgba(103, 36, 58, 0.055) 1px, transparent 1.3px),
            #fff0c8;
          background-size: 5px 5px, auto;
          color: #67243a;
          font-size: clamp(13.5px, 0.96vw, 14.5px);
          line-height: 1.35;
          text-align: center;
          box-shadow: 0 7px 12px rgba(71, 20, 34, 0.16);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 4px);
          transition:
            opacity var(--duration-fast) var(--ease-object),
            transform var(--duration-fast) var(--ease-object);
        }

        :global(.mode-description strong) {
          display: block;
          margin-bottom: 5px;
          color: #7d3850;
          font-size: clamp(15px, 1.04vw, 16px);
        }

        :global(.mode-description span) {
          display: block;
        }

        :global(.keychain:hover .key-assembly),
        :global(.keychain:focus-visible .key-assembly),
        :global(.keychain.is-selected .key-assembly) {
          opacity: 0;
          transform: translateY(3px);
        }

        :global(.keychain:hover .mode-description),
        :global(.keychain:focus-visible .mode-description),
        :global(.keychain.is-selected .mode-description) {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .door-pulls {
          top: 68%;
        }

        @media (max-width: 1180px) {
          .welcome-writing {
            left: clamp(24px, 4vw, 54px);
            width: clamp(285px, 32vw, 350px);
          }

        }

        @media (max-width: 900px) {
          .door-scene {
            left: 62%;
            width: clamp(430px, 64vw, 560px);
            height: clamp(560px, 82vh, 760px);
          }

          .welcome-writing {
            left: clamp(22px, 4vw, 44px);
            top: 72px;
            width: min(38vw, 320px);
          }

          .intro-copy {
            font-size: 12px;
          }

          .quick-music-pass {
            min-height: 70px;
            margin-top: 18px;
          }
        }

        @media (max-width: 800px) {
          .entrance-page {
            min-height: 100svh;
            overflow-y: auto;
          }

          .entrance-wall {
            display: flex;
            min-height: 100svh;
            flex-direction: column;
            overflow: clip;
          }

          .entrance-wall::before {
            inset: 10px;
          }

          .wall-ornament {
            display: none;
          }

          .welcome-writing {
            position: relative;
            left: auto;
            top: auto;
            z-index: calc(var(--z-object) + 6);
            width: auto;
            max-width: 100%;
            max-width: 520px;
            padding: 82px clamp(18px, 5.6vw, 22px) 0;
          }

          .house-kicker {
            font-size: 10px;
          }

          h1 {
            font-size: clamp(27px, 8vw, 38px);
          }

          .intro-copy {
            margin-top: 15px;
            font-size: 14px;
            line-height: 1.58;
          }

          .quick-music-pass {
            width: 100%;
            max-width: 430px;
            min-height: 64px;
            margin-top: 19px;
            grid-template-columns: 34px minmax(0, 1fr) 24px;
            column-gap: 8px;
            padding: 9px 10px;
          }

          .quick-music-pass::before {
            left: 51px;
          }

          .quick-music-pass::after {
            right: 33px;
          }

          .pass-note {
            width: 30px;
            height: 34px;
            font-size: 27px;
          }

          .door-scene {
            position: relative;
            left: auto;
            bottom: auto;
            width: min(89vw, 390px);
            height: clamp(400px, 62svh, 540px);
            margin: 72px auto 0;
            transform: none;
          }

          .house-sign {
            top: -54px;
          }

          .door-frame {
            padding: 22px clamp(15px, 4.5vw, 18px) 0;
          }

          .double-door {
            border-width: 4px;
          }

          .door-plate {
            top: 13%;
            width: 38%;
            padding: 11px 9px 9px;
          }

          .door-plate span {
            font-size: clamp(19px, 5.8vw, 25px);
          }

          .door-plate small {
            font-size: 9px;
          }

          .leaf-medallion {
            width: 52px;
          }

          .door-pulls {
            gap: 16px;
          }

          .door-pulls span {
            width: 14px;
            height: 44px;
          }

          :global(.keychain) {
            width: 84px;
            min-height: 124px;
          }

          :global(.keychain.casual) {
            left: 27%;
            top: 40%;
          }

          :global(.keychain.explore) {
            left: 73%;
            top: 43%;
          }

          :global(.hanger-line) {
            top: -27px;
            height: 36px;
          }

          :global(.key-ring) {
            width: 30px;
            height: 30px;
            border-width: 4px;
          }

          :global(.key-body) {
            top: 35px;
            transform: translateX(-50%) scale(0.86);
          }

          :global(.explore .key-body) {
            top: 33px;
          }

          :global(.key-tag) {
            top: 64px;
            min-width: 72px;
            min-height: 46px;
            padding: 7px;
          }

          :global(.key-tag span) {
            font-size: 11px;
          }

          :global(.key-tag small) {
            font-size: 9px;
          }

          :global(.key-note) {
            display: none;
          }

          .door-pulls {
            top: 78%;
          }

          .door-plate {
            top: 9.5%;
            width: 44%;
            padding: 8px 11px 7px;
          }

          .door-plate span {
            font-size: clamp(17px, 5.1vw, 22px);
            white-space: nowrap;
          }

          .mode-prompt {
            top: 26%;
            width: 88%;
            font-size: clamp(9px, 2.7vw, 11px);
          }

          :global(.keychain) {
            top: 31%;
            width: 42%;
            min-width: 0;
            min-height: 220px;
          }

          :global(.keychain.casual) {
            left: 5%;
            top: 31%;
          }

          :global(.keychain.explore) {
            left: 49%;
            top: 32%;
          }

          :global(.mode-plaque) {
            width: min(96%, 126px);
            min-height: 31px;
            padding: 5px 7px;
          }

          :global(.mode-plaque strong) {
            font-size: clamp(10px, 3vw, 12px);
          }

          :global(.hanger-line) {
            top: 55px;
            height: 28px;
          }

          :global(.key-ring) {
            top: 77px;
            width: 29px;
            height: 29px;
          }

          :global(.key-body),
          :global(.explore .key-body) {
            top: 109px;
            transform: translateX(-50%) scale(0.7);
            transform-origin: top center;
          }

          :global(.key-charm) {
            left: calc(50% + 22px);
            top: 89px;
            transform: rotate(10deg) scale(0.78);
          }

          :global(.explore .key-charm) {
            left: calc(50% + 23px);
            transform: rotate(45deg) scale(0.76);
          }

          :global(.mobile-mode-note) {
            position: absolute;
            left: 50%;
            top: 38px;
            display: block;
            width: 100%;
            color: rgba(255, 241, 196, 0.9);
            font-size: clamp(9px, 2.6vw, 11px);
            font-weight: 700;
            line-height: 1.35;
            text-align: center;
            text-shadow: 0 1px 2px rgba(71, 20, 34, 0.58);
            transform: translateX(-50%);
          }

          .mode-detail {
            display: none;
          }

          .leaf-panel.upper {
            top: 30%;
            height: 41%;
          }

          .door-plate {
            top: 5.5%;
            width: 36%;
            padding: 6px 8px 5px;
          }

          .door-plate span {
            font-size: clamp(16px, 4.8vw, 20px);
          }

          .door-plate small {
            margin-top: 3px;
            font-size: 8px;
          }

          .mode-prompt {
            top: 29.2%;
            width: min(64%, 218px);
            min-height: 27px;
            padding: 4px 7px;
            font-size: clamp(10px, 2.9vw, 11px);
          }

          :global(.keychain) {
            top: 35.5%;
            width: 34%;
            min-height: 170px;
          }

          :global(.keychain.casual) {
            left: 14%;
            top: 35.5%;
          }

          :global(.keychain.explore) {
            left: 52%;
            top: 36.5%;
          }

          :global(.mode-plaque) {
            width: min(96%, 110px);
            min-height: 28px;
            padding: 4px 6px;
          }

          :global(.mode-plaque strong) {
            font-size: clamp(9px, 2.7vw, 11px);
          }

          :global(.hanger-line) {
            top: 49px;
            height: 24px;
          }

          :global(.key-ring),
          :global(.explore .key-ring) {
            top: 67px;
            width: 15px;
            height: 15px;
          }

          :global(.key-body),
          :global(.explore .key-body) {
            top: 81px;
            transform: translateX(-50%) scale(0.65);
          }

          :global(.key-charm),
          :global(.explore .key-charm) {
            left: calc(50% - 28px);
            top: 69px;
            transform: rotate(-8deg) scale(0.7);
          }

          :global(.explore .key-charm) {
            transform: rotate(37deg) scale(0.68);
          }

          :global(.mobile-mode-note) {
            top: 31px;
            font-size: clamp(8px, 2.35vw, 10px);
          }

          .door-plate.en {
            width: 36%;
          }

          .door-plate.zh {
            width: 25%;
          }

          .door-plate.en span {
            font-size: clamp(15px, 4.3vw, 18px);
          }

          .mode-prompt {
            top: 30%;
            width: min(58%, 194px);
            min-height: 22px;
            padding: 3px 6px;
            background: rgba(194, 70, 87, 0.72);
            font-size: clamp(8px, 2.35vw, 9px);
          }

          .leaf-panel.upper {
            left: 23%;
            right: 23%;
            top: 33%;
            height: 27%;
          }

          .door-pulls {
            top: 69%;
          }

          :global(.keychain),
          :global(.keychain.casual),
          :global(.keychain.explore) {
            top: 37%;
            width: 27%;
            min-width: 0;
            min-height: 140px;
            transform: translateX(-50%);
          }

          :global(.keychain.casual) { left: 25%; }
          :global(.keychain.explore) { left: 75%; }

          :global(.keychain.casual:hover),
          :global(.keychain.casual:focus-visible),
          :global(.keychain.casual.is-selected),
          :global(.keychain.explore:hover),
          :global(.keychain.explore:focus-visible),
          :global(.keychain.explore.is-selected) {
            transform: translateX(-50%);
          }

          :global(.mode-plaque) {
            width: min(96%, 92px);
            min-height: 25px;
            padding: 3px 5px;
          }

          :global(.mode-plaque strong) {
            font-size: clamp(8px, 2.4vw, 9px);
          }

          :global(.mobile-mode-note) {
            top: 27px;
            font-size: clamp(7.5px, 2.2vw, 9px);
          }

          :global(.key-assembly),
          :global(.keychain:hover .key-assembly),
          :global(.keychain:focus-visible .key-assembly),
          :global(.keychain.is-selected .key-assembly) {
            opacity: 1;
            transform: translateY(-12px);
          }

          :global(.hanger-line) {
            top: 41px;
            height: 23px;
          }

          :global(.key-ring),
          :global(.explore .key-ring) {
            top: 58px;
            width: 11px;
            height: 18px;
          }

          :global(.key-body),
          :global(.explore .key-body) {
            top: 73px;
            transform: translateX(-50%) scale(0.58);
          }

          :global(.key-charm),
          :global(.explore .key-charm) {
            left: calc(50% - 24px);
            top: 61px;
            transform: rotate(-8deg) scale(0.6);
          }

          :global(.explore .key-charm) {
            transform: rotate(37deg) scale(0.58);
          }

          :global(.mode-description) {
            display: none;
          }
        }

      `}</style>
    </main>
  );
}
