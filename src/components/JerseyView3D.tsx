"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  Decal,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { JerseyState } from "@/types/jersey";
import {
  drawBodyMapTexture,
  drawJerseyTexture,
  resolveAssets,
} from "@/lib/jerseyTexture";

const MODEL_URL = "/models/shirt.glb";
useGLTF.preload(MODEL_URL);

// ====== KONFIG DECAL (sesuaikan kalau posisi/skala desain di model kurang pas) ======
const FRONT_DECAL = {
  position: [0, 0.04, 0.13] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [0.46, 0.56, 0.45] as [number, number, number],
};
const BACK_DECAL = {
  position: [0, 0.04, -0.13] as [number, number, number],
  rotation: [0, Math.PI, 0] as [number, number, number],
  scale: [0.46, 0.56, 0.45] as [number, number, number],
};
// =====================================================================================

function textureKey(s: JerseyState): string {
  return [
    s.zones.body.color, s.zones.sleeves.color, s.zones.collar.color,
    s.zones.frontPanel.color, s.zones.backPanel.color, s.zones.stitches.color,
    s.patternType, s.patternColor, s.patternScale, s.patternOpacity, s.patternTinted,
    s.patternDataUrl ? "p" + s.patternDataUrl.length : "0",
    s.logoDataUrl ? "l" + s.logoDataUrl.length : "0",
    s.playerName, s.playerNumber,
    s.sponsorMode, s.sponsorText,
    s.sponsorImageDataUrl ? "s" + s.sponsorImageDataUrl.length : "0",
    s.font,
    s.customTexts.map((t) => `${t.value}|${t.color}|${t.placement}`).join(","),
  ].join("~");
}

function ShirtModel({
  state,
  showBack,
}: {
  state: JerseyState;
  showBack: boolean;
}) {
  const { scene } = useGLTF(MODEL_URL);

  const geometry = useMemo(() => {
    let g: THREE.BufferGeometry | null = null;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!g && m.isMesh) g = m.geometry;
    });
    return g;
  }, [scene]);

  // canvases + textures
  const bodyCanvas = useMemo(() => document.createElement("canvas"), []);
  const frontCanvas = useMemo(() => document.createElement("canvas"), []);
  const backCanvas = useMemo(() => document.createElement("canvas"), []);
  const bodyTex = useMemo(
    () => new THREE.CanvasTexture(bodyCanvas),
    [bodyCanvas],
  );
  const frontTex = useMemo(
    () => new THREE.CanvasTexture(frontCanvas),
    [frontCanvas],
  );
  const backTex = useMemo(
    () => new THREE.CanvasTexture(backCanvas),
    [backCanvas],
  );
  const baseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.04 }),
    [],
  );

  const key = textureKey(state);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const assets = await resolveAssets(state);
      if (cancelled) return;

      // body color + pattern (as material map)
      if (state.patternType === "solid") {
        baseMat.map = null;
        baseMat.color.set(state.zones.body.color);
      } else {
        drawBodyMapTexture(bodyCanvas, state, assets);
        bodyTex.colorSpace = THREE.SRGBColorSpace;
        bodyTex.anisotropy = 8;
        const tileable =
          state.patternType === "stripes" ||
          state.patternType === "hoops" ||
          state.patternType === "grid" ||
          state.patternType === "chevron" ||
          state.patternType === "custom";
        if (tileable) {
          bodyTex.wrapS = THREE.RepeatWrapping;
          bodyTex.wrapT = THREE.RepeatWrapping;
          bodyTex.repeat.set(2, 2);
        } else {
          bodyTex.wrapS = THREE.ClampToEdgeWrapping;
          bodyTex.wrapT = THREE.ClampToEdgeWrapping;
          bodyTex.repeat.set(1, 1);
        }
        bodyTex.needsUpdate = true;
        baseMat.map = bodyTex;
        baseMat.color.set("#ffffff");
      }
      baseMat.needsUpdate = true;

      // front + back design decals (sponsor / number / name / logo / customTexts)
      await drawJerseyTexture(frontCanvas, "front", state, assets, false, false);
      await drawJerseyTexture(backCanvas, "back", state, assets, false, false);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      backTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;
      backTex.anisotropy = 8;
      frontTex.needsUpdate = true;
      backTex.needsUpdate = true;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    const target = showBack ? Math.PI : 0;
    groupRef.current.rotation.y +=
      (target - groupRef.current.rotation.y) * 0.14;
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={baseMat} castShadow receiveShadow>
        <Decal
          position={FRONT_DECAL.position}
          rotation={FRONT_DECAL.rotation}
          scale={FRONT_DECAL.scale}
        >
          <meshStandardMaterial
            map={frontTex}
            transparent
            polygonOffset
            polygonOffsetFactor={-10}
            roughness={0.9}
            metalness={0.02}
          />
        </Decal>
        <Decal
          position={BACK_DECAL.position}
          rotation={BACK_DECAL.rotation}
          scale={BACK_DECAL.scale}
        >
          <meshStandardMaterial
            map={backTex}
            transparent
            polygonOffset
            polygonOffsetFactor={-10}
            roughness={0.9}
            metalness={0.02}
          />
        </Decal>
      </mesh>
    </group>
  );
}

export default function JerseyView3D({
  state,
  showBack,
}: {
  state: JerseyState;
  showBack: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 28 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 2]}
      shadows
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#ecebe7"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} castShadow />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.55} />
      <directionalLight position={[0, 2, -5]} intensity={0.55} />

      <Suspense fallback={null}>
        <Bounds fit clip margin={1.15}>
          <ShirtModel state={state} showBack={showBack} />
        </Bounds>
      </Suspense>

      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.3}
        blur={2.6}
        scale={5}
        far={2.2}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={1.4}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.68}
        minAzimuthAngle={-Math.PI * 0.42}
        maxAzimuthAngle={Math.PI * 0.42}
      />
    </Canvas>
  );
}
