"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import ProjectorErrorBoundary from "@/components/projector-3d/ProjectorErrorBoundary";
import ProjectorFallback from "@/components/projector-3d/ProjectorFallback";

const DynamicProjectorCanvas = dynamic(
  () => import("@/components/projector-3d/ProjectorCanvas"),
  {
    ssr: false,
    loading: () => null,
  }
);

type ProjectorProps = {
  isLit?: boolean;
  isDropTarget?: boolean;
  className?: string;
  enableCanvas?: boolean;
};

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

function canUseProjector() {
  const canvas = document.createElement("canvas");
  const hasWebGL = Boolean(
    canvas.getContext("webgl2", { powerPreference: "low-power" }) ||
      canvas.getContext("webgl", { powerPreference: "low-power" })
  );
  if (!hasWebGL) return false;

  const memory = (navigator as NavigatorWithMemory).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (typeof memory === "number" && memory < 4) return false;
  if (typeof cores === "number" && cores < 4) return false;

  return true;
}

export default function Projector({
  isLit = false,
  isDropTarget = false,
  className = "",
  enableCanvas = false,
}: ProjectorProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isCapable, setIsCapable] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const initialize = window.setTimeout(() => {
      setIsCapable(canUseProjector());
      setIsMobile(window.matchMedia("(max-width: 600px)").matches);
      setIsDocumentVisible(document.visibilityState === "visible");
      if (!root || !("IntersectionObserver" in window)) {
        setIsNearViewport(true);
      }
    }, 0);

    if (!root || !("IntersectionObserver" in window)) {
      return () => window.clearTimeout(initialize);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "280px 0px" }
    );
    observer.observe(root);
    return () => {
      window.clearTimeout(initialize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsDocumentVisible(document.visibilityState === "visible");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleFailure = useCallback(() => {
    setHasFailed(true);
    setIsReady(false);
  }, []);
  const shouldRenderCanvas =
    enableCanvas && isCapable && isNearViewport && isDocumentVisible && !hasFailed;

  return (
    <span
      ref={rootRef}
      className={`projector-3d ${isLit ? "is-lit" : ""} ${
        isDropTarget ? "is-drop-target" : ""
      } ${className}`}
      aria-hidden="true"
      data-renderer={isReady ? "webgl" : "fallback"}
    >
      <ProjectorFallback hidden={isReady} isLit={isLit} isMobile={isMobile} />

      {shouldRenderCanvas && (
        <ProjectorErrorBoundary
          fallback={null}
          onError={handleFailure}
        >
          <span className={`projector-canvas-layer ${isReady ? "is-ready" : ""}`}>
            <DynamicProjectorCanvas
              isLit={isLit}
              isMobile={isMobile}
              onReady={handleReady}
            />
          </span>
        </ProjectorErrorBoundary>
      )}

      <style jsx>{`
        .projector-3d {
          position: absolute;
          inset: 0;
          display: block;
          overflow: hidden;
          pointer-events: none;
        }

        .projector-3d.is-drop-target {
          filter: brightness(1.08) drop-shadow(0 0 8px rgba(170, 123, 63, 0.42));
        }

        .projector-canvas-layer {
          position: absolute;
          inset: 0;
          display: block;
          opacity: 0;
          transition: opacity 180ms ease-out;
        }

        .projector-canvas-layer.is-ready {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .projector-canvas-layer {
            transition: none;
          }
        }
      `}</style>
    </span>
  );
}
