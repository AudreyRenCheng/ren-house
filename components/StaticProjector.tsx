"use client";
/* eslint-disable @next/next/no-img-element -- This versioned static asset intentionally replaces the disabled 3D renderer. */

import { useState } from "react";

export const ENABLE_3D_PROJECTOR = false;

export default function StaticProjector({
  className = "",
}: {
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`static-projector ${className}`}
      aria-hidden="true"
      data-3d-enabled={ENABLE_3D_PROJECTOR ? "true" : "false"}
    >
      {!failed ? (
        <img
          src="/music/projector/projector-static-v1.webp"
          alt=""
          width="1000"
          height="760"
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="projector-fallback">Projector</span>
      )}
      <style jsx>{`
        .static-projector {
          position: relative;
          display: grid;
          width: 100%;
          aspect-ratio: 1000 / 760;
          place-items: center;
          pointer-events: none;
        }

        .static-projector img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          max-width: 100%;
        }
        .projector-fallback {
          display: grid; width: 100%; height: 100%; place-items: center;
          border: 1px dashed rgba(38, 73, 82, .35); border-radius: 12px;
          background: #d8cbb8; color: #385c64; font-weight: 700;
        }
      `}</style>
    </span>
  );
}
