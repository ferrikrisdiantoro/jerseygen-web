"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Decal,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { JerseyState } from "@/types/jersey";
import { drawJerseyTexture, resolveAssets } from "@/lib/jerseyTexture";

const MODEL_URL = "/models/shirt.glb";
useGLTF.preload(MODEL_URL);

// ====================================================================
// KONFIG — kalau posisi desain di model kurang pas, ubah angka di sini.
// position: [x, y, z]  ·  scale: [lebar, tinggi, kedalaman]
// ====================================================================
const DECAL = {
  front: {
    position: [0, 0.06, 0.12] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.46, 0.56, 0.45] as [number, number, number],
  },
  back: {
    position: [0, 0.06, -0.12] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    scale: [0.46, 0.56, 0.45] as [number, number, number],
  },
};
// ====================================================================

function textureKey(s: JerseyState): string {
  return [
    s.primaryColor, s.secondaryColor, s.accentColor,
    s.patternType, s.patternColor, s.patternScale, s.patternOpacity, s.patternTinted,
    s.patternDataUrl ? "p" + s.patternDataUrl.length : "0",
    s.logoDataUrl ? "l" + s.logoDataUrl.length : "0",
    s.playerName, s.playerNumber, s.sponsorText,
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

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    const target = showBack ? Math.PI : 0;
    groupRef.current.rotation.y +=
      (target - groupRef.current.rotation.y) * 0.14;
  });

  const frontCanvas = useMemo(() => document.createElement("canvas"), []);
  const backCanvas = useMemo(() => document.createElement("canvas"), []);
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
      // clip=false → desain memenuhi kotak penuh, dipakai sebagai decal.
      drawJerseyTexture(frontCanvas, "front", state, assets, false, false);
      drawJerseyTexture(backCanvas, "back", state, assets, false, false);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      backTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;
      backTex.anisotropy = 8;
      frontTex.needsUpdate = true;
      backTex.needsUpdate = true;
      baseMat.color.set(state.primaryColor);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!geometry) return null;

  return (
    <group ref={groupRef}>
      <Center>
        <mesh geometry={geometry} material={baseMat} castShadow receiveShadow>
          <Decal
            position={DECAL.front.position}
            rotation={DECAL.front.rotation}
            scale={DECAL.front.scale}
          >
            <meshStandardMaterial
              map={frontTex}
              roughness={0.9}
              metalness={0.02}
              polygonOffset
              polygonOffsetFactor={-10}
              transparent
            />
          </Decal>
          <Decal
            position={DECAL.back.position}
            rotation={DECAL.back.rotation}
            scale={DECAL.back.scale}
          >
            <meshStandardMaterial
              map={backTex}
              roughness={0.9}
              metalness={0.02}
              polygonOffset
              polygonOffsetFactor={-10}
              transparent
            />
          </Decal>
        </mesh>
      </Center>
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
        position={[0, -0.8, 0]}
        opacity={0.3}
        blur={2.6}
        scale={5}
        far={2}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={1.4}
        maxDistance={5}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.68}
        minAzimuthAngle={-Math.PI * 0.42}
        maxAzimuthAngle={Math.PI * 0.42}
      />
    </Canvas>
  );
}
