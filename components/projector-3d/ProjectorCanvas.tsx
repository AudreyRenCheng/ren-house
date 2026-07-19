"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  Camera,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";

type ProjectorCanvasProps = {
  isLit: boolean;
  isMobile: boolean;
  onReady: () => void;
};

type ActiveLayout = {
  modelPosition: Vector3;
  modelQuaternion: Quaternion;
  modelScale: number;
  lensPosition: Vector3;
  targetCorners: [Vector3, Vector3, Vector3, Vector3];
};

type ProjectorVisualMode = "preview" | "projection";

const PROJECTOR_PALETTE = {
  preview: {
    wood: "#b97b50",
    brass: "#d9b658",
    body: "#f5ead2",
    hardware: "#2e7772",
    glass: "#36939a",
    emissive: "#164f52",
  },
  projection: {
    wood: "#76503b",
    brass: "#9d824a",
    body: "#b9b1a2",
    hardware: "#1d4a44",
    glass: "#225b5a",
    emissive: "#0c2927",
  },
} as const;

const LOCAL_LENS_EXIT = new Vector3(3.02, 0.63, 0.08);
const WORLD_UP = new Vector3(0, 1, 0);

function useProjectorModel(
  onReady: () => void,
  visualMode: ProjectorVisualMode
) {
  const { scene } = useGLTF("/models/projector/projector.glb");
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const isPreview = visualMode === "preview";
    const palette = PROJECTOR_PALETTE[visualMode];

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      const recolorMaterial = (source: MeshStandardMaterial) => {
        const material = source.clone();
        const objectName = object.name.toLowerCase();
        const materialName = source.name.toLowerCase();

        if (objectName.includes("wood") || materialName.includes("wood")) {
          material.color = new Color(palette.wood);
          material.roughness = isPreview ? 0.7 : 0.78;
        } else if (
          objectName.includes("brass") ||
          objectName.includes("switch") ||
          objectName.includes("status") ||
          materialName.includes("brass")
        ) {
          material.color = new Color(palette.brass);
          material.metalness = isPreview ? 0.36 : 0.42;
          material.roughness = isPreview ? 0.42 : 0.48;
        } else if (
          objectName.includes("body") ||
          objectName.includes("frame") ||
          materialName.includes("warm matte")
        ) {
          material.color = new Color(palette.body);
          material.metalness = 0.02;
          material.roughness = isPreview ? 0.74 : 0.82;
        } else {
          material.color = new Color(palette.hardware);
          material.metalness = isPreview ? 0.12 : 0.16;
          material.roughness = isPreview ? 0.54 : 0.62;
        }

        if (objectName.includes("glass")) {
          material.color = new Color(palette.glass);
          material.emissive = new Color(palette.emissive);
          material.emissiveIntensity = isPreview ? 0.22 : 0.18;
        }

        return material;
      };

      object.material = Array.isArray(object.material)
        ? object.material.map((material) =>
            material instanceof MeshStandardMaterial
              ? recolorMaterial(material)
              : material.clone()
          )
        : object.material instanceof MeshStandardMaterial
          ? recolorMaterial(object.material)
          : object.material.clone();
    });

    return clone;
  }, [scene, visualMode]);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, model, onReady]);

  return model;
}

function PreviewProjector({
  isMobile,
  onReady,
}: Pick<ProjectorCanvasProps, "isMobile" | "onReady">) {
  const model = useProjectorModel(onReady, "preview");
  return (
    <group scale={isMobile ? 0.82 : 0.9} position={[0.1, 0.2, 0]}>
      <primitive object={model} />
    </group>
  );
}

function makeBeamGeometry(
  lens: Vector3,
  targetCorners: [Vector3, Vector3, Vector3, Vector3]
) {
  const nearDistance = 9;
  const nearCorners = targetCorners.map((corner) =>
    corner.clone().sub(lens).normalize().multiplyScalar(nearDistance).add(lens)
  );
  const vertices = [...nearCorners, ...targetCorners].flatMap((point) => [
    point.x,
    point.y,
    point.z,
  ]);
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex([
    0, 4, 5, 0, 5, 1,
    1, 5, 6, 1, 6, 2,
    2, 6, 7, 2, 7, 3,
    3, 7, 4, 3, 4, 0,
  ]);
  geometry.computeVertexNormals();
  return geometry;
}

function makeBeamFillGeometry(
  lens: Vector3,
  targetCorners: [Vector3, Vector3, Vector3, Vector3]
) {
  const vertices = [lens, ...targetCorners].flatMap((point) => [
    point.x,
    point.y,
    point.z,
  ]);
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
  geometry.computeVertexNormals();
  return geometry;
}

function measureActiveLayout(
  width: number,
  height: number,
  isMobile: boolean,
  camera: Camera
): ActiveLayout {
  const surface = document.querySelector<HTMLElement>(".projection-surface");
  const rect = surface?.getBoundingClientRect();
  const storyNoteRect = document
    .querySelector<HTMLElement>(".story-note")
    ?.getBoundingClientRect();
  const fallbackWidth = Math.min(width * (isMobile ? 0.88 : 0.7), 760);
  const fallbackHeight = fallbackWidth / 1.6;
  const fallbackLeft = (width - fallbackWidth) / 2;
  const fallbackTop = isMobile
    ? Math.max(24, height * 0.12)
    : (height - fallbackHeight) / 2 - 40;
  const left = rect?.left ?? fallbackLeft;
  const right = rect?.right ?? fallbackLeft + fallbackWidth;
  const top = rect?.top ?? fallbackTop;
  const bottom = rect?.bottom ?? fallbackTop + fallbackHeight;
  const wallDepth = isMobile ? -10 : -9;

  camera.updateMatrixWorld(true);

  function pixelToPlane(pixelX: number, pixelY: number, planeDepth: number) {
    const point = new Vector3(
      (pixelX / width) * 2 - 1,
      -(pixelY / height) * 2 + 1,
      0.5
    ).unproject(camera);
    const direction = point.sub(camera.position).normalize();
    const distance = (planeDepth - camera.position.z) / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  }

  const targetCorners: [Vector3, Vector3, Vector3, Vector3] = [
    pixelToPlane(left, top, wallDepth),
    pixelToPlane(right, top, wallDepth),
    pixelToPlane(right, bottom, wallDepth),
    pixelToPlane(left, bottom, wallDepth),
  ];
  const targetCenter = targetCorners
    .reduce((sum, corner) => sum.add(corner), new Vector3())
    .multiplyScalar(0.25);
  const isCompactDesktop = !isMobile && width < 1000;
  const modelScale = isMobile ? 0.3 : isCompactDesktop ? 0.36 : 0.48;
  const mobileAnchorY = Math.min(
    height * 0.79,
    Math.max(height * 0.72, (storyNoteRect?.bottom ?? 0) + height * 0.14)
  );
  const modelPosition = pixelToPlane(
    isMobile ? width * 0.5 : isCompactDesktop ? width * 0.29 : width * 0.22,
    isMobile ? mobileAnchorY : isCompactDesktop ? height * 0.76 : height * 0.75,
    isMobile ? 1.4 : 1.8
  );
  const aimDirection = targetCenter.clone().sub(modelPosition).normalize();
  const forward = isMobile
    ? aimDirection
    : new Vector3(aimDirection.x, 0, aimDirection.z).normalize();
  const up = WORLD_UP.clone()
    .sub(forward.clone().multiplyScalar(WORLD_UP.dot(forward)))
    .normalize();
  const side = forward.clone().cross(up).normalize();
  const orientation = new Matrix4().makeBasis(forward, up, side);
  const modelQuaternion = new Quaternion().setFromRotationMatrix(orientation);
  const lensPosition = LOCAL_LENS_EXIT.clone()
    .multiplyScalar(modelScale)
    .applyQuaternion(modelQuaternion)
    .add(modelPosition);

  return {
    modelPosition,
    modelQuaternion,
    modelScale,
    lensPosition,
    targetCorners,
  };
}

function ActiveProjector({
  isMobile,
  onReady,
}: Pick<ProjectorCanvasProps, "isMobile" | "onReady">) {
  const model = useProjectorModel(onReady, "projection");
  const { camera, size, invalidate } = useThree();
  const [layoutRevision, setLayoutRevision] = useState(0);
  const layout = useMemo(() => {
    void layoutRevision;
    return measureActiveLayout(size.width, size.height, isMobile, camera);
  }, [camera, isMobile, layoutRevision, size.height, size.width]);
  const beamGeometry = useMemo(
    () => makeBeamGeometry(layout.lensPosition, layout.targetCorners),
    [layout]
  );
  const beamFillGeometry = useMemo(
    () => makeBeamFillGeometry(layout.lensPosition, layout.targetCorners),
    [layout]
  );

  useEffect(() => {
    invalidate();
    return () => {
      beamGeometry.dispose();
      beamFillGeometry.dispose();
    };
  }, [beamFillGeometry, beamGeometry, invalidate]);

  useEffect(() => {
    const projectionMode = document.querySelector<HTMLElement>(".projection-mode");
    if (!projectionMode) return;
    const activeProjectionMode = projectionMode;

    let firstFrame = 0;
    let settleFrame = 0;
    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(settleFrame);
      firstFrame = window.requestAnimationFrame(() => {
        settleFrame = window.requestAnimationFrame(() => {
          setLayoutRevision((revision) => revision + 1);
          invalidate();
        });
      });
    };
    const resizeObserver = new ResizeObserver(scheduleMeasurement);

    function observeProjectionElements() {
      resizeObserver.disconnect();
      const surface = activeProjectionMode.querySelector<HTMLElement>(".projection-surface");
      const storyNote = activeProjectionMode.querySelector<HTMLElement>(".story-note");
      if (surface) resizeObserver.observe(surface);
      if (storyNote) resizeObserver.observe(storyNote);
    }

    const mutationObserver = new MutationObserver(() => {
      observeProjectionElements();
      scheduleMeasurement();
    });
    mutationObserver.observe(activeProjectionMode, { childList: true });
    activeProjectionMode.addEventListener("animationend", scheduleMeasurement, true);
    window.addEventListener("resize", scheduleMeasurement);
    observeProjectionElements();
    scheduleMeasurement();

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(settleFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      activeProjectionMode.removeEventListener("animationend", scheduleMeasurement, true);
      window.removeEventListener("resize", scheduleMeasurement);
    };
  }, [invalidate]);

  return (
    <>
      <group
        position={layout.modelPosition}
        quaternion={layout.modelQuaternion}
        scale={layout.modelScale}
      >
        <primitive object={model} />
      </group>

      <mesh geometry={beamFillGeometry} renderOrder={1}>
        <meshBasicMaterial
          color="#f4cf82"
          transparent
          opacity={0.045}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={beamGeometry} renderOrder={2}>
        <meshBasicMaterial
          color="#ffe4a3"
          transparent
          opacity={0.02}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

export default function ProjectorCanvas({
  isLit,
  isMobile,
  onReady,
}: ProjectorCanvasProps) {
  if (isLit) {
    return (
      <Canvas
        className="projector-r3f-canvas"
        frameloop="demand"
        dpr={isMobile ? [1, 1.2] : [1, 1.5]}
        camera={{
          fov: isMobile ? 40 : 42,
          near: 0.1,
          far: 80,
          position: isMobile ? [0, 3.6, 13] : [6.5, 4.5, 13],
        }}
        gl={{
          alpha: true,
          antialias: false,
          depth: true,
          powerPreference: "low-power",
        }}
        onCreated={({ camera, invalidate }) => {
          camera.lookAt(isMobile ? 0 : -0.4, isMobile ? -0.35 : 0, -4);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
          invalidate();
        }}
      >
        <ambientLight intensity={0.54} color="#d7cbb8" />
        <directionalLight position={[-5, 8, 7]} intensity={0.95} color="#d5bd98" />
        <directionalLight position={[6, 3, -4]} intensity={0.18} color="#aeb9c1" />
        <ActiveProjector isMobile={isMobile} onReady={onReady} />
      </Canvas>
    );
  }

  return (
    <Canvas
      className="projector-r3f-canvas"
      frameloop="demand"
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      camera={{
        fov: isMobile ? 36 : 34,
        near: 0.1,
        far: 80,
        position: isMobile ? [6.05, 4.9, 8] : [6.15, 4.9, 7.95],
      }}
      gl={{
        alpha: true,
        antialias: false,
        depth: true,
        powerPreference: "low-power",
      }}
      onCreated={({ camera, invalidate }) => {
        camera.lookAt(0.12, 0.62, 0);
        camera.updateProjectionMatrix();
        invalidate();
      }}
    >
      <ambientLight intensity={1.08} color="#f3ead8" />
      <directionalLight position={[-4.5, 7, 5]} intensity={1.88} color="#f2d9a7" />
      <directionalLight position={[5, 3, -4]} intensity={0.66} color="#b9d8d8" />
      <PreviewProjector isMobile={isMobile} onReady={onReady} />
    </Canvas>
  );
}
