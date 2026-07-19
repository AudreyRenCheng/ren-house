"use client";

import { useRef, type MouseEvent } from "react";

import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";

import type {
  ConstructionNoticeData,
  LocalizedText,
  SiteLanguage,
} from "@/types";

type ConstructionNoticeProps = {
  notice: ConstructionNoticeData;
  roomTitle: LocalizedText;
  language: SiteLanguage;
  onDismiss: () => void;
};

export default function ConstructionNotice({
  notice,
  roomTitle,
  language,
  onDismiss,
}: ConstructionNoticeProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useAccessibleDialog({
    open: true,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose: onDismiss,
  });

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onDismiss();
  }

  return (
    <div
      className={`construction-overlay ${notice.theme}-overlay`}
      onClick={handleOverlayClick}
    >
      <section
        ref={dialogRef}
        className={`construction-notice ${notice.theme}-notice`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="construction-title"
        aria-describedby="construction-description"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          className="notice-close"
          type="button"
          onClick={onDismiss}
          aria-label={language === "en" ? "Close notice" : "关闭提示"}
        >
          ×
        </button>

        <div className="notice-decoration" aria-hidden="true">
          <span className="decoration-one" />
          <span className="decoration-two" />
          <span className="decoration-three" />
        </div>

        <p className="notice-room">
          {(notice.roomTitle ?? roomTitle)[language]}
        </p>
        <p className="notice-label">{notice.label[language]}</p>
        <h2 id="construction-title">{notice.title[language]}</h2>

        <div id="construction-description" className="notice-copy">
          {notice.description[language].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <button className="dismiss-button" type="button" onClick={onDismiss}>
          {notice.dismissLabel[language]}
        </button>
      </section>

      <style jsx>{`
        .construction-overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: grid;
          place-items: center;
          padding: clamp(24px, 5vw, 72px);
          background: rgba(62, 43, 31, 0.34);
          backdrop-filter: blur(2px);
        }

        .construction-overlay::before {
          position: absolute;
          left: calc(50% + min(20vw, 260px));
          top: 50%;
          width: min(17vw, 220px);
          height: 2px;
          background: color-mix(in srgb, var(--notice-border) 60%, transparent);
          content: "";
          opacity: 0.66;
          transform: translateY(-50%);
          transform-origin: left center;
        }

        .construction-notice {
          position: relative;
          z-index: var(--z-dialog);
          width: min(100%, 520px);
          max-height: min(78vh, 680px);
          overflow-y: auto;
          padding: clamp(34px, 5vw, 52px);
          border: 2px solid var(--notice-border);
          border-radius: 2px;
          background: var(--notice-paper);
          color: var(--notice-ink);
          box-shadow:
            0 28px 62px rgba(66, 42, 27, 0.28),
            inset 0 0 0 7px rgba(255, 255, 255, 0.2);
          transform: translateX(min(12vw, 150px)) rotate(-0.5deg);
          transform-origin: right center;
          animation: notice-unfold var(--duration-object) var(--ease-object) both;
        }

        @keyframes notice-unfold {
          from {
            opacity: 0;
            transform: translateX(min(14vw, 180px)) scaleX(0.82) rotate(-0.5deg);
          }
        }

        .story-notice {
          --notice-paper:
            radial-gradient(circle at 1px 1px, rgba(132, 70, 94, 0.06) 1px, transparent 1.5px),
            linear-gradient(145deg, #fff5f3, #f6d5dc);
          --notice-border: #bd788e;
          --notice-ink: #68384b;
          --notice-accent: #d98fa3;
          --notice-soft: #f0c767;
          clip-path: polygon(0 2%, 96% 0, 100% 9%, 98% 97%, 6% 100%, 0 91%);
        }

        .cs-notice {
          --notice-paper:
            linear-gradient(90deg, rgba(53, 111, 130, 0.06) 1px, transparent 1px),
            linear-gradient(180deg, rgba(53, 111, 130, 0.06) 1px, transparent 1px),
            linear-gradient(145deg, #edf8f7, #cfe8eb);
          --notice-border: #5f9ca8;
          --notice-ink: #315c68;
          --notice-accent: #78b7b0;
          --notice-soft: #e9ca78;
          background-size: 28px 28px, 28px 28px, auto;
          transform: translateX(min(12vw, 150px)) rotate(0.35deg);
          clip-path: polygon(0 0, 96% 0, 100% 7%, 100% 100%, 4% 100%, 0 94%);
        }

        .notice-close {
          position: absolute;
          right: 14px;
          top: 14px;
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          padding: 0;
          border: 1px solid color-mix(in srgb, var(--notice-border) 62%, transparent);
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.48);
          color: var(--notice-ink);
          cursor: pointer;
          font: inherit;
          font-size: 23px;
          line-height: 1;
        }

        .notice-room,
        .notice-label {
          margin: 0;
          font-weight: 800;
        }

        .notice-room {
          color: var(--notice-accent);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .notice-label {
          display: inline-block;
          margin-top: 15px;
          padding: 5px 8px;
          border: 1px dashed color-mix(in srgb, var(--notice-border) 68%, transparent);
          background: rgba(255, 255, 255, 0.32);
          font-size: 11px;
        }

        h2 {
          max-width: 390px;
          margin: 20px 0 0;
          font-size: clamp(26px, 4.2vw, 39px);
          line-height: 1.15;
          letter-spacing: 0;
        }

        .notice-copy {
          display: grid;
          gap: 10px;
          margin-top: 20px;
          font-size: 15px;
          line-height: 1.7;
        }

        .notice-copy p {
          margin: 0;
        }

        .dismiss-button {
          margin-top: 26px;
          padding: 11px 16px;
          border: 1px solid var(--notice-border);
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.56);
          color: var(--notice-ink);
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 5px 0 color-mix(in srgb, var(--notice-border) 22%, transparent);
          transition:
            transform var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object);
        }

        .dismiss-button:hover {
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 6px 0 color-mix(in srgb, var(--notice-border) 22%, transparent);
        }

        .dismiss-button:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 color-mix(in srgb, var(--notice-border) 22%, transparent);
        }

        .notice-decoration span {
          position: absolute;
          display: block;
          pointer-events: none;
        }

        .story-notice .decoration-one,
        .story-notice .decoration-two {
          width: 76px;
          height: 19px;
          background: color-mix(in srgb, var(--notice-accent) 70%, transparent);
          opacity: 0.62;
        }

        .story-notice .decoration-one {
          left: 10%;
          top: -9px;
          transform: rotate(-5deg);
        }

        .story-notice .decoration-two {
          right: 13%;
          bottom: -8px;
          transform: rotate(4deg);
        }

        .story-notice .decoration-three {
          right: 42px;
          top: 92px;
          width: 23px;
          height: 23px;
          background: var(--notice-soft);
          clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 56%, 78% 94%, 50% 71%, 22% 94%, 32% 56%, 2% 35%, 39% 35%);
          transform: rotate(10deg);
        }

        .cs-notice .decoration-one {
          right: 36px;
          top: 82px;
          width: 78px;
          height: 42px;
          border: 2px solid var(--notice-border);
          border-left: 0;
          border-bottom: 0;
        }

        .cs-notice .decoration-two,
        .cs-notice .decoration-three {
          width: 10px;
          height: 10px;
          border: 2px solid var(--notice-border);
          border-radius: 2px;
          background: #eef9f7;
        }

        .cs-notice .decoration-two {
          right: 29px;
          top: 75px;
        }

        .cs-notice .decoration-three {
          right: 106px;
          top: 117px;
        }

        @media (max-width: 760px) {
          .construction-overlay {
            align-items: center;
            padding: max(22px, env(safe-area-inset-top)) 18px max(22px, env(safe-area-inset-bottom));
          }

          .construction-overlay::before {
            display: none;
          }

          .construction-notice {
            max-height: calc(100svh - 44px);
            padding: 38px 24px 30px;
            transform: rotate(-0.5deg);
          }

          .cs-notice {
            transform: rotate(0.35deg);
          }

          .notice-copy {
            font-size: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .construction-notice,
          .dismiss-button {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
