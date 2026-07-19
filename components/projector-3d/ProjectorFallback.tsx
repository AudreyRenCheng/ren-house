"use client";

type ProjectorFallbackProps = {
  className?: string;
  hidden?: boolean;
  isLit?: boolean;
  isMobile?: boolean;
};

export default function ProjectorFallback({
  className = "",
  hidden = false,
  isLit = false,
  isMobile = false,
}: ProjectorFallbackProps) {
  return (
    <span
      className={`projector-fallback ${isLit ? "is-lit" : ""} ${
        isMobile ? "is-mobile" : ""
      } ${className}`}
      aria-hidden="true"
      data-hidden={hidden ? "true" : "false"}
    >
      <span className="projector-fallback-image" />

      <style jsx>{`
        .projector-fallback {
          position: absolute;
          inset: 0;
          display: block;
          opacity: 1;
          transition: opacity 180ms ease-out;
          pointer-events: none;
        }

        .projector-fallback[data-hidden="true"] {
          opacity: 0;
        }

        .projector-fallback-image {
          position: absolute;
          inset: 0;
          display: block;
          background: url("/images/projector/projector-fallback.webp") center / contain no-repeat;
          filter: brightness(1.1) saturate(1.1) contrast(0.98);
        }

        .projector-fallback.is-lit .projector-fallback-image {
          inset: auto auto 18px 34px;
          width: 300px;
          aspect-ratio: 1000 / 760;
          filter: brightness(0.62) saturate(0.76) contrast(1.02) hue-rotate(-5deg);
        }

        .projector-fallback.is-lit.is-mobile .projector-fallback-image {
          right: auto;
          bottom: 24px;
          left: 50%;
          width: min(70vw, 250px);
          transform: translateX(-50%);
        }

        @media (prefers-reduced-motion: reduce) {
          .projector-fallback {
            transition: none;
          }
        }
      `}</style>
    </span>
  );
}
