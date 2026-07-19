"use client";

import { useEffect, useState } from "react";

import { useSound } from "@/components/SoundProvider";
import type { RoomIntroData, SiteLanguage } from "@/types";

type RoomIntroProps = {
  intro: RoomIntroData;
  language: SiteLanguage;
  onContinue: () => void;
};

export default function RoomIntro({
  intro,
  language,
  onContinue,
}: RoomIntroProps) {
  const { playUISound } = useSound();
  const [photoStatus, setPhotoStatus] = useState<"loading" | "ready" | "missing">(
    intro.photoSrc ? "loading" : "missing"
  );

  useEffect(() => {
    if (!intro.photoSrc) return;

    let active = true;
    const image = new window.Image();
    image.onload = () => {
      if (active) setPhotoStatus("ready");
    };
    image.onerror = () => {
      if (active) setPhotoStatus("missing");
    };
    image.src = intro.photoSrc;

    return () => {
      active = false;
    };
  }, [intro.photoSrc]);

  function handleContinue() {
    playUISound("open");
    onContinue();
  }

  return (
    <section id="music-intro" className="room-intro-page">
      <div className="wall-vine" aria-hidden="true">
        <span className="vine-leaf leaf-one" />
        <span className="vine-leaf leaf-two" />
        <span className="vine-leaf leaf-three" />
        <span className="vine-leaf leaf-four" />
        <span className="grape-cluster">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="wall-vine wall-vine-secondary" aria-hidden="true">
        <span className="vine-leaf leaf-one" />
        <span className="vine-leaf leaf-three" />
      </div>

      <section className="intro-stage" aria-labelledby="room-intro-title">
        <div className="photo-area">
          <span className="brass-clip" aria-hidden="true" />
          <div
            className={`photo-frame ${photoStatus}`}
            role="img"
            aria-label={intro.photoAlt[language]}
            style={
              photoStatus === "ready" && intro.photoSrc
                ? { backgroundImage: `url(${intro.photoSrc})` }
                : undefined
            }
          >
            {photoStatus !== "ready" && (
              <div className="identity-panel">
                <span className="identity-mark" aria-hidden="true">CR</span>
                <strong>{intro.name[language]}</strong>
                <small>{intro.role[language]}</small>
              </div>
            )}
          </div>
          <span className="photo-caption">
            {(intro.photoCaption ?? intro.roomLabel)[language]}
          </span>
        </div>

        <article className="intro-writing">
          <p className="room-kicker">{intro.roomLabel[language]}</p>
          <h1 id="room-intro-title">{intro.name[language]}</h1>
          <h2>{intro.role[language]}</h2>

          <div className="intro-copy">
            {intro.introduction[language].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <button
            className="continue-sign"
            type="button"
            onClick={handleContinue}
            aria-label={intro.continueLabel[language]}
          >
            <span className="sign-screw" aria-hidden="true" />
            <span>{intro.continueLabel[language]}</span>
            <span className="continue-arrow" aria-hidden="true">↓</span>
          </button>
        </article>
      </section>

      <style jsx>{`
        .room-intro-page {
          position: relative;
          min-height: 92svh;
          overflow: clip;
          color: var(--music-ink);
          background:
            linear-gradient(116deg, transparent 0 61%, rgba(178, 119, 79, 0.08) 61.2% 100%),
            transparent;
        }

        .room-intro-page::before {
          position: absolute;
          left: clamp(26px, 6vw, 96px);
          top: clamp(78px, 10vh, 118px);
          width: clamp(270px, 30vw, 390px);
          height: min(64vh, 570px);
          border: 12px solid rgba(255, 252, 242, 0.94);
          border-radius: 190px 190px 8px 8px;
          background:
            linear-gradient(180deg, #77c7df 0 36%, #2f8fb6 36.5% 48%, #17648d 48.5% 70%, #3c7891 70.5% 100%);
          box-shadow:
            0 24px 48px rgba(54, 91, 101, 0.16),
            inset 0 0 0 5px rgba(30, 94, 126, 0.2);
          content: "";
          opacity: 0.82;
        }

        .room-intro-page::after {
          position: absolute;
          right: -8%;
          bottom: 5%;
          width: 52%;
          height: 24%;
          background: rgba(235, 190, 91, 0.15);
          clip-path: polygon(26% 0, 100% 20%, 100% 100%, 0 100%);
          content: "";
          pointer-events: none;
        }

        .intro-stage {
          position: relative;
          z-index: var(--z-object);
          display: grid;
          width: min(1120px, calc(100% - 96px));
          min-height: 92svh;
          box-sizing: border-box;
          margin: 0 auto;
          padding: clamp(100px, 12vh, 138px) 0 clamp(72px, 9vh, 104px);
          grid-template-columns: minmax(300px, 0.82fr) minmax(390px, 1.18fr);
          align-items: center;
          gap: clamp(52px, 7vw, 106px);
          animation: introSceneIn var(--duration-room) var(--ease-room) both;
        }

        .photo-area {
          position: relative;
          justify-self: end;
          width: min(100%, 390px);
          transform: rotate(-0.7deg);
        }

        .photo-frame {
          position: relative;
          aspect-ratio: 4 / 5;
          border: 13px solid #28789a;
          border-bottom-width: 50px;
          border-radius: 4px;
          background-color: #d9c49e;
          background-position: center 28%;
          background-size: cover;
          box-shadow:
            18px 24px 44px rgba(36, 70, 77, 0.24),
            inset 3px 3px 0 rgba(197, 231, 235, 0.32),
            inset -4px -4px 0 rgba(18, 72, 96, 0.2);
        }

        .photo-frame::after {
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(255, 252, 238, 0.44);
          content: "";
          pointer-events: none;
        }

        .brass-clip {
          position: absolute;
          left: 50%;
          top: -20px;
          z-index: calc(var(--z-object) + 4);
          width: 52px;
          height: 32px;
          border: 2px solid #8f682d;
          border-radius: 4px 4px 2px 2px;
          background:
            linear-gradient(90deg, transparent 42%, rgba(255, 243, 174, 0.42) 50%, transparent 58%),
            linear-gradient(180deg, #e1be64, #aa7939);
          box-shadow: 3px 7px 10px rgba(42, 68, 69, 0.16);
          transform: translateX(-50%) rotate(1deg);
        }

        .brass-clip::after {
          position: absolute;
          left: 9px;
          right: 9px;
          bottom: 5px;
          height: 7px;
          border: 1px solid rgba(90, 57, 24, 0.42);
          border-radius: 50%;
          content: "";
        }

        .identity-panel {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 34px;
          background:
            repeating-linear-gradient(0deg, transparent 0 22px, rgba(100, 67, 35, 0.045) 22px 23px),
            #e8dcc4;
          color: var(--music-ink);
          text-align: center;
        }

        .identity-mark {
          display: grid;
          width: 72px;
          height: 72px;
          margin-bottom: 22px;
          place-items: center;
          border: 1px solid rgba(104, 67, 34, 0.28);
          border-radius: 50%;
          color: rgba(35, 79, 93, 0.72);
          font-family: var(--font-display);
          font-size: 24px;
          letter-spacing: 0.08em;
        }

        .identity-panel strong {
          font-family: var(--font-display);
          font-size: 19px;
          font-weight: 700;
        }

        .identity-panel small {
          max-width: 230px;
          margin-top: 12px;
          font-size: 12px;
          line-height: 1.6;
        }

        .photo-caption {
          position: absolute;
          left: 50%;
          bottom: 16px;
          color: #fff8e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .intro-writing {
          max-width: 610px;
          align-self: center;
        }

        .room-kicker {
          margin: 0 0 12px;
          color: var(--music-cobalt);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(44px, 5vw, 70px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0;
          color: #183f49;
        }

        h2 {
          max-width: 540px;
          margin: 16px 0 0;
          color: #80573d;
          font-family: var(--font-body);
          font-size: clamp(16px, 1.45vw, 20px);
          font-weight: 700;
          line-height: 1.45;
          letter-spacing: 0;
        }

        .intro-copy {
          display: grid;
          max-width: 62ch;
          gap: 13px;
          margin-top: 27px;
          color: #4f5148;
          font-size: 15px;
          line-height: 1.72;
        }

        .intro-copy p { margin: 0; }

        .intro-copy p:first-child {
          position: relative;
          padding-bottom: 15px;
          color: #24434b;
          font-family: var(--font-display);
          font-size: 19px;
          font-weight: 700;
        }

        .intro-copy p:first-child::after {
          position: absolute;
          left: 0;
          bottom: 0;
          width: min(230px, 68%);
          height: 2px;
          background: linear-gradient(90deg, var(--music-cobalt), var(--music-sun));
          content: "";
        }

        .continue-sign {
          position: relative;
          display: inline-flex;
          min-height: 50px;
          align-items: center;
          gap: 13px;
          margin-top: 27px;
          padding: 10px 17px 10px 29px;
          border: 1px solid rgba(20, 83, 110, 0.56);
          border-radius: 5px;
          background:
            linear-gradient(110deg, rgba(255, 255, 255, 0.2), transparent 36%),
            linear-gradient(180deg, #2f83a3, var(--music-cobalt));
          color: #fff9e9;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          box-shadow:
            0 5px 0 #0d4f70,
            0 12px 20px rgba(34, 75, 84, 0.18),
            inset 0 1px 0 rgba(221, 243, 241, 0.35);
          transition:
            transform var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
        }

        .continue-sign:hover {
          transform: translateY(-2px);
          box-shadow:
            0 7px 0 #0d4f70,
            0 15px 23px rgba(34, 75, 84, 0.22),
            inset 0 1px 0 rgba(221, 243, 241, 0.42);
        }

        .continue-sign:active {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #0d4f70;
        }

        .sign-screw {
          position: absolute;
          left: 10px;
          top: 50%;
          width: 7px;
          height: 7px;
          border: 1px solid #74522c;
          border-radius: var(--radius-round);
          background: var(--music-sun);
          transform: translateY(-50%);
        }

        .continue-arrow {
          font-size: 19px;
          line-height: 1;
        }

        .wall-vine {
          position: absolute;
          left: -20px;
          top: 9%;
          width: 172px;
          height: 54%;
          border-right: 3px solid color-mix(in srgb, var(--music-vine) 64%, transparent);
          border-bottom: 2px solid color-mix(in srgb, var(--music-vine) 52%, transparent);
          border-radius: 0 0 80% 0;
          pointer-events: none;
          transform: rotate(4deg);
        }

        .wall-vine::before,
        .wall-vine::after {
          position: absolute;
          border: 2px solid color-mix(in srgb, var(--music-vine) 58%, transparent);
          border-left-color: transparent;
          border-bottom-color: transparent;
          border-radius: 50%;
          content: "";
        }

        .wall-vine::before {
          right: -27px;
          top: 16%;
          width: 52px;
          height: 78px;
          transform: rotate(31deg);
        }

        .wall-vine::after {
          right: 18px;
          bottom: -28px;
          width: 74px;
          height: 48px;
          transform: rotate(12deg);
        }

        .vine-leaf {
          position: absolute;
          width: 29px;
          height: 16px;
          border-radius: 90% 0 90% 0;
          background: color-mix(in srgb, var(--music-leaf) 72%, transparent);
        }

        .leaf-one {
          right: -7px;
          top: 25%;
          transform: rotate(28deg);
        }

        .leaf-two {
          right: 7px;
          top: 47%;
          transform: rotate(116deg) scale(0.86);
        }

        .leaf-three {
          right: -10px;
          top: 68%;
          transform: rotate(36deg) scale(1.08);
        }

        .leaf-four {
          right: 25px;
          bottom: -5px;
          transform: rotate(-24deg) scale(0.8);
        }

        .grape-cluster {
          position: absolute;
          right: -26px;
          top: 52%;
          width: 29px;
          height: 34px;
          transform: rotate(-5deg);
        }

        .grape-cluster i {
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1px solid rgba(91, 74, 112, 0.28);
          border-radius: 50%;
          background:
            radial-gradient(circle at 31% 27%, rgba(255, 255, 255, 0.28) 0 7%, transparent 10%),
            linear-gradient(145deg, #b9a8c2, #9580a2 62%, #796985);
          box-shadow:
            0 1px 2px rgba(62, 58, 75, 0.14),
            inset -1px -1px 0 rgba(71, 57, 84, 0.1);
          opacity: 0.78;
        }

        .grape-cluster i:nth-child(1) { left: 6px; top: 0; }
        .grape-cluster i:nth-child(2) { left: 14px; top: 2px; }
        .grape-cluster i:nth-child(3) { left: 2px; top: 8px; }
        .grape-cluster i:nth-child(4) { left: 10px; top: 8px; z-index: 2; }
        .grape-cluster i:nth-child(5) { left: 18px; top: 10px; }
        .grape-cluster i:nth-child(6) { left: 5px; top: 16px; }
        .grape-cluster i:nth-child(7) { left: 13px; top: 17px; z-index: 3; }
        .grape-cluster i:nth-child(8) { left: 9px; top: 24px; }
        .grape-cluster i:nth-child(9) { left: 16px; top: 23px; }

        .wall-vine-secondary {
          left: auto;
          right: -32px;
          top: 61%;
          width: 124px;
          height: 24%;
          opacity: 0.58;
          transform: scaleX(-1) rotate(-6deg);
        }

        .wall-vine-secondary::before { top: 24%; }
        .wall-vine-secondary::after { display: none; }

        @keyframes introSceneIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .intro-stage {
            width: min(100% - 56px, 840px);
            grid-template-columns: minmax(250px, 0.8fr) minmax(340px, 1.2fr);
            gap: 42px;
          }

          .photo-area { width: min(100%, 330px); }
          .intro-copy { font-size: 14px; }
        }

        @media (max-width: 760px) {
          .room-intro-page { min-height: auto; }

          .room-intro-page::before {
            display: none;
          }

          .room-intro-page::after {
            right: -22%;
            bottom: 29%;
            width: 92%;
            height: 15%;
          }

          .intro-stage {
            display: flex;
            width: min(100% - 36px, 560px);
            min-height: auto;
            flex-direction: column;
            gap: 30px;
            padding: 92px 0 66px;
          }

          .photo-area {
            width: min(68vw, 278px);
            margin: 22px auto 0;
            align-self: center;
            justify-self: auto;
            transform: none;
          }

          .photo-frame {
            border-width: 12px;
            border-bottom-width: 44px;
          }

          .intro-writing { width: 100%; }

          h1 { font-size: clamp(40px, 12vw, 56px); }

          .intro-copy {
            max-width: none;
            font-size: 15px;
            line-height: 1.68;
          }

          .continue-sign {
            display: flex;
            width: min(100%, 260px);
            justify-content: center;
            margin: 22px auto 0;
          }

          .wall-vine {
            left: -70px;
            top: 38%;
            opacity: 0.78;
          }

          .wall-vine-secondary {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-stage { animation: none; }
          .continue-sign { transition: none; }
        }
      `}</style>
    </section>
  );
}
