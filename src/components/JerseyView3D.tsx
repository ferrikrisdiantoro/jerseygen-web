"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { JerseyState } from "@/types/jersey";
import { drawJerseyTexture, resolveAssets } from "@/lib/jerseyTexture";

// Jersey silhouette in world units (y-up). Derived from the 400x480 texture path.
const SHAPE_MINX = -0.9775;
const SHAPE_SPANX = 1.955;
const SHAPE_MINY = -1.2075;
const SHAPE_SPANY = 2.2995;

// Region of the texture canvas the jersey artwork occupies (path bbox / canvas).
const TEX_U0 = 30 / 400;
const TEX_USPAN = 340 / 400;
const TEX_V0 = 1 - 450 / 480;
const TEX_VSPAN = (450 - 50) / 480;

const DEPTH = 0.26;

function shade(hex: string, percent: number): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  const adj = (v: number) =>
    Math.max(0, Math.min(255, v + Math.round(255 * (percent / 100))));
  const r = adj((num >> 16) & 0xff);
  const g = adj((num >> 8) & 0xff);
  const b = adj(num & 0xff);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function makeJerseyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.7475, 0.92);
  s.lineTo(-0.2875, 1.092);
  s.lineTo(-0.1725, 0.978);
  s.quadraticCurveTo(0, 0.8625, 0.1725, 0.978);
  s.lineTo(0.2875, 1.092);
  s.lineTo(0.7475, 0.92);
  s.lineTo(0.9775, 0.46);
  s.lineTo(0.69, 0.345);
  s.lineTo(0.69, -1.092);
  s.quadraticCurveTo(0.69, -1.2075, 0.575, -1.2075);
  s.lineTo(-0.575, -1.2075);
  s.quadraticCurveTo(-0.69, -1.2075, -0.69, -1.092);
  s.lineTo(-0.69, 0.345);
  s.lineTo(-0.9775, 0.46);
  s.closePath();
  return s;
}

/**
 * Solid jersey geometry. Triangles sorted into 3 contiguous groups by face
 * normal (robust — flat caps always have normal ±Z):
 *   0 = front cap -> front design   1 = back cap -> back design   2 = walls -> edge
 */
function buildJerseyGeometry(): THREE.BufferGeometry {
  const raw = new THREE.ExtrudeGeometry(makeJerseyShape(), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 24,
  });
  raw.computeBoundingBox();
  const bb = raw.boundingBox!;
  raw.translate(0, 0, -(bb.min.z + bb.max.z) / 2);

  const src = raw.index ? raw.toNonIndexed() : raw;
  if (!src.attributes.normal) src.computeVertexNormals();
  const pos = src.attributes.position;
  const nrm = src.attributes.normal;
  const triCount = pos.count / 3;

  const front: number[] = [];
  const back: number[] = [];
  const wall: number[] = [];
  for (let t = 0; t < triCount; t++) {
    const nz =
      (nrm.getZ(t * 3) + nrm.getZ(t * 3 + 1) + nrm.getZ(t * 3 + 2)) / 3;
    if (nz > 0.7) front.push(t);
    else if (nz < -0.7) back.push(t);
    else wall.push(t);
  }

  const order = [...front, ...back, ...wall];
  const total = pos.count;
  const newPos = new Float32Array(total * 3);
  const newNrm = new Float32Array(total * 3);
  const newUv = new Float32Array(total * 2);

  let w = 0;
  for (let oi = 0; oi < order.length; oi++) {
    const t = order[oi];
    const isBack = oi >= front.length && oi < front.length + back.length;
    for (let k = 0; k < 3; k++) {
      const si = t * 3 + k;
      const x = pos.getX(si);
      const y = pos.getY(si);
      newPos[w * 3] = x;
      newPos[w * 3 + 1] = y;
      newPos[w * 3 + 2] = pos.getZ(si);
      newNrm[w * 3] = nrm.getX(si);
      newNrm[w * 3 + 1] = nrm.getY(si);
      newNrm[w * 3 + 2] = nrm.getZ(si);
      const nx = (x - SHAPE_MINX) / SHAPE_SPANX;
      const ny = (y - SHAPE_MINY) / SHAPE_SPANY;
      const u = isBack ? 1 - nx : nx;
      newUv[w * 2] = TEX_U0 + u * TEX_USPAN;
      newUv[w * 2 + 1] = TEX_V0 + ny * TEX_VSPAN;
      w++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(newPos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(newNrm, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(newUv, 2));
  geo.clearGroups();
  geo.addGroup(0, front.length * 3, 0);
  geo.addGroup(front.length * 3, back.length * 3, 1);
  geo.addGroup((front.length + back.length) * 3, wall.length * 3, 2);
  return geo;
}

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

function Jersey({
  geo,
  materials,
  showBack,
}: {
  geo: THREE.BufferGeometry;
  materials: THREE.Material[];
  showBack: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const target = showBack ? Math.PI : 0;
    ref.current.rotation.y += (target - ref.current.rotation.y) * 0.14;
  });
  return (
    <group ref={ref}>
      <mesh geometry={geo} material={materials} castShadow receiveShadow />
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
  const geo = useMemo(() => buildJerseyGeometry(), []);

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

  const materials = useMemo(() => {
    const front = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.02 });
    const back = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.02 });
    const edge = new THREE.MeshStandardMaterial({
      color: "#334155",
      roughness: 0.65,
      metalness: 0.05,
    });
    if (frontTex) front.map = frontTex;
    if (backTex) back.map = backTex;
    return [front, back, edge];
  }, [frontTex, backTex]);

  const key = textureKey(state);

  useEffect(() => {
    if (!frontCanvas || !backCanvas || !frontTex || !backTex) return;
    let cancelled = false;
    (async () => {
      const assets = await resolveAssets(state);
      if (cancelled) return;
      drawJerseyTexture(frontCanvas, "front", state, assets, false);
      drawJerseyTexture(backCanvas, "back", state, assets, false);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      backTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;
      backTex.anisotropy = 8;
      frontTex.needsUpdate = true;
      backTex.needsUpdate = true;
      (materials[2] as THREE.MeshStandardMaterial).color.set(
        shade(state.primaryColor, -32),
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Canvas
      camera={{ position: [1.35, 0.18, 4.4], fov: 40 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 2]}
      shadows
    >
      <color attach="background" args={["#ecebe7"]} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[3.5, 4.5, 6]} intensity={1.35} castShadow />
      <directionalLight position={[-4.5, 1.5, 2]} intensity={0.55} />
      <directionalLight position={[0, 2, -5]} intensity={0.6} />
      <Jersey geo={geo} materials={materials} showBack={showBack} />
      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.28}
        blur={2.6}
        scale={6}
        far={2.4}
      />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.4}
        maxDistance={6}
        minAzimuthAngle={-Math.PI * 0.34}
        maxAzimuthAngle={Math.PI * 0.34}
        minPolarAngle={Math.PI * 0.34}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  );
}
