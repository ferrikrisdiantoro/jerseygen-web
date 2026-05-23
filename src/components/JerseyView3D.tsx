"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { JerseyState, ZoneId } from "@/types/jersey";
import { drawBodyMapTexture, resolveAssets } from "@/lib/jerseyTexture";

// ============================================================
// Procedural jersey — every zone is its own mesh + material,
// so per-zone coloring & visibility ALWAYS works.
// ============================================================

const ZONE_IDS: ZoneId[] = [
  "body", "sleeves", "collar", "frontPanel", "backPanel", "stitches",
];

function buildBodyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.7, 1.0);
  shape.quadraticCurveTo(-0.55, 1.08, -0.2, 1.08);
  shape.quadraticCurveTo(0, 0.94, 0.2, 1.08);
  shape.quadraticCurveTo(0.55, 1.08, 0.7, 1.0);
  shape.lineTo(0.72, -1.05);
  shape.quadraticCurveTo(0.72, -1.18, 0.6, -1.18);
  shape.lineTo(-0.6, -1.18);
  shape.quadraticCurveTo(-0.72, -1.18, -0.72, -1.05);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.translate(0, 0, -0.21);
  return geo;
}

function buildOneSleeveGeometry(side: 1 | -1): THREE.BufferGeometry {
  const x0 = 0.7 * side;
  const x1 = 1.15 * side;
  const x1b = 1.0 * side;
  const shape = new THREE.Shape();
  shape.moveTo(x0, 1.0);
  shape.lineTo(x1, 0.85);
  shape.lineTo(x1b, 0.4);
  shape.lineTo(x0, 0.4);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.38,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geo.translate(0, 0, -0.19);
  return geo;
}

function buildSleevesGeometry(): THREE.BufferGeometry {
  const left = buildOneSleeveGeometry(-1);
  const right = buildOneSleeveGeometry(1);
  return mergeGeometries([left, right])!;
}

function buildCollarGeometry(): THREE.BufferGeometry {
  // a thin ring around the neck opening (full torus)
  const geo = new THREE.TorusGeometry(0.22, 0.05, 14, 36);
  geo.rotateX(Math.PI / 2);
  geo.translate(0, 1.0, 0);
  return geo;
}

function buildFrontPanelGeometry(): THREE.BufferGeometry {
  // horizontal accent stripe on the FRONT chest
  const geo = new THREE.BoxGeometry(1.42, 0.16, 0.04);
  geo.translate(0, 0.65, 0.235);
  return geo;
}

function buildBackPanelGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.42, 0.16, 0.04);
  geo.translate(0, 0.65, -0.235);
  return geo;
}

function buildStitchesGeometry(): THREE.BufferGeometry {
  // hem stripe at body bottom + small cuff bands at each sleeve end
  const hem = new THREE.BoxGeometry(1.45, 0.09, 0.45);
  hem.translate(0, -1.07, 0);
  const cuffL = new THREE.BoxGeometry(0.32, 0.08, 0.42);
  cuffL.translate(-1.0, 0.4, 0);
  const cuffR = new THREE.BoxGeometry(0.32, 0.08, 0.42);
  cuffR.translate(1.0, 0.4, 0);
  return mergeGeometries([hem, cuffL, cuffR])!;
}

function buildZoneGeometries() {
  return {
    body: buildBodyGeometry(),
    sleeves: buildSleevesGeometry(),
    collar: buildCollarGeometry(),
    frontPanel: buildFrontPanelGeometry(),
    backPanel: buildBackPanelGeometry(),
    stitches: buildStitchesGeometry(),
  } as Record<ZoneId, THREE.BufferGeometry>;
}

function Jersey({
  state,
  showBack,
}: {
  state: JerseyState;
  showBack: boolean;
}) {
  const geos = useMemo(() => buildZoneGeometries(), []);

  const materials = useMemo(() => {
    const make = (color: string) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        metalness: 0.04,
      });
    const m: Record<ZoneId, THREE.MeshStandardMaterial> = {
      body: make("#1d4ed8"),
      sleeves: make("#0b1f57"),
      collar: make("#0b1f57"),
      frontPanel: make("#fbbf24"),
      backPanel: make("#fbbf24"),
      stitches: make("#0b1f57"),
    };
    return m;
  }, []);

  const bodyCanvas = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("canvas") : null),
    [],
  );
  const bodyTex = useMemo(
    () => (bodyCanvas ? new THREE.CanvasTexture(bodyCanvas) : null),
    [bodyCanvas],
  );

  const meshRefs = useRef<Record<ZoneId, THREE.Mesh | null>>({
    body: null, sleeves: null, collar: null,
    frontPanel: null, backPanel: null, stitches: null,
  });

  useEffect(() => {
    // colors per zone
    for (const z of ZONE_IDS) {
      if (z === "body" && state.patternType !== "solid") continue;
      materials[z].color.set(state.zones[z].color);
      materials[z].map = null;
      materials[z].needsUpdate = true;
    }
    // body pattern (map)
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
          bodyTex.needsUpdate = true;
          materials.body.map = bodyTex;
          materials.body.color.set("#ffffff");
          materials.body.needsUpdate = true;
        })();
      }
    }
    // visibility per zone
    for (const z of ZONE_IDS) {
      const mesh = meshRefs.current[z];
      if (mesh) mesh.visible = state.zones[z].visible;
    }
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
      {ZONE_IDS.map((z) => (
        <mesh
          key={z}
          ref={(el) => {
            meshRefs.current[z] = el;
          }}
          geometry={geos[z]}
          material={materials[z]}
          castShadow
          receiveShadow
        />
      ))}
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
      camera={{ position: [0, 0.05, 4.2], fov: 30 }}
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

      <Bounds fit clip margin={1.15}>
        <Jersey state={state} showBack={showBack} />
      </Bounds>

      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.3}
        blur={2.6}
        scale={5}
        far={2.4}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={2.5}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.68}
        minAzimuthAngle={-Math.PI * 0.42}
        maxAzimuthAngle={Math.PI * 0.42}
      />
    </Canvas>
  );
}
