"use client";

import type { DoorTheme } from "@/types";

export type DoorState = "open" | "locked" | "under-construction";

type RoomDoorProps = {
  theme: DoorTheme;
  title: string;
  state: DoorState;
  stateLabel: string;
  ariaLabel: string;
  onActivate: () => void;
};

function MusicDoorDetails({ locked }: { locked: boolean }) {
  return (
    <>
      <span className="music-portal-shadow" aria-hidden="true" />
      <span className="music-fanlight" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>
      <span className="music-panel panel-high" aria-hidden="true">
        <i /><i />
      </span>
      <span className="music-panel panel-low" aria-hidden="true">
        <i /><i />
      </span>
      <span className="music-mail-slot" aria-hidden="true"><i /></span>
      <span className="music-house-number" aria-hidden="true">07</span>
      <span className="music-score-tile" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="music-lantern" aria-hidden="true">
        <i /><b />
      </span>
      <svg
        className="music-garden-vine"
        viewBox="0 0 420 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="vine-main" d="M42 612 C54 525 25 465 54 383 C76 322 48 270 73 205 C94 151 125 112 177 87 C229 62 267 77 309 54 C334 40 355 23 373 2" />
        <path d="M56 402 C92 386 112 357 111 324 C88 337 69 319 75 294" />
        <path d="M74 209 C106 221 137 205 150 176 C122 180 105 158 118 135" />
        <path d="M177 87 C204 110 237 112 263 93 C244 84 239 65 249 48" />
        <path d="M309 54 C330 78 358 83 383 70" />
        <circle cx="86" cy="282" r="7" />
        <circle cx="98" cy="274" r="6" />
        <circle cx="92" cy="292" r="6" />
        <circle cx="139" cy="158" r="7" />
        <circle cx="151" cy="151" r="6" />
        <circle cx="145" cy="168" r="5" />
        <circle cx="319" cy="48" r="7" />
        <circle cx="332" cy="42" r="5" />
      </svg>
      <span className="music-pot pot-left" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="music-pot pot-right" aria-hidden="true">
        <i /><i />
      </span>
      <span className="music-threshold" aria-hidden="true" />
      <span className="music-doormat" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="music-handle" aria-hidden="true">
        <span />
      </span>
      {locked && (
        <span className="melody-mechanism" aria-hidden="true">
          <span className="mechanism-line" />
          <span className="mechanism-dots">
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
      )}
    </>
  );
}

function StoryDoorDetails() {
  return (
    <>
      <span className="story-canvas" aria-hidden="true">
        <i />
      </span>
      <span className="story-panel panel-a" aria-hidden="true" />
      <span className="story-panel panel-b" aria-hidden="true" />
      <svg className="story-drawing" viewBox="0 0 320 620" aria-hidden="true">
        <path className="story-path" d="M30 538 C69 500 48 458 100 426 C151 395 124 353 171 320 C211 292 194 255 241 226 C267 210 275 178 252 156" />
        <path className="story-path-shadow" d="M37 545 C74 508 57 468 106 438 C156 408 137 365 180 336" />
        <path className="story-cloud" d="M56 173 C42 145 72 126 93 143 C101 113 145 119 144 150 C174 144 183 182 155 194 L74 194 C56 193 46 182 56 173Z" />
        <path className="story-figure" d="M213 436 C203 414 221 399 237 411 C249 389 280 408 265 430 C285 438 276 464 254 458 C244 480 214 466 222 447 C204 450 196 439 213 436Z" />
        <path className="story-pencil" d="M73 292 L132 239 L143 250 L84 304 Z M73 292 L69 309 L84 304" />
        <path className="story-bird" d="M202 190 C214 176 225 177 235 190 C245 175 257 177 268 190" />
        <path className="story-character" d="M108 371 C106 349 132 340 146 355 C162 337 188 353 181 376 C176 396 119 399 108 371 Z M128 368 L129 368 M160 367 L161 367" />
        <path className="story-grass" d="M49 535 C45 516 47 503 51 489 M50 520 C39 510 34 502 31 491 M51 512 C60 502 66 490 67 480" />
      </svg>
      <span className="story-page page-one" aria-hidden="true" />
      <span className="story-page page-two" aria-hidden="true" />
      <span className="story-page page-three" aria-hidden="true" />
      <span className="story-tape" aria-hidden="true" />
      <span className="story-binding" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="story-paint-mark" aria-hidden="true" />
      <span className="story-page-number" aria-hidden="true">17</span>
      <span className="story-handle" aria-hidden="true">
        <span />
      </span>
    </>
  );
}

function CSRoomDoorDetails() {
  const particles = Array.from({ length: 20 }, (_, index) => index);

  return (
    <>
      <span className="cs-module module-top" aria-hidden="true" />
      <span className="cs-module module-main" aria-hidden="true" />
      <span className="cs-module module-raised" aria-hidden="true" />
      <span className="cs-module module-floating" aria-hidden="true" />
      <span className="cs-frosted" aria-hidden="true">
        <span />
      </span>
      <span className="cs-hologram-zone" aria-hidden="true">
        <i />
        <i />
      </span>
      <svg className="cs-circuit" viewBox="0 0 320 620" aria-hidden="true">
        <path d="M52 442 H116 V386 H182 V332 H246" />
        <path d="M93 516 V471 H165 V431 H239 V390" />
        <circle cx="52" cy="442" r="4" />
        <circle cx="116" cy="386" r="4" />
        <circle cx="182" cy="332" r="4" />
        <circle cx="246" cy="332" r="4" />
        <circle cx="93" cy="516" r="4" />
        <circle cx="239" cy="390" r="4" />
      </svg>
      <span className="cs-seam seam-one" aria-hidden="true" />
      <span className="cs-seam seam-two" aria-hidden="true" />
      <span className="cs-dissolve-edge" aria-hidden="true" />
      <span className="cs-handle" aria-hidden="true">
        <span />
      </span>
      <span className="cs-particles" aria-hidden="true">
        {particles.map((particle) => (
          <i key={particle} />
        ))}
      </span>
      <span className="cs-work-order" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </>
  );
}

export default function RoomDoor({
  theme,
  title,
  state,
  stateLabel,
  ariaLabel,
  onActivate,
}: RoomDoorProps) {
  return (
    <div className={`door-object ${theme}-object is-${state}`}>
      <span className="door-contact-shadow" aria-hidden="true" />
      <button
        className="room-door"
        type="button"
        onClick={onActivate}
        aria-label={ariaLabel}
        data-door-theme={theme}
        data-door-state={state}
      >
        <span className="door-frame" aria-hidden="true" />
        <span className="door-surface" aria-hidden="true" />

        <span className="door-nameplate">
          <strong>{title}</strong>
        </span>

        {theme === "music" && (
          <MusicDoorDetails locked={state === "locked"} />
        )}
        {theme === "story" && <StoryDoorDetails />}
        {theme === "cs" && <CSRoomDoorDetails />}

        {state !== "open" && (
          <span className="door-state-label">{stateLabel}</span>
        )}
        <span className="door-gap" aria-hidden="true" />
      </button>

      <style jsx>{`
        .door-object {
          --door-frame-dark: #76502f;
          --door-frame-light: #d8ad72;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 420px;
          isolation: isolate;
        }

        .room-door {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--house-ink);
          cursor: pointer;
          isolation: isolate;
          filter: drop-shadow(10px 15px 16px rgba(70, 44, 26, 0.19));
          transition: filter var(--duration-object) var(--ease-object);
        }

        .room-door:hover {
          filter: drop-shadow(12px 17px 18px rgba(70, 44, 26, 0.24));
        }

        .room-door:active {
          filter: drop-shadow(6px 9px 10px rgba(70, 44, 26, 0.2));
        }

        .room-door:focus-visible {
          outline-offset: 7px !important;
        }

        .door-frame,
        .door-surface,
        .door-gap,
        .door-contact-shadow {
          position: absolute;
          display: block;
          pointer-events: none;
        }

        .door-frame {
          inset: 0;
          z-index: var(--z-object);
        }

        .door-surface {
          z-index: calc(var(--z-object) + 1);
        }

        .door-contact-shadow {
          left: 5%;
          right: -5%;
          bottom: -12px;
          z-index: var(--z-scene);
          height: 24px;
          border-radius: 50%;
          background: rgba(58, 37, 24, 0.23);
          filter: blur(9px);
        }

        .door-gap {
          z-index: calc(var(--z-object) + 3);
          background: rgba(76, 42, 23, 0.36);
          transition:
            background var(--duration-object) var(--ease-object),
            box-shadow var(--duration-object) var(--ease-object);
        }

        .is-open .room-door:hover .door-gap {
          background: rgba(255, 213, 125, 0.7);
          box-shadow: 0 0 13px rgba(255, 204, 102, 0.52);
        }

        .door-nameplate,
        .door-state-label {
          position: absolute;
          z-index: calc(var(--z-object) + 7);
          box-sizing: border-box;
          max-width: 72%;
          pointer-events: none;
        }

        .door-nameplate strong {
          display: block;
          overflow-wrap: anywhere;
          font-family: var(--font-display);
          font-size: clamp(18px, 2.2vw, 28px);
          line-height: 1.12;
          text-align: center;
        }

        .door-state-label {
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          line-height: 1.25;
          text-align: center;
          text-transform: uppercase;
        }

        .music-object .room-door {
          filter: drop-shadow(12px 18px 20px rgba(82, 57, 31, 0.18));
        }

        .music-object .door-frame {
          inset: 1.5% 10% 2.5%;
          border: 1px solid rgba(143, 111, 66, 0.28);
          border-radius: 48% 48% 5px 5px / 16% 16% 5px 5px;
          background:
            linear-gradient(103deg, rgba(255, 255, 255, 0.72), transparent 22% 72%, rgba(131, 99, 56, 0.12)),
            repeating-linear-gradient(92deg, rgba(126, 97, 59, 0.035) 0 2px, transparent 2px 19px),
            #f4e8ce;
          box-shadow:
            inset 0 0 0 9px rgba(255, 251, 235, 0.58),
            inset 0 0 0 12px rgba(163, 129, 77, 0.13),
            0 10px 24px rgba(83, 58, 32, 0.12);
        }

        .music-object .door-surface {
          inset: 12% 19% 4%;
          border: 2px solid #a2711e;
          border-bottom: 0;
          border-radius: 47% 47% 2px 2px / 12% 12% 2px 2px;
          background:
            linear-gradient(100deg, rgba(255, 249, 194, 0.54), transparent 17% 72%, rgba(126, 75, 15, 0.16)),
            repeating-linear-gradient(89deg, rgba(123, 80, 20, 0.045) 0 1px, transparent 1px 18px),
            linear-gradient(180deg, #f8dc69 0%, #efc242 53%, #dca32d 100%);
          box-shadow:
            inset 8px 0 11px rgba(255, 247, 179, 0.24),
            inset -12px 0 15px rgba(112, 67, 13, 0.13),
            inset 0 -22px 25px rgba(118, 69, 15, 0.09),
            0 4px 0 rgba(111, 71, 22, 0.16);
        }

        .music-object .door-gap {
          right: 19%;
          bottom: 4%;
          width: 3px;
          height: 69%;
          background: rgba(67, 49, 28, 0.56);
        }

        .music-object .door-nameplate {
          left: 50%;
          top: 34%;
          width: 41%;
          padding: 8px 10px 7px;
          border: 1px solid #285d67;
          border-radius: 3px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.62), transparent 48%),
            #e8f0df;
          box-shadow:
            3px 5px 0 rgba(79, 70, 42, 0.12),
            inset 0 0 0 3px rgba(255, 255, 255, 0.42);
          color: #214f57;
          transform: translateX(-50%);
        }

        .music-object .door-nameplate strong {
          font-family: var(--font-label);
          font-size: clamp(14px, 1.55vw, 20px);
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        :global(.music-portal-shadow) {
          position: absolute;
          left: 50%;
          bottom: 3.5%;
          z-index: var(--z-scene);
          width: 64%;
          height: 24px;
          border-radius: 50%;
          background: rgba(69, 49, 28, 0.2);
          filter: blur(8px);
          transform: translateX(-50%);
          pointer-events: none;
        }

        :global(.music-fanlight) {
          position: absolute;
          left: 24%;
          top: 15.2%;
          z-index: calc(var(--z-object) + 5);
          width: 52%;
          height: 13%;
          overflow: hidden;
          border: 2px solid #9a6a1d;
          border-bottom-width: 4px;
          border-radius: 50% 50% 3px 3px / 92% 92% 3px 3px;
          background:
            radial-gradient(circle at 50% 100%, rgba(250, 224, 125, 0.78), transparent 49%),
            linear-gradient(180deg, rgba(139, 193, 194, 0.82), rgba(226, 239, 214, 0.88));
          box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.48);
          pointer-events: none;
        }

        :global(.music-fanlight i) {
          position: absolute;
          left: 50%;
          bottom: -3px;
          width: 2px;
          height: 108%;
          background: rgba(77, 82, 62, 0.42);
          transform-origin: 50% 100%;
        }

        :global(.music-fanlight i:nth-child(1)) { transform: rotate(-58deg); }
        :global(.music-fanlight i:nth-child(2)) { transform: rotate(-30deg); }
        :global(.music-fanlight i:nth-child(3)) { transform: rotate(0deg); }
        :global(.music-fanlight i:nth-child(4)) { transform: rotate(30deg); }
        :global(.music-fanlight i:nth-child(5)) { transform: rotate(58deg); }

        :global(.music-panel) {
          position: absolute;
          left: 27%;
          z-index: calc(var(--z-object) + 3);
          width: 46%;
          border: 2px solid rgba(126, 79, 22, 0.45);
          border-radius: 4px;
          box-shadow:
            inset 0 0 0 5px rgba(255, 239, 154, 0.15),
            inset 2px 3px 8px rgba(110, 65, 13, 0.08);
          pointer-events: none;
        }

        :global(.music-panel.panel-high) { top: 44%; height: 18%; }
        :global(.music-panel.panel-low) { top: 67%; height: 21%; }

        :global(.music-panel i) {
          position: absolute;
          top: 12%;
          bottom: 12%;
          width: 35%;
          border: 1px solid rgba(130, 83, 23, 0.27);
          border-radius: 2px;
        }

        :global(.music-panel i:first-child) { left: 9%; }
        :global(.music-panel i:last-child) { right: 9%; }

        :global(.music-mail-slot) {
          position: absolute;
          left: 40%;
          top: 58%;
          z-index: calc(var(--z-object) + 6);
          width: 20%;
          height: 15px;
          border: 2px solid #4d4538;
          border-radius: 8px;
          background: linear-gradient(180deg, #3a3731, #171a18);
          box-shadow: 1px 3px 5px rgba(62, 45, 26, 0.25);
          pointer-events: none;
        }

        :global(.music-mail-slot i) {
          position: absolute;
          inset: 3px 7px;
          border-top: 1px solid rgba(241, 211, 119, 0.38);
        }

        :global(.music-house-number) {
          position: absolute;
          left: 50%;
          top: 29%;
          z-index: calc(var(--z-object) + 6);
          color: rgba(56, 62, 48, 0.8);
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          transform: translateX(-50%);
          pointer-events: none;
        }

        :global(.music-score-tile) {
          position: absolute;
          right: 7%;
          top: 42%;
          z-index: calc(var(--z-object) + 7);
          width: 44px;
          height: 58px;
          border: 2px solid #2a7581;
          border-radius: 4px;
          background:
            linear-gradient(90deg, transparent 48%, rgba(32, 103, 116, 0.13) 49% 51%, transparent 52%),
            #f5f0da;
          box-shadow: 3px 5px 8px rgba(66, 57, 36, 0.14);
          pointer-events: none;
        }

        :global(.music-score-tile i) {
          position: absolute;
          left: 8px;
          right: 8px;
          height: 1px;
          border-radius: 50%;
          background: #2a7581;
        }

        :global(.music-score-tile i:nth-child(1)) { top: 20px; transform: rotate(-4deg); }
        :global(.music-score-tile i:nth-child(2)) { top: 29px; transform: rotate(3deg); }
        :global(.music-score-tile i:nth-child(3)) { top: 38px; transform: rotate(-2deg); }

        :global(.music-lantern) {
          position: absolute;
          left: 5%;
          top: 29%;
          z-index: calc(var(--z-object) + 7);
          width: 46px;
          height: 74px;
          border: 3px solid #30322d;
          border-radius: 5px 5px 9px 9px;
          background: rgba(255, 235, 164, 0.52);
          box-shadow:
            inset 0 0 14px rgba(255, 218, 104, 0.52),
            3px 7px 12px rgba(71, 52, 31, 0.2);
          pointer-events: none;
        }

        :global(.music-lantern)::before {
          position: absolute;
          left: 50%;
          top: -22px;
          width: 28px;
          height: 22px;
          border-top: 4px solid #30322d;
          border-left: 4px solid #30322d;
          border-radius: 8px 0 0;
          content: "";
          transform: translateX(-4px);
        }

        :global(.music-lantern i) {
          position: absolute;
          left: 50%;
          top: 10px;
          width: 2px;
          height: 48px;
          background: rgba(42, 47, 42, 0.65);
        }

        :global(.music-lantern b) {
          position: absolute;
          left: 8px;
          right: 8px;
          top: 34px;
          height: 2px;
          background: rgba(42, 47, 42, 0.65);
        }

        :global(.music-garden-vine) {
          position: absolute;
          inset: -2% 0 0 0;
          z-index: calc(var(--z-object) + 5);
          width: 100%;
          height: 96%;
          overflow: visible;
          fill: #f2c94c;
          stroke: #78a15b;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 3.5;
          filter: drop-shadow(2px 4px 2px rgba(60, 81, 43, 0.13));
          pointer-events: none;
          transition: filter var(--duration-object) var(--ease-object);
        }

        :global(.music-garden-vine path) { fill: none; }
        :global(.music-garden-vine .vine-main) { stroke-width: 5; }

        .music-object .room-door:hover :global(.music-garden-vine) {
          filter: brightness(1.05) drop-shadow(2px 4px 2px rgba(60, 81, 43, 0.16));
        }

        :global(.music-pot) {
          position: absolute;
          bottom: 4%;
          z-index: calc(var(--z-object) + 7);
          width: 78px;
          height: 69px;
          border-radius: 8px 8px 24px 24px;
          background:
            linear-gradient(90deg, rgba(255, 221, 177, 0.28), transparent 25% 72%, rgba(98, 50, 29, 0.12)),
            #c97950;
          box-shadow:
            3px 5px 8px rgba(76, 49, 30, 0.17),
            0 5px 0 -3px rgba(76, 49, 30, 0.24);
          pointer-events: none;
        }

        :global(.music-pot)::before {
          position: absolute;
          left: -5px;
          right: -5px;
          top: -8px;
          height: 15px;
          border-radius: 5px;
          background: #d68b5d;
          box-shadow: inset 0 -3px 0 rgba(103, 53, 31, 0.14);
          content: "";
        }

        :global(.music-pot.pot-left) { left: 0; }
        :global(.music-pot.pot-right) { right: 0; width: 66px; height: 58px; }

        :global(.music-pot i) {
          position: absolute;
          left: 50%;
          bottom: 54px;
          width: 23px;
          height: 54px;
          border-radius: 100% 0 100% 0;
          background: linear-gradient(135deg, #9abd72, #527747);
          transform-origin: 50% 100%;
        }

        :global(.music-pot i:nth-child(1)) { transform: rotate(-39deg); }
        :global(.music-pot i:nth-child(2)) { transform: translateX(-50%) scale(0.92); }
        :global(.music-pot i:nth-child(3)) { transform: rotate(42deg) translateX(-12px); }
        :global(.music-pot.pot-right i) { bottom: 46px; width: 19px; height: 43px; }

        :global(.music-threshold) {
          position: absolute;
          left: 50%;
          bottom: 2.4%;
          z-index: calc(var(--z-object) + 6);
          width: 70%;
          height: 18px;
          border: 1px solid rgba(100, 78, 51, 0.32);
          border-radius: 3px;
          background: linear-gradient(180deg, #e7ddc7, #bca98b);
          box-shadow: 0 6px 7px rgba(65, 48, 31, 0.18);
          transform: translateX(-50%);
          pointer-events: none;
        }

        :global(.music-doormat) {
          position: absolute;
          left: 50%;
          bottom: -0.6%;
          z-index: calc(var(--z-object) + 8);
          width: 38%;
          height: 30px;
          border: 2px solid #285f66;
          border-radius: 50% 50% 3px 3px / 35% 35% 3px 3px;
          background: #d5bf82;
          box-shadow: 2px 5px 6px rgba(67, 52, 33, 0.15);
          transform: translateX(-50%);
          pointer-events: none;
        }

        :global(.music-doormat i) {
          position: absolute;
          top: 12px;
          width: 18%;
          height: 2px;
          border-radius: 50%;
          background: rgba(38, 93, 100, 0.7);
        }

        :global(.music-doormat i:nth-child(1)) { left: 18%; transform: rotate(7deg); }
        :global(.music-doormat i:nth-child(2)) { left: 41%; }
        :global(.music-doormat i:nth-child(3)) { right: 18%; transform: rotate(-7deg); }

        :global(.music-handle) {
          position: absolute;
          right: 24%;
          top: 54%;
          z-index: calc(var(--z-object) + 9);
          width: 23px;
          height: 66px;
          border: 3px solid #30322d;
          border-radius: 14px 14px 20px 20px;
          background: linear-gradient(90deg, #20231f, #5b5d52 48%, #171a17);
          box-shadow:
            inset 1px 0 rgba(255, 255, 255, 0.1),
            2px 5px 7px rgba(71, 48, 24, 0.24);
          transition: filter var(--duration-fast) var(--ease-object);
          pointer-events: none;
        }

        :global(.music-handle span) {
          position: absolute;
          left: 50%;
          top: 8px;
          width: 9px;
          height: 9px;
          border: 2px solid #1c1f1b;
          border-radius: 50%;
          background: #d5a842;
          transform: translateX(-50%);
        }

        .music-object .room-door:hover :global(.music-handle) {
          filter: brightness(1.08);
        }

        :global(.melody-mechanism) {
          position: absolute;
          right: calc(24% - 10px);
          top: 45.5%;
          z-index: calc(var(--z-object) + 9);
          width: 44px;
          height: 48px;
          border: 2px solid #242722;
          border-radius: 7px 7px 10px 10px;
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.07), transparent 28% 75%, rgba(0, 0, 0, 0.2)),
            #3e433b;
          box-shadow:
            inset 0 0 0 2px rgba(181, 164, 108, 0.14),
            2px 5px 7px rgba(71, 48, 24, 0.23);
          pointer-events: none;
        }

        :global(.melody-mechanism)::after {
          position: absolute;
          left: 50%;
          bottom: -6px;
          width: 13px;
          height: 7px;
          border: 2px solid #242722;
          border-top: 0;
          border-radius: 0 0 7px 7px;
          background: #41463e;
          content: "";
          transform: translateX(-50%);
        }

        :global(.mechanism-line) {
          position: absolute;
          left: 8px;
          right: 8px;
          top: 10px;
          height: 7px;
          border: 1px solid rgba(16, 20, 17, 0.86);
          border-radius: 4px;
          background: linear-gradient(180deg, #1c2521, #10201e);
          box-shadow: inset 0 1px rgba(117, 174, 157, 0.22);
        }

        :global(.mechanism-dots) {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 9px;
          display: flex;
          justify-content: space-between;
        }

        :global(.mechanism-dots i) {
          width: 5px;
          height: 5px;
          border: 1px solid #181c18;
          border-radius: 50%;
          background: #d4b452;
          box-shadow: 0 0 0 1px rgba(232, 211, 138, 0.12);
        }

        .music-object .door-state-label {
          right: calc(24% - 28px);
          top: 41.5%;
          width: 80px;
          color: #343b35;
          font-size: 9px;
          letter-spacing: 0.04em;
        }

        .story-object {
          transform: rotate(-0.25deg);
        }

        .story-object .door-frame {
          inset: 2px 4px 0 0;
          border-radius: 8px 4px 4px 6px;
          background:
            linear-gradient(90deg, rgba(255, 245, 237, 0.44), transparent 12% 87%, rgba(95, 50, 64, 0.16)),
            linear-gradient(180deg, #c47c92, #925169);
          clip-path: polygon(2% 1%, 98% 0, 100% 99%, 1% 100%, 0 17%);
          box-shadow: inset 8px 6px 0 rgba(255, 221, 225, 0.24);
        }

        .story-object .door-surface {
          inset: 18px 21px 0 18px;
          border: 2px solid #8c4b62;
          border-bottom: 0;
          border-radius: 4px 7px 2px 5px;
          background:
            radial-gradient(ellipse at 31% 42%, rgba(255, 240, 235, 0.36), transparent 36%),
            linear-gradient(97deg, rgba(255, 250, 246, 0.42), transparent 22% 68%, rgba(107, 55, 72, 0.16)),
            linear-gradient(180deg, transparent 0 61%, rgba(132, 70, 92, 0.08) 61% 62%, transparent 62%),
            repeating-linear-gradient(0deg, transparent 0 46px, rgba(128, 73, 90, 0.045) 46px 47px),
            linear-gradient(180deg, #f7c8d0 0%, #eba9b9 54%, #d98fa3 100%);
          box-shadow:
            inset 9px 0 12px rgba(255, 241, 238, 0.18),
            inset -12px 0 18px rgba(113, 57, 76, 0.11),
            inset 0 -17px 22px rgba(119, 59, 80, 0.07);
        }

        .story-object .door-gap {
          left: 18px;
          right: 21px;
          bottom: 0;
          height: 4px;
        }

        .story-object .door-nameplate {
          left: 14%;
          top: 12%;
          width: 62%;
          padding: 14px 15px 12px;
          border: 1px solid #9b6072;
          background:
            linear-gradient(90deg, transparent 0 11px, rgba(104, 74, 57, 0.09) 11px 12px),
            #fff5ec;
          box-shadow: 5px 7px 0 rgba(116, 65, 82, 0.13);
          transform: rotate(-2.2deg);
        }

        .story-object .door-nameplate::before {
          position: absolute;
          inset: -5px 48% -5px auto;
          width: 1px;
          background: rgba(132, 79, 93, 0.18);
          box-shadow: 2px 0 0 rgba(255, 255, 255, 0.52);
          content: "";
          transform: rotate(2deg);
        }

        .story-object .door-nameplate::after {
          position: absolute;
          right: 10px;
          bottom: 5px;
          width: 22px;
          height: 9px;
          border-bottom: 1px solid rgba(132, 79, 93, 0.27);
          border-radius: 50%;
          content: "";
        }

        :global(.story-canvas) {
          position: absolute;
          left: 13%;
          top: 27%;
          z-index: calc(var(--z-object) + 3);
          width: 69%;
          height: 57%;
          border: 1px solid rgba(148, 91, 107, 0.23);
          background:
            linear-gradient(96deg, rgba(255, 251, 244, 0.56), rgba(255, 239, 232, 0.24)),
            repeating-linear-gradient(0deg, transparent 0 28px, rgba(117, 83, 75, 0.045) 28px 29px);
          box-shadow:
            5px 8px 0 rgba(125, 66, 86, 0.08),
            inset 0 0 0 5px rgba(255, 255, 255, 0.12);
          clip-path: polygon(2% 0, 97% 2%, 100% 92%, 92% 100%, 0 97%);
          transform: rotate(0.8deg);
          pointer-events: none;
        }

        :global(.story-canvas i) {
          position: absolute;
          right: -1px;
          bottom: -1px;
          width: 42px;
          height: 39px;
          background: linear-gradient(135deg, rgba(217, 143, 163, 0.16) 0 49%, #fff7ec 50%);
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }

        :global(.story-panel) {
          position: absolute;
          z-index: calc(var(--z-object) + 2);
          border: 2px solid rgba(140, 75, 98, 0.32);
          pointer-events: none;
        }

        :global(.story-panel.panel-a) {
          left: 15%;
          top: 35%;
          width: 52%;
          height: 23%;
          border-radius: 50% 7px 46% 5px / 18% 6px 20% 5px;
          transform: rotate(1.5deg);
        }

        :global(.story-panel.panel-b) {
          left: 28%;
          top: 63%;
          width: 55%;
          height: 25%;
          border-radius: 5px 38% 6px 40% / 5px 14% 6px 16%;
          transform: rotate(-1deg);
        }

        :global(.story-drawing) {
          position: absolute;
          inset: 2% 3% 1%;
          z-index: calc(var(--z-object) + 5);
          width: 94%;
          height: 96%;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
        }

        :global(.story-path) { stroke: #79596a; stroke-width: 3.4; stroke-dasharray: 8 7; }
        :global(.story-path-shadow) { stroke: rgba(211, 122, 145, 0.5); stroke-width: 8; opacity: 0.22; }
        :global(.story-cloud) { fill: rgba(255, 247, 238, 0.62); stroke: #9c7180; stroke-width: 2.5; }
        :global(.story-figure) { fill: rgba(224, 177, 96, 0.34); stroke: #a26c4c; stroke-width: 2.5; }
        :global(.story-pencil) { fill: rgba(236, 199, 103, 0.44); stroke: #8b6558; stroke-width: 2; }
        :global(.story-bird) { stroke: #71899a; stroke-width: 2.3; }
        :global(.story-character) { fill: rgba(245, 229, 218, 0.42); stroke: #8c6072; stroke-width: 2.1; }
        :global(.story-grass) { stroke: #718a70; stroke-width: 2.3; }

        :global(.story-path),
        :global(.story-bird) {
          transition: stroke var(--duration-fast) var(--ease-object);
        }

        .story-object .room-door:hover :global(.story-path),
        .story-object .room-door:hover :global(.story-bird) {
          stroke: #6f465b;
        }

        :global(.story-page) {
          position: absolute;
          z-index: calc(var(--z-object) + 6);
          width: 64px;
          height: 82px;
          border: 1px solid rgba(132, 79, 93, 0.3);
          background: #fff7ec;
          box-shadow: 3px 5px 8px rgba(86, 52, 63, 0.12);
          pointer-events: none;
          transition: transform var(--duration-object) var(--ease-object);
        }

        :global(.story-page.page-one) { right: 9%; top: 25%; transform: rotate(4deg); }
        :global(.story-page.page-two) { left: 13%; bottom: 13%; transform: rotate(-5deg) scale(0.78); }
        :global(.story-page.page-three) {
          right: 23%;
          bottom: 7%;
          width: 52px;
          height: 65px;
          background:
            linear-gradient(150deg, transparent 0 70%, rgba(190, 129, 151, 0.12) 71%),
            #fff8ef;
          transform: rotate(8deg) scale(0.74);
        }

        :global(.story-page.page-one)::after {
          position: absolute;
          left: 10px;
          right: 10px;
          top: 21px;
          height: 1px;
          background: rgba(129, 79, 92, 0.18);
          box-shadow: 0 9px 0 rgba(129, 79, 92, 0.13), 0 18px 0 rgba(129, 79, 92, 0.1);
          content: "";
        }

        :global(.story-page.page-two)::after {
          position: absolute;
          left: 20px;
          top: 24px;
          width: 18px;
          height: 12px;
          border: 1px solid rgba(132, 79, 93, 0.36);
          border-bottom: 0;
          border-radius: 50% 50% 0 0;
          box-shadow: -7px 13px 0 -6px rgba(132, 79, 93, 0.45), 7px 13px 0 -6px rgba(132, 79, 93, 0.45);
          content: "";
        }

        .story-object .room-door:hover :global(.page-one) {
          transform: rotate(6deg) translateY(-2px);
        }

        :global(.story-tape) {
          position: absolute;
          right: 13%;
          top: 23%;
          z-index: calc(var(--z-object) + 7);
          width: 48px;
          height: 14px;
          background: rgba(230, 194, 102, 0.76);
          transform: rotate(-4deg);
          pointer-events: none;
        }

        :global(.story-binding) {
          position: absolute;
          left: 7.5%;
          top: 34%;
          z-index: calc(var(--z-object) + 6);
          display: grid;
          gap: 22px;
          pointer-events: none;
        }

        :global(.story-binding i) {
          width: 9px;
          height: 9px;
          border: 1px solid #8d5266;
          border-radius: 50%;
          background: #f5c6ce;
          box-shadow: inset 2px 2px 0 rgba(255, 239, 237, 0.52);
        }

        :global(.story-paint-mark) {
          position: absolute;
          left: 17%;
          bottom: 5%;
          z-index: calc(var(--z-object) + 5);
          width: 116px;
          height: 18px;
          border-radius: 48% 52% 43% 57%;
          background: linear-gradient(90deg, rgba(109, 142, 141, 0.18), rgba(217, 143, 163, 0.36), transparent);
          transform: rotate(-4deg);
          pointer-events: none;
        }

        :global(.story-page-number) {
          position: absolute;
          right: 25.5%;
          bottom: 9%;
          z-index: calc(var(--z-object) + 7);
          color: rgba(113, 67, 83, 0.54);
          font-family: var(--font-label);
          font-size: 8px;
          pointer-events: none;
          transform: rotate(8deg);
        }

        :global(.story-handle) {
          position: absolute;
          right: 13%;
          top: 56%;
          z-index: calc(var(--z-object) + 8);
          width: 35px;
          height: 35px;
          border: 3px solid #7c4a5b;
          border-radius: 55% 45% 60% 40%;
          background:
            radial-gradient(circle at 36% 30%, #fff9ee 0 16%, transparent 17%),
            linear-gradient(145deg, #f6dcae, #c98c77);
          box-shadow: 2px 5px 7px rgba(82, 45, 58, 0.2);
          pointer-events: none;
          transition: filter var(--duration-fast) var(--ease-object);
        }

        :global(.story-handle)::after {
          position: absolute;
          inset: -9px;
          border: 1px solid rgba(125, 73, 91, 0.42);
          border-radius: 46% 54% 43% 57%;
          content: "";
          transform: rotate(-13deg);
        }

        :global(.story-handle span) {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8f5367;
          transform: translate(-50%, -50%);
        }

        .story-object .room-door:hover :global(.story-handle) { filter: brightness(1.1); }

        .story-object .door-state-label {
          right: 7%;
          top: 39%;
          width: 72px;
          padding: 7px 6px;
          border: 1px solid rgba(139, 78, 98, 0.28);
          background: #fff5eb;
          color: #754153;
          transform: rotate(3deg);
        }

        .cs-object .door-frame {
          border-radius: 4px 4px 2px 2px;
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.65), transparent 12% 86%, rgba(49, 99, 116, 0.16)),
            linear-gradient(180deg, #91cbd5, #4d8da0);
          clip-path: polygon(0 0, 91% 0, 100% 7%, 100% 100%, 0 100%);
          box-shadow:
            inset 7px 5px 0 rgba(233, 252, 251, 0.38),
            inset -9px 0 0 rgba(49, 99, 116, 0.17),
            8px 0 18px rgba(64, 133, 147, 0.12);
        }

        .cs-object .door-surface {
          inset: 17px 18px 0;
          border: 1px solid rgba(53, 111, 130, 0.64);
          border-bottom: 0;
          background:
            radial-gradient(circle at 86% 25%, rgba(224, 255, 250, 0.5), transparent 25%),
            linear-gradient(112deg, rgba(255, 255, 255, 0.58), transparent 18% 59%, rgba(53, 111, 130, 0.12)),
            linear-gradient(90deg, transparent 0 61%, rgba(204, 243, 243, 0.36) 61% 100%),
            linear-gradient(180deg, #d9f0f1 0%, #b7dce4 55%, #8fc2d0 100%);
          clip-path: polygon(0 0, 88% 0, 100% 8%, 100% 100%, 0 100%);
          box-shadow:
            inset 8px 0 12px rgba(241, 255, 253, 0.32),
            inset -18px 0 24px rgba(49, 112, 128, 0.12),
            inset 0 -20px 24px rgba(49, 112, 128, 0.08);
        }

        .cs-object .door-gap {
          left: 18px;
          right: 18px;
          bottom: 0;
          height: 3px;
        }

        .cs-object .door-nameplate {
          left: 12%;
          top: 11%;
          width: 68%;
          padding: 13px 14px 11px;
          border: 1px solid rgba(64, 129, 145, 0.5);
          border-radius: 2px;
          background:
            linear-gradient(110deg, rgba(255, 255, 255, 0.66), rgba(198, 235, 237, 0.68)),
            var(--house-glass);
          color: #315c68;
          box-shadow:
            4px 6px 14px rgba(50, 101, 114, 0.13),
            inset 0 0 0 2px rgba(255, 255, 255, 0.22);
          transition:
            filter var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
          transform: translate(6px, -3px);
          text-shadow: 3px 2px 0 rgba(105, 184, 193, 0.18);
        }

        .cs-object .door-nameplate::after {
          position: absolute;
          left: 8%;
          right: -8%;
          bottom: -8px;
          height: 1px;
          background: linear-gradient(90deg, rgba(73, 143, 157, 0.62), transparent);
          box-shadow: 10px 3px 0 rgba(146, 220, 220, 0.22);
          content: "";
        }

        .cs-object .room-door:hover .door-nameplate {
          filter: brightness(1.07);
          box-shadow:
            4px 6px 14px rgba(50, 101, 114, 0.15),
            0 0 13px rgba(154, 224, 226, 0.28);
        }

        :global(.cs-module) {
          position: absolute;
          z-index: calc(var(--z-object) + 2);
          border: 1px solid rgba(53, 111, 130, 0.27);
          pointer-events: none;
        }

        :global(.cs-module.module-top) { left: 12%; top: 29%; width: 73%; height: 16%; }
        :global(.cs-module.module-main) { left: 18%; top: 50%; width: 62%; height: 35%; }
        :global(.cs-module.module-raised) {
          left: 9%;
          top: 57%;
          z-index: calc(var(--z-object) + 4);
          width: 31%;
          height: 21%;
          background: linear-gradient(135deg, rgba(230, 248, 246, 0.34), rgba(91, 160, 177, 0.1));
          box-shadow: 5px 7px 0 rgba(57, 118, 133, 0.08);
        }

        :global(.cs-module.module-floating) {
          right: 8%;
          top: 33%;
          z-index: calc(var(--z-object) + 5);
          width: 17%;
          height: 12%;
          border-color: rgba(161, 230, 228, 0.62);
          background: rgba(215, 247, 244, 0.2);
          box-shadow: 4px 5px 0 rgba(85, 159, 173, 0.09);
          transform: translate(7px, -5px);
        }

        :global(.cs-frosted) {
          position: absolute;
          left: 22%;
          top: 35%;
          z-index: calc(var(--z-object) + 4);
          width: 46%;
          height: 20%;
          border: 1px solid rgba(80, 146, 158, 0.42);
          background:
            radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.75), transparent 24%),
            rgba(221, 246, 244, 0.42);
          box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.34);
          pointer-events: none;
        }

        :global(.cs-hologram-zone) {
          position: absolute;
          right: 4%;
          top: 20%;
          z-index: calc(var(--z-object) + 4);
          width: 39%;
          height: 59%;
          border-right: 1px solid rgba(198, 246, 242, 0.58);
          background:
            radial-gradient(circle at 88% 12%, rgba(221, 255, 249, 0.75) 0 2px, transparent 3px),
            radial-gradient(circle at 70% 30%, rgba(188, 241, 239, 0.6) 0 2px, transparent 3px),
            radial-gradient(circle at 91% 48%, rgba(224, 255, 250, 0.72) 0 3px, transparent 4px),
            linear-gradient(90deg, transparent, rgba(194, 240, 239, 0.13));
          mask-image: linear-gradient(125deg, transparent 0 8%, black 42%, black 78%, transparent 100%);
          pointer-events: none;
        }

        :global(.cs-hologram-zone i) {
          position: absolute;
          right: 0;
          width: 76%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(222, 255, 250, 0.8));
        }

        :global(.cs-hologram-zone i:nth-child(1)) { top: 38%; }
        :global(.cs-hologram-zone i:nth-child(2)) { top: 69%; width: 54%; }

        :global(.cs-circuit) {
          position: absolute;
          inset: 5% 4% 2%;
          z-index: calc(var(--z-object) + 5);
          width: 92%;
          height: 93%;
          overflow: visible;
          fill: rgba(218, 254, 249, 0.78);
          stroke: rgba(65, 135, 151, 0.34);
          stroke-linecap: square;
          stroke-linejoin: round;
          stroke-width: 1.5;
          pointer-events: none;
        }

        :global(.cs-circuit path) {
          fill: none;
        }

        :global(.cs-circuit circle) {
          fill: rgba(218, 254, 249, 0.78);
        }

        :global(.cs-frosted span) {
          position: absolute;
          left: 12%;
          right: 12%;
          top: 50%;
          height: 1px;
          background: rgba(55, 115, 132, 0.32);
          box-shadow: 0 16px 0 rgba(55, 115, 132, 0.18), 0 -16px 0 rgba(55, 115, 132, 0.18);
        }

        :global(.cs-seam) {
          position: absolute;
          z-index: calc(var(--z-object) + 3);
          background: rgba(51, 109, 128, 0.27);
          pointer-events: none;
        }

        :global(.cs-seam.seam-one) { left: 18%; right: 18%; top: 47%; height: 1px; }
        :global(.cs-seam.seam-two) { left: 46%; top: 47%; bottom: 14%; width: 1px; }

        :global(.cs-dissolve-edge) {
          position: absolute;
          right: 0;
          top: 6%;
          z-index: calc(var(--z-object) + 5);
          width: 18%;
          height: 80%;
          background:
            repeating-linear-gradient(180deg, transparent 0 19px, rgba(222, 255, 250, 0.4) 19px 20px),
            linear-gradient(90deg, transparent, rgba(182, 232, 233, 0.26));
          mask-image: linear-gradient(180deg, black, black 70%, transparent 98%);
          pointer-events: none;
        }

        :global(.cs-handle) {
          position: absolute;
          right: 12%;
          top: 52%;
          z-index: calc(var(--z-object) + 8);
          width: 25px;
          height: 105px;
          border: 1px solid #477f91;
          border-radius: 5px;
          background: linear-gradient(90deg, #679faf, #e0f5f3 48%, #65a0b1);
          box-shadow:
            2px 6px 9px rgba(46, 94, 109, 0.2),
            inset 0 0 0 3px rgba(255, 255, 255, 0.18);
          overflow: hidden;
          pointer-events: none;
        }

        :global(.cs-handle)::before {
          position: absolute;
          inset: -8px -5px;
          z-index: -1;
          border: 1px solid rgba(63, 126, 143, 0.52);
          border-radius: 7px;
          background: rgba(79, 146, 162, 0.14);
          content: "";
        }

        :global(.cs-handle)::after {
          position: absolute;
          left: 4px;
          right: 4px;
          top: 50%;
          height: 1px;
          background: rgba(241, 255, 252, 0.82);
          box-shadow: 0 0 5px rgba(192, 247, 243, 0.58);
          content: "";
        }

        :global(.cs-handle span) {
          position: absolute;
          left: -70%;
          top: 0;
          width: 42px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
          transform: skewX(-18deg);
          transition: left var(--duration-object) var(--ease-object);
        }

        .cs-object .room-door:hover :global(.cs-handle span) { left: 80%; }

        :global(.cs-particles) {
          position: absolute;
          right: 1%;
          top: 20%;
          z-index: calc(var(--z-object) + 6);
          width: 38%;
          height: 58%;
          pointer-events: none;
        }

        :global(.cs-particles i) {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(215, 253, 247, 0.94);
          box-shadow: 0 0 7px rgba(119, 209, 214, 0.65);
          transition:
            transform var(--duration-object) var(--ease-object),
            opacity var(--duration-object) var(--ease-object);
        }

        :global(.cs-particles i:nth-child(1)) { left: 8%; top: 4%; }
        :global(.cs-particles i:nth-child(2)) { left: 43%; top: 11%; }
        :global(.cs-particles i:nth-child(3)) { left: 79%; top: 3%; }
        :global(.cs-particles i:nth-child(4)) { left: 23%; top: 28%; }
        :global(.cs-particles i:nth-child(5)) { left: 65%; top: 34%; }
        :global(.cs-particles i:nth-child(6)) { left: 91%; top: 42%; }
        :global(.cs-particles i:nth-child(7)) { left: 5%; top: 51%; }
        :global(.cs-particles i:nth-child(8)) { left: 48%; top: 60%; }
        :global(.cs-particles i:nth-child(9)) { left: 77%; top: 70%; }
        :global(.cs-particles i:nth-child(10)) { left: 19%; top: 79%; }
        :global(.cs-particles i:nth-child(11)) { left: 55%; top: 89%; }
        :global(.cs-particles i:nth-child(12)) { left: 93%; top: 92%; }
        :global(.cs-particles i:nth-child(13)) { left: 35%; top: 44%; width: 6px; height: 6px; }
        :global(.cs-particles i:nth-child(14)) { left: 68%; top: 52%; width: 3px; height: 3px; }
        :global(.cs-particles i:nth-child(15)) { left: 82%; top: 19%; width: 6px; height: 6px; }
        :global(.cs-particles i:nth-child(16)) { left: 57%; top: 25%; width: 2px; height: 2px; }
        :global(.cs-particles i:nth-child(17)) { left: 88%; top: 59%; width: 5px; height: 5px; }
        :global(.cs-particles i:nth-child(18)) { left: 36%; top: 69%; width: 2px; height: 2px; }
        :global(.cs-particles i:nth-child(19)) { left: 72%; top: 82%; width: 5px; height: 5px; }
        :global(.cs-particles i:nth-child(20)) { left: 97%; top: 72%; width: 3px; height: 3px; }

        .cs-object .room-door:hover :global(.cs-particles i:nth-child(odd)) {
          opacity: 0.7;
          transform: translate(-2px, 2px);
        }

        .cs-object .room-door:hover :global(.cs-particles i:nth-child(even)) {
          opacity: 1;
          transform: translate(2px, -2px);
        }

        :global(.cs-work-order) {
          position: absolute;
          right: 8%;
          bottom: 13%;
          z-index: calc(var(--z-object) + 7);
          width: 72px;
          height: 55px;
          border: 1px solid rgba(67, 126, 141, 0.44);
          background: rgba(235, 250, 247, 0.84);
          box-shadow: 3px 6px 10px rgba(49, 96, 108, 0.13);
          pointer-events: none;
        }

        :global(.cs-work-order i) {
          display: block;
          width: 70%;
          height: 2px;
          margin: 11px auto -5px;
          background: rgba(53, 111, 130, 0.36);
        }

        .cs-object .door-state-label {
          right: 7%;
          bottom: 22%;
          width: 74px;
          color: #315c68;
        }

        @media (max-width: 760px) {
          .door-object {
            min-height: 390px;
          }

          .door-nameplate strong {
            font-size: clamp(17px, 5.2vw, 23px);
          }

          :global(.story-page.page-three),
          :global(.cs-particles i:nth-child(n + 15)) {
            display: none;
          }

          :global(.music-lantern) {
            left: 3%;
            transform: scale(0.82);
            transform-origin: top left;
          }

          :global(.music-score-tile) {
            right: 4%;
            transform: scale(0.86);
            transform-origin: top right;
          }

          :global(.music-pot) {
            transform: scale(0.82);
            transform-origin: bottom center;
          }

          :global(.music-pot.pot-left) { left: -2%; }
          :global(.music-pot.pot-right) { right: -2%; }

          :global(.melody-mechanism) {
            right: calc(30% - 8px);
            width: 38px;
            height: 43px;
          }

          :global(.music-handle) {
            right: 30%;
          }

          .music-object .door-state-label {
            right: calc(30% - 28px);
          }

          .music-object .door-nameplate strong {
            font-size: clamp(13px, 4vw, 17px);
          }

          :global(.story-canvas) {
            left: 11%;
            width: 72%;
          }

          :global(.story-page) {
            width: 52px;
            height: 67px;
          }

          :global(.cs-particles) {
            width: 32%;
          }

          :global(.cs-module.module-floating) {
            right: 6%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .room-door,
          .door-gap,
          :global(.music-garden-vine),
          :global(.music-handle),
          :global(.story-page),
          :global(.story-path),
          :global(.story-bird),
          :global(.story-handle),
          :global(.cs-handle span),
          :global(.cs-particles i) {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
