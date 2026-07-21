"use client";
/* eslint-disable @next/next/no-img-element -- This versioned static asset intentionally replaces the disabled 3D renderer. */

export const ENABLE_3D_PROJECTOR = false;

export default function StaticProjector({
  isLit = false,
  isDropTarget = false,
  className = "",
}: {
  isLit?: boolean;
  isDropTarget?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`static-projector ${isLit ? "is-lit" : ""} ${isDropTarget ? "is-drop-target" : ""} ${className}`}
      aria-hidden="true"
      data-3d-enabled={ENABLE_3D_PROJECTOR ? "true" : "false"}
    >
      <img
        src="/music/projector/projector-static-v1.webp"
        alt=""
        width="1000"
        height="760"
        loading="lazy"
        decoding="async"
      />
      <style jsx>{`
        .static-projector {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }

        .static-projector img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: filter 180ms ease, transform 180ms ease;
        }

        .static-projector.is-drop-target img {
          filter: brightness(1.08) drop-shadow(0 0 8px rgba(170, 123, 63, 0.42));
          transform: translateY(-2px);
        }

        .static-projector.is-lit img {
          filter: brightness(0.68) saturate(0.82) contrast(1.02);
        }

        @media (prefers-reduced-motion: reduce) {
          .static-projector img { transition: none; }
        }
      `}</style>
    </span>
  );
}
