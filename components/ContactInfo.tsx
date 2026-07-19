"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { useSound } from "@/components/SoundProvider";
import { contactCopy, contactMethods } from "@/data/contact";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import type {
  ContactButtonTheme,
  ContactMethod,
  SiteLanguage,
} from "@/types";

function MethodIcon({ type }: { type: ContactMethod["type"] }) {
  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 3.5 4.8 5.1c-.8.5-.9 1.7-.5 2.8 2 5.6 6.2 9.8 11.8 11.8 1.1.4 2.3.3 2.8-.5l1.6-2.4-4.4-2.4-1.5 1.7c-2.8-1.3-5.4-3.9-6.7-6.7l1.7-1.5-2.4-4.4Z" />
      </svg>
    );
  }

  if (type === "website") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21M12 3C9.5 5.5 8.3 8.5 8.3 12s1.2 6.5 3.7 9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 14.5 14.5 9" />
      <path d="M7.3 17.7 5.6 19.4a3.5 3.5 0 0 1-5-5l4.2-4.2a3.5 3.5 0 0 1 5 0" transform="translate(3 -3)" />
      <path d="m16.7 6.3 1.7-1.7a3.5 3.5 0 0 1 5 5l-4.2 4.2a3.5 3.5 0 0 1-5 0" transform="translate(-3 3)" />
    </svg>
  );
}

export default function ContactInfo({
  language,
  theme,
  hidden = false,
}: {
  language: SiteLanguage;
  theme: ContactButtonTheme;
  hidden?: boolean;
}) {
  const { playUISound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const clearFeedback = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setCopyFeedback("");
  }, []);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    },
    []
  );

  const closePanel = useCallback(() => {
    playUISound("close");
    setIsOpen(false);
    clearFeedback();
  }, [clearFeedback, playUISound]);

  useAccessibleDialog({
    open: isOpen && !hidden,
    dialogRef: panelRef,
    initialFocusRef: closeRef,
    returnFocusRef: triggerRef,
    onClose: closePanel,
  });

  if (hidden) return null;

  function showFeedback(message: string) {
    clearFeedback();
    setCopyFeedback(message);
    feedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback("");
      feedbackTimerRef.current = null;
    }, 2600);
  }

  function openPanel() {
    playUISound("open");
    clearFeedback();
    setIsOpen(true);
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closePanel();
  }

  async function copyValue(value: string, type: ContactMethod["type"]) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      playUISound("confirm");
      showFeedback(
        type === "email"
          ? contactCopy.copiedEmail[language]
          : contactCopy.copiedValue[language]
      );
    } catch {
      showFeedback(contactCopy.copyUnavailable[language]);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={`house-control house-control--bottom-right contact-trigger ${theme}-theme`}
        type="button"
        onClick={openPanel}
        aria-label={contactCopy.title[language]}
        title={contactCopy.title[language]}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={isOpen}
      >
        <span className="envelope-icon" aria-hidden="true">
          <span />
        </span>
        <span className="contact-trigger-label">{contactCopy.title[language]}</span>
      </button>

      {isOpen && (
        <div
          className={`contact-overlay ${theme}-theme`}
          onClick={handleOverlayClick}
        >
          <section
            ref={panelRef}
            className="contact-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-panel-title"
            aria-describedby="contact-panel-intro"
            tabIndex={-1}
          >
            <span className="letter-fold" aria-hidden="true" />

            <button
              ref={closeRef}
              className="panel-close"
              type="button"
              onClick={closePanel}
              aria-label={contactCopy.closeLabel[language]}
            >
              ×
            </button>

            <header className="letter-header">
              <div className="letter-mark" aria-hidden="true">
                <span />
              </div>
              <div>
                <p className="panel-kicker">
                  {contactCopy.letterKicker[language]}
                </p>
                <h2 id="contact-panel-title">{contactCopy.title[language]}</h2>
              </div>
            </header>

            <p id="contact-panel-intro" className="panel-intro">
              {contactMethods.length > 0
                ? contactCopy.introduction[language]
                : contactCopy.emptyState[language]}
            </p>

            {contactMethods.length > 0 ? (
              <div className="contact-list">
                {contactMethods.map((method) => {
                  const content = (
                    <>
                      <span className="method-icon">
                        <MethodIcon type={method.type} />
                      </span>
                      <span className="method-copy">
                        <span className="method-label">
                          {method.label[language]}
                        </span>
                        <strong>{method.value}</strong>
                      </span>
                      {method.external && (
                        <span className="external-mark" aria-hidden="true">
                          ↗
                        </span>
                      )}
                    </>
                  );

                  return (
                    <div className="contact-method" key={method.id}>
                      {method.href ? (
                        <a
                          href={method.href}
                          target={method.external ? "_blank" : undefined}
                          rel={method.external ? "noopener noreferrer" : undefined}
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="method-value">{content}</div>
                      )}

                      {method.copyable && (
                        <button
                          className="copy-button"
                          type="button"
                          onClick={() => void copyValue(method.value, method.type)}
                          aria-label={`${contactCopy.copyLabel[language]} ${
                            method.label[language]
                          }`}
                        >
                          {contactCopy.copyLabel[language]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <p className="copy-feedback" aria-live="polite">
              {copyFeedback}
            </p>

            <footer className="privacy-note">
              {contactCopy.privacyNote[language]}
            </footer>
          </section>
        </div>
      )}

      <style jsx>{`
        .house-theme {
          --contact-envelope: #c18b3e;
          --contact-envelope-dark: #714323;
          --contact-paper: #fff0c5;
          --contact-ink: #4e2b1c;
          --contact-accent: var(--house-brass);
          --contact-divider: rgba(113, 67, 35, 0.26);
          --contact-detail: repeating-linear-gradient(
            90deg,
            #0f6f78 0 7px,
            #f3c45f 7px 14px,
            #c64d5e 14px 21px
          );
        }

        .music-theme {
          --contact-envelope: #f3e8d2;
          --contact-envelope-dark: #176b91;
          --contact-paper: #fff8e7;
          --contact-ink: #244752;
          --contact-accent: #d9ad45;
          --contact-divider: rgba(23, 107, 145, 0.24);
          --contact-detail: linear-gradient(
            90deg,
            transparent 0 12%,
            #d9ad45 12% 28%,
            #176b91 28% 82%,
            transparent 82%
          );
        }

        .story-theme {
          --contact-envelope: #e5a9b8;
          --contact-envelope-dark: #8b4f65;
          --contact-paper: #fff0f3;
          --contact-ink: #663247;
          --contact-accent: #a65f78;
          --contact-divider: rgba(166, 95, 120, 0.24);
          --contact-detail: repeating-linear-gradient(
            90deg,
            #e9b2bf 0 12px,
            #f3d46f 12px 24px
          );
        }

        .cs-theme {
          --contact-envelope: #b8dce0;
          --contact-envelope-dark: #477c88;
          --contact-paper: #edf8f7;
          --contact-ink: #315d68;
          --contact-accent: #4f8795;
          --contact-divider: rgba(79, 135, 149, 0.25);
          --contact-detail: repeating-linear-gradient(
            90deg,
            #78b7b0 0 15px,
            #d7eeee 15px 30px
          );
        }

        .contact-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 13px;
          overflow: visible;
          border: 2px solid var(--contact-envelope-dark);
          border-radius: var(--radius-object);
          background: var(--contact-envelope);
          color: var(--contact-ink);
          box-shadow:
            var(--shadow-contact),
            inset 0 1px 0 rgba(255, 255, 255, 0.42);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          transition:
            transform var(--duration-fast) var(--ease-object),
            box-shadow var(--duration-fast) var(--ease-object),
            filter var(--duration-fast) var(--ease-object);
        }

        .contact-trigger::before {
          content: "";
          position: absolute;
          left: 7px;
          right: 7px;
          top: 4px;
          height: 2px;
          background: var(--contact-detail);
          opacity: 0.68;
          pointer-events: none;
        }

        .contact-trigger.music-theme {
          border-radius: 3px;
          transform: rotate(-0.7deg);
        }

        .contact-trigger.story-theme {
          border-radius: 2px;
          transform: rotate(0.8deg);
        }

        .contact-trigger.cs-theme {
          border-width: 1px;
          box-shadow:
            0 0 0 2px rgba(79, 135, 149, 0.12),
            var(--shadow-contact);
        }

        .contact-trigger:hover {
          filter: brightness(1.04);
          box-shadow:
            3px 5px 0 rgba(63, 42, 29, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.46);
          transform: translateY(-2px);
        }

        .contact-trigger.music-theme:hover {
          transform: translateY(-2px) rotate(-0.7deg);
        }

        .contact-trigger.story-theme:hover {
          transform: translateY(-2px) rotate(0.8deg);
        }

        .contact-trigger:active {
          box-shadow: inset 0 2px 3px rgba(72, 47, 29, 0.18);
          transform: translateY(1px);
        }

        .contact-trigger:disabled {
          cursor: default;
          opacity: 0.64;
        }

        .envelope-icon {
          position: relative;
          display: block;
          width: 20px;
          height: 15px;
          flex: 0 0 20px;
          overflow: hidden;
          border: 2px solid currentColor;
          border-radius: 1px;
        }

        .envelope-icon::before,
        .envelope-icon::after {
          content: "";
          position: absolute;
          top: -7px;
          width: 15px;
          height: 15px;
          border-bottom: 1.75px solid currentColor;
        }

        .envelope-icon::before {
          left: -4px;
          transform: rotate(40deg);
        }

        .envelope-icon::after {
          right: -4px;
          transform: rotate(-40deg);
        }

        .contact-overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: max(22px, env(safe-area-inset-top))
            max(24px, env(safe-area-inset-right))
            max(22px, env(safe-area-inset-bottom))
            max(24px, env(safe-area-inset-left));
          background: rgba(50, 37, 28, 0.28);
          backdrop-filter: blur(1px);
        }

        .contact-panel {
          position: relative;
          z-index: var(--z-dialog);
          width: min(92vw, 500px);
          max-height: calc(100svh - 44px);
          overflow-y: auto;
          padding: 54px 40px 30px;
          border: 2px solid var(--contact-envelope-dark);
          border-radius: var(--radius-detail);
          background:
            linear-gradient(90deg, transparent 31px, rgba(126, 83, 43, 0.08) 32px, transparent 33px),
            repeating-linear-gradient(0deg, transparent 0 29px, rgba(126, 83, 43, 0.055) 30px),
            var(--contact-paper);
          color: var(--contact-ink);
          box-shadow:
            -16px 19px 0 rgba(60, 39, 25, 0.13),
            var(--shadow-deep);
          animation: letterIn var(--duration-object) var(--ease-object) both;
        }

        .contact-panel::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 8px;
          background: var(--contact-detail);
          opacity: 0.78;
        }

        .letter-fold {
          position: absolute;
          right: 0;
          top: 8px;
          width: 64px;
          height: 52px;
          border-left: 1px solid var(--contact-divider);
          border-bottom: 1px solid var(--contact-divider);
          background: color-mix(in srgb, var(--contact-envelope) 34%, transparent);
          clip-path: polygon(100% 0, 100% 100%, 0 0);
          pointer-events: none;
        }

        .panel-close {
          position: absolute;
          right: 14px;
          top: 17px;
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          padding: 0;
          border: 1px solid var(--contact-envelope-dark);
          border-radius: 50%;
          background: var(--contact-paper);
          color: inherit;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
        }

        .letter-header {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-right: 48px;
        }

        .letter-mark {
          position: relative;
          width: 56px;
          height: 41px;
          flex: 0 0 56px;
          overflow: hidden;
          border: 2px solid var(--contact-envelope-dark);
          border-radius: 2px;
          background: color-mix(in srgb, var(--contact-envelope) 42%, white);
        }

        .letter-mark::before,
        .letter-mark::after {
          content: "";
          position: absolute;
          top: -10px;
          width: 38px;
          height: 38px;
          border-bottom: 2px solid var(--contact-envelope-dark);
        }

        .letter-mark::before {
          left: -7px;
          transform: rotate(38deg);
        }

        .letter-mark::after {
          right: -7px;
          transform: rotate(-38deg);
        }

        .panel-kicker {
          margin: 0 0 5px;
          color: var(--contact-accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(31px, 5vw, 43px);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .panel-intro {
          max-width: 38ch;
          margin: 22px 0 0;
          color: color-mix(in srgb, var(--contact-ink) 78%, transparent);
          line-height: 1.65;
        }

        .contact-list {
          margin-top: 27px;
          border-bottom: 1px solid var(--contact-divider);
        }

        .contact-method {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          min-height: 70px;
          padding: 11px 0;
          border-top: 1px solid var(--contact-divider);
        }

        .contact-method a,
        .method-value {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) auto;
          align-items: center;
          gap: 11px;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }

        .contact-method a:hover strong {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .method-icon {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          color: var(--contact-accent);
        }

        .method-icon :global(svg) {
          width: 21px;
          height: 21px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .method-copy {
          min-width: 0;
        }

        .method-label {
          display: block;
          color: var(--contact-accent);
          font-size: 11px;
          font-weight: 800;
        }

        .method-copy strong {
          display: block;
          margin-top: 4px;
          font-size: 14px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .external-mark {
          color: var(--contact-accent);
          font-size: 15px;
        }

        .copy-button {
          min-width: 58px;
          min-height: 44px;
          padding: 7px 10px;
          border: 1px solid var(--contact-envelope-dark);
          border-radius: var(--radius-detail);
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .copy-button:hover {
          background: color-mix(in srgb, var(--contact-envelope) 24%, transparent);
        }

        .copy-feedback {
          min-height: 22px;
          margin: 14px 0 0;
          color: var(--state-success);
          font-size: 13px;
          font-weight: 700;
        }

        .privacy-note {
          margin-top: 13px;
          padding-top: 13px;
          border-top: 1px solid var(--contact-divider);
          color: color-mix(in srgb, var(--contact-ink) 60%, transparent);
          font-size: 11px;
          line-height: 1.55;
        }

        @keyframes letterIn {
          from { opacity: 0; transform: translateX(28px) rotate(0.6deg); }
          to { opacity: 1; transform: translateX(0) rotate(0); }
        }

        @media (max-width: 600px) {
          .contact-trigger {
            padding: 8px 10px;
          }

          .contact-overlay {
            align-items: flex-end;
            padding: 10px max(10px, env(safe-area-inset-right))
              max(10px, env(safe-area-inset-bottom))
              max(10px, env(safe-area-inset-left));
          }

          .contact-panel {
            width: 100%;
            max-height: min(86svh, 720px);
            padding: 50px 22px max(22px, env(safe-area-inset-bottom));
            box-shadow:
              0 -12px 0 rgba(60, 39, 25, 0.1),
              0 -24px 48px rgba(60, 39, 25, 0.22);
            animation-name: letterUp;
          }

          .letter-header {
            gap: 13px;
          }

          .letter-mark {
            width: 48px;
            height: 35px;
            flex-basis: 48px;
          }

          h2 {
            font-size: clamp(29px, 9vw, 38px);
          }

          .panel-intro {
            margin-top: 18px;
          }

          .contact-method {
            grid-template-columns: minmax(0, 1fr) auto;
          }

          .contact-method a,
          .method-value {
            grid-template-columns: 24px minmax(0, 1fr) auto;
            gap: 8px;
          }
        }

        @media (max-width: 370px) {
          .contact-trigger-label {
            display: none;
          }

          .contact-trigger {
            width: 46px;
            justify-content: center;
            padding: 8px;
          }
        }

        @keyframes letterUp {
          from { opacity: 0; transform: translateY(36px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-trigger {
            transition: none;
          }

          .contact-panel {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
