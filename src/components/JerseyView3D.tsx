"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { JerseyState } from "@/types/jersey";
import { drawJerseyTexture, resolveAssets } from "@/lib/jerseyTexture";

const PANEL_W = 2.3;
const PANEL_H = 2.76;
const BULGE = 0.44;

function makeBentPanel(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(PANEL_W, PANEL_H, 60, 30);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = x / (PANEL_W / 2);
    pos.setZ(i, BULGE * (1 - t * t));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function JerseyMesh({
  frontTex,
  backTex,
}: {
  frontTex: THREE.CanvasTexture;
  backTex: THREE.CanvasTexture;
}) {
  const geo = useMemo(() => makeBentPanel(), []);
  return (
    <group rotation={[0, 0, 0]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial
          map={frontTex}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      <mesh geometry={geo} rotation={[0, Math.PI, 0]} castShadow>
        <meshStandardMaterial
          map={backTex}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/** Build a dependency key from texture-relevant fields only. */
function textureKey(s: JerseyState): string {
  return [
    s.primaryColor,
    s.secondaryColor,
    s.accentColor,
    s.patternType,
    s.patternColor,
    s.patternScale,
    s.patternOpacity,
    s.patternTinted,
    s.patternDataUrl ? "p" + s.patternDataUrl.length : "0",
    s.logoDataUrl ? "l" + s.logoDataUrl.length : "0",
    s.playerName,
    s.playerNumber,
    s.sponsorText,
    s.customTexts.map((t) => `${t.value}|${t.color}|${t.placement}`).join(","),
  ].join("~");
}

export default function JerseyView3D({
  state,
  autoRotate,
}: {
  state: JerseyState;
  autoRotate: boolean;
}) {
  const frontCanvas = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("canvas") : null),
    [],
  );
  const backCanvas = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("canvas") : null),
    [],
  );
  const frontTex = useMemo(
    () => (frontCanvas ? new THREE.CanvasTexture(frontCanvas) : null),
    [frontCanvas],
  );
  const backTex = useMemo(
    () => (backCanvas ? new THREE.CanvasTexture(backCanvas) : null),
    [backCanvas],
  );

  const key = textureKey(state);

  useEffect(() => {
    if (!frontCanvas || !backCanvas || !frontTex || !backTex) return;
    let cancelled = false;
    (async () => {
      const assets = await resolveAssets(state);
      if (cancelled) return;
      drawJerseyTexture(frontCanvas, "front", state, assets);
      drawJerseyTexture(backCanvas, "back", state, assets);
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

  return (
    <Canvas
      camera={{ position: [0, 0.15, 5.2], fov: 34 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 2]}
      shadows
    >
      <color attach="background" args={["#ecebe7"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 5]} intensity={1.15} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} />
      {frontTex && backTex && <JerseyMesh frontTex={frontTex} backTex={backTex} />}
      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.32}
        blur={2.5}
        scale={7}
        far={3}
      />
      <OrbitControls
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={2.4}
        minDistance={3.6}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.26}
        maxPolarAngle={Math.PI * 0.74}
      />
    </Canvas>
  );
}
