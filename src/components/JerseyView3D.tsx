"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { JerseyState, ZoneId } from "@/types/jersey";
import { drawBodyMapTexture, resolveAssets } from "@/lib/jerseyTexture";

const MODEL_URL = "/models/jersey1.glb";
useGLTF.preload(MODEL_URL);

const ZONE_IDS: ZoneId[] = [
  "body", "sleeves", "collar", "frontPanel", "backPanel", "stitches",
];

/** Classify a GLB mesh into a colorable zone based on the designer's naming. */
function classifyZone(name: string): ZoneId | null {
  if (/LogoMesh/i.test(name)) return null; // placeholder logo patches → hide
  if (/^HMC MANGFX/i.test(name)) return "sleeves";
  if (/^PROBASKET CUELLO/i.test(name)) return "collar";
  if (/^HMC DEL/i.test(name)) return "frontPanel";
  if (/^HMC ESP/i.test(name)) return "backPanel";
  if (/^PROBASKET ADULTO CURA/i.test(name)) return "body";
  if (/^Puntada|^TexturedStitchess/i.test(name)) return "stitches";
  return "body";
}

function ShirtModel({
  state,
  showBack,
}: {
  state: JerseyState;
  showBack: boolean;
}) {
  const { scene } = useGLTF(MODEL_URL);

  const materials = useMemo(() => {
    const make = () =>
      new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.04 });
    const m: Record<ZoneId, THREE.MeshStandardMaterial> = {
      body: make(),
      sleeves: make(),
      collar: make(),
      frontPanel: make(),
      backPanel: make(),
      stitches: make(),
    };
    return m;
  }, []);

  const sceneClone = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const z = classifyZone(mesh.name);
      if (z === null) {
        mesh.visible = false;
        return;
      }
      mesh.material = materials[z];
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.zone = z;
    });
    return clone;
  }, [scene, materials]);

  const bodyCanvas = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("canvas") : null),
    [],
  );
  const bodyTex = useMemo(
    () => (bodyCanvas ? new THREE.CanvasTexture(bodyCanvas) : null),
    [bodyCanvas],
  );

  useEffect(() => {
    for (const z of ZONE_IDS) {
      if (z === "body" && state.patternType !== "solid") continue;
      materials[z].color.set(state.zones[z].color);
      materials[z].map = null;
      materials[z].needsUpdate = true;
    }
    if (bodyCanvas && bodyTex) {
      if (state.patternType === "solid") {
        materials.body.map = null;
        materials.body.color.set(state.zones.body.color);
      } else {
        (async () => {
          const assets = await resolveAssets(state);
          drawBodyMapTexture(bodyCanvas, state, assets);
          bodyTex.colorSpace = THREE.SRGBColorSpace;
          bodyTex.anisotropy = 8;
          // Tile-friendly patterns repeat across the body's UV islands
          // (front and back of the jersey are separate UV regions) so
          // the pattern looks continuous instead of split.
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
          materials.body.map = bodyTex;
          materials.body.color.set("#ffffff");
          materials.body.needsUpdate = true;
        })();
      }
    }
    sceneClone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const z = mesh.userData.zone as ZoneId | undefined;
      if (z) mesh.visible = state.zones[z].visible;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.zones,
    state.patternType,
    state.patternColor,
    state.patternScale,
    state.patternOpacity,
    state.patternTinted,
    state.patternDataUrl,
    materials,
    sceneClone,
  ]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    const target = showBack ? Math.PI : 0;
    groupRef.current.rotation.y +=
      (target - groupRef.current.rotation.y) * 0.14;
  });

  return (
    <group ref={groupRef}>
      <primitive object={sceneClone} />
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
      camera={{ position: [0, 0, 3], fov: 30 }}
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
