'use client';

import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text, useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from 'three';
import { projects, type Project } from '@/data/projects';
import { useHubStore } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import type { CartoucheLayout } from '@/lib/useViewportScale';

const PROJECT_BY_ID = new Map<string, Project>(projects.map((p) => [p.id, p]));

const ORBIT_TILT = 0.4;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
const ACTIVE_TARGET = new THREE.Vector3(0, 0.1, 1.5);
const ACTIVE_LOOK = new THREE.Vector3(0, 0.1, 4.6);
const LOOK_AT = new THREE.Vector3(0, 0, 1.2);

function LensFlare({ accent }: { accent: string }) {
  // Stacked scanlines that sweep the card vertically + glitchy effects.
  // No halo, no middle streak; chrome contour glow handled in parent.
  const scanARef = useRef<Mesh>(null);
  const scanAMatRef = useRef<MeshBasicMaterial>(null);
  const scanBRef = useRef<Mesh>(null);
  const scanBMatRef = useRef<MeshBasicMaterial>(null);
  const scanCRef = useRef<Mesh>(null);
  const scanCMatRef = useRef<MeshBasicMaterial>(null);

  return (
    <group position={[0, 0, 0.045]}>
      {/* Primary thick scanline — fast sweep */}
      <mesh ref={scanARef}>
        <planeGeometry args={[0.82, 0.012]} />
        <meshBasicMaterial
          ref={scanAMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Secondary thinner scanline — slower, phase-offset */}
      <mesh ref={scanBRef} position={[0, 0, 0.001]}>
        <planeGeometry args={[0.82, 0.005]} />
        <meshBasicMaterial
          ref={scanBMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Tertiary very-thin glitch line — fast erratic */}
      <mesh ref={scanCRef} position={[0, 0, 0.002]}>
        <planeGeometry args={[0.82, 0.003]} />
        <meshBasicMaterial
          ref={scanCMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <FlareDriver
        scanARef={scanARef}
        scanAMatRef={scanAMatRef}
        scanBRef={scanBRef}
        scanBMatRef={scanBMatRef}
        scanCRef={scanCRef}
        scanCMatRef={scanCMatRef}
        accent={accent}
      />
    </group>
  );
}

function FlareDriver({
  scanARef,
  scanAMatRef,
  scanBRef,
  scanBMatRef,
  scanCRef,
  scanCMatRef,
  accent,
}: {
  scanARef: React.RefObject<Mesh | null>;
  scanAMatRef: React.RefObject<MeshBasicMaterial | null>;
  scanBRef: React.RefObject<Mesh | null>;
  scanBMatRef: React.RefObject<MeshBasicMaterial | null>;
  scanCRef: React.RefObject<Mesh | null>;
  scanCMatRef: React.RefObject<MeshBasicMaterial | null>;
  accent: string;
}) {
  useFrame(({ clock }) => {
    const { hoveredId, activeId } = useHubStore.getState();
    const hovered = hoveredId ? PROJECT_BY_ID.get(hoveredId) : null;
    const isLit = !activeId && hovered?.accent === accent;
    const t = clock.elapsedTime;

    // Primary scanline — bottom→top sweep every ~1.4s when lit
    if (scanAMatRef.current && scanARef.current) {
      const cycle = ((t * 0.7) % 1) * 1.22 - 0.61;
      scanARef.current.position.y = isLit ? cycle : -2;
      scanAMatRef.current.opacity = THREE.MathUtils.lerp(
        scanAMatRef.current.opacity,
        isLit ? 0.85 : 0,
        0.25,
      );
    }

    // Secondary scanline — slower (~3.5s), phase-offset by 0.5
    if (scanBMatRef.current && scanBRef.current) {
      const cycle = ((t * 0.28 + 0.5) % 1) * 1.22 - 0.61;
      scanBRef.current.position.y = isLit ? cycle : -2;
      scanBMatRef.current.opacity = THREE.MathUtils.lerp(
        scanBMatRef.current.opacity,
        isLit ? 0.5 : 0,
        0.25,
      );
    }

    // Tertiary glitch line — erratic jumps, white core, occasional brief flash
    if (scanCMatRef.current && scanCRef.current) {
      // Random-ish vertical position via two desynced sins
      const jumpY = Math.sin(t * 1.7 + Math.sin(t * 0.4) * 5) * 0.55;
      // Visibility flickers — only flashes briefly, then hides
      const flashWindow = Math.sin(t * 5.3) > 0.7 ? 1 : 0;
      scanCRef.current.position.y = isLit ? jumpY : -2;
      scanCMatRef.current.opacity = THREE.MathUtils.lerp(
        scanCMatRef.current.opacity,
        isLit ? 0.95 * flashWindow : 0,
        0.55,
      );
    }
  });

  return null;
}

function Cartouche({
  project,
  index,
  total,
  hoverFXEnabled,
  orbitRadius,
  cartoucheScale,
  layout,
}: {
  project: Project;
  index: number;
  total: number;
  hoverFXEnabled: boolean;
  orbitRadius: number;
  cartoucheScale: number;
  layout: CartoucheLayout;
}) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const accentMatRef = useRef<MeshStandardMaterial>(null);
  const chromeMatRef = useRef<MeshPhysicalMaterial>(null);
  const gemMatRef = useRef<MeshStandardMaterial>(null);
  const cachedMats = useRef<THREE.Material[]>([]);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Fly-in: cartouches start far behind the camera (Z negative) and lerp to
  // their orbital position. Each one starts a bit further back than the next
  // so they arrive staggered.
  const FLY_IN_OFFSET_Z = -8 - index * 4;
  const breathPhase = (index / total) * Math.PI * 2;

  const setHovered = useHubStore((s) => s.setHovered);
  const setActive = useHubStore((s) => s.setActive);

  const angleOffset = (index / total) * Math.PI * 2;
  const orbitTarget = useRef(new THREE.Vector3());

  // Load poster texture and apply imperatively (avoids RSC serialization)
  const tex = useTexture(project.posterUrl);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    if (accentMatRef.current) {
      accentMatRef.current.map = tex;
      accentMatRef.current.needsUpdate = true;
    }
  }, [tex]);

  // Cache materials once after mount so per-frame updates don't traverse the tree.
  useEffect(() => {
    const mats: THREE.Material[] = [];
    innerRef.current?.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) {
          for (const sub of mat) mats.push(sub);
        } else {
          mats.push(mat);
        }
      }
    });
    cachedMats.current = mats;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !innerRef.current) return;

    const { mode, hoveredId, activeId, scrollIndex } = useHubStore.getState();
    const isActive = activeId === project.id;
    const isHovered = hoveredId === project.id;
    const isFocused =
      isHovered ||
      ((mode === 'hub' || mode === 'hover') && scrollIndex === index);
    const isDimmed = activeId !== null && !isActive;
    const isOffstage = mode === 'about' || mode === 'contact';

    const positionLerp = reducedMotion.current ? 0.015 : 0.08;
    const activeLerp = reducedMotion.current ? 0.015 : 0.06;

    // Compute wrapped stack offset (used both for positioning and scaling)
    let stackOffset = index - scrollIndex;
    if (stackOffset > total / 2) stackOffset -= total;
    if (stackOffset < -total / 2) stackOffset += total;
    const isStackFront = layout === 'stack' && stackOffset === 0;

    if (isActive) {
      groupRef.current.position.lerp(ACTIVE_TARGET, activeLerp);
      groupRef.current.lookAt(ACTIVE_LOOK);
    } else if (layout === 'stack') {
      const sign = stackOffset === 0 ? 0 : Math.sign(stackOffset);
      const abs = Math.abs(stackOffset);
      orbitTarget.current.set(
        sign * (0.5 + (abs - 1) * 0.18),
        -abs * 0.05,
        ORBIT_CENTER_Z + (isStackFront ? 0.4 : -0.35 * abs),
      );
      groupRef.current.position.lerp(orbitTarget.current, positionLerp);
      groupRef.current.lookAt(LOOK_AT);
    } else {
      const angle = angleOffset + clock.elapsedTime * ORBIT_SPEED;
      orbitTarget.current.set(
        Math.cos(angle) * orbitRadius,
        Math.sin(angle) * orbitRadius * ORBIT_TILT,
        ORBIT_CENTER_Z + Math.sin(angle * 1.4) * 0.45,
      );
      groupRef.current.position.lerp(orbitTarget.current, positionLerp);
      groupRef.current.lookAt(LOOK_AT);
    }

    const stackScale = isStackFront
      ? 1.4
      : Math.max(0.45, 0.85 - Math.abs(stackOffset) * 0.18);
    const targetScale = isActive
      ? 1.5
      : layout === 'stack'
        ? stackScale
        : isFocused
          ? 1.18
          : 0.95;
    const scaleLerp = reducedMotion.current ? 0.015 : 0.08;
    const s = THREE.MathUtils.lerp(
      innerRef.current.scale.x,
      targetScale,
      scaleLerp,
    );
    innerRef.current.scale.setScalar(s);

    // Active = clean image (no emissive wash). Focused = subtle accent halo.
    const targetEmissive = isActive ? 0.0 : isFocused ? 0.22 : 0.0;
    if (accentMatRef.current) {
      accentMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        accentMatRef.current.emissiveIntensity,
        targetEmissive,
        0.1,
      );
    }

    // Chrome contour shine on hover — emissive accent boost gives the
    // border a glowing edge in the project's color
    if (chromeMatRef.current) {
      const targetChromeEmissive = isHovered ? 0.55 : 0.0;
      chromeMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        chromeMatRef.current.emissiveIntensity,
        targetChromeEmissive,
        0.12,
      );
    }

    // Breathing pulse on the gem (subtle, desynced per cartouche)
    if (gemMatRef.current && !reducedMotion.current) {
      const base = isFocused || isActive ? 1.9 : 1.4;
      gemMatRef.current.emissiveIntensity =
        base + Math.sin(clock.elapsedTime * 1.4 + breathPhase) * 0.35;
    }

    const stackFade =
      layout === 'stack' && !isStackFront
        ? Math.max(0.25, 1 - Math.abs(stackOffset) * 0.3)
        : 1;
    const targetOpacity = isDimmed
      ? 0.05
      : isOffstage
        ? 0.4
        : stackFade;
    const opacityLerp = reducedMotion.current ? 0.015 : 0.08;
    const mats = cachedMats.current;
    for (let i = 0; i < mats.length; i++) {
      const mat = mats[i] as MeshStandardMaterial;
      if ('opacity' in mat) {
        const next = THREE.MathUtils.lerp(
          mat.opacity,
          targetOpacity,
          opacityLerp,
        );
        if (Math.abs(mat.opacity - next) > 0.001) {
          if (!mat.transparent) mat.transparent = true;
          mat.opacity = next;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, FLY_IN_OFFSET_Z]} scale={cartoucheScale}>
      <Float
        speed={reducedMotion.current ? 0 : 0.85}
        rotationIntensity={0.05}
        floatIntensity={0.2}
      >
        {hoverFXEnabled && <LensFlare accent={project.accent} />}
        <group
          ref={innerRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(project.id);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = '';
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActive(project.id);
          }}
        >
          {/* Chrome backplate */}
          <RoundedBox
            args={[0.92, 1.3, 0.05]}
            radius={0.06}
            smoothness={5}
            position={[0, 0, -0.025]}
          >
            <meshPhysicalMaterial
              ref={chromeMatRef}
              color="#E8E6EC"
              emissive={project.accent}
              emissiveIntensity={0}
              metalness={1}
              roughness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.06}
              iridescence={0.25}
              iridescenceIOR={1.7}
              iridescenceThicknessRange={[100, 600]}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </RoundedBox>

          {/* Corner rivets */}
          {(
            [
              [-0.4, 0.59],
              [0.4, 0.59],
              [-0.4, -0.59],
              [0.4, -0.59],
            ] as [number, number][]
          ).map(([rx, ry], i) => (
            <mesh key={`rivet-${i}`} position={[rx, ry, 0.005]}>
              <sphereGeometry args={[0.011, 14, 14]} />
              <meshStandardMaterial
                color="#E8E6EC"
                metalness={1}
                roughness={0.04}
                envMapIntensity={2.2}
                transparent
                opacity={1}
              />
            </mesh>
          ))}

          {/* Poster panel — accent body with project image as map */}
          <RoundedBox
            args={[0.84, 1.22, 0.04]}
            radius={0.05}
            smoothness={5}
            position={[0, 0, 0.01]}
          >
            <meshStandardMaterial
              ref={accentMatRef}
              color="#ffffff"
              emissive={project.accent}
              emissiveIntensity={0}
              metalness={0.05}
              roughness={0.6}
              transparent
              opacity={1}
            />
          </RoundedBox>

          {/* Top index chip */}
          <mesh position={[-0.3, 0.5, 0.038]}>
            <planeGeometry args={[0.14, 0.075]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
          <Text
            position={[-0.3, 0.5, 0.04]}
            fontSize={0.06}
            color="#E8E6EC"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {`0${index + 1}`}
          </Text>

          {/* Top year chip */}
          <mesh position={[0.3, 0.5, 0.038]}>
            <planeGeometry args={[0.18, 0.075]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
          <Text
            position={[0.3, 0.5, 0.04]}
            fontSize={0.05}
            color="#E8E6EC"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {project.year}
          </Text>

          {/* Bottom info banner — dark gradient overlay for legibility */}
          <mesh position={[0, -0.36, 0.038]}>
            <planeGeometry args={[0.84, 0.5]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.82}
              toneMapped={false}
            />
          </mesh>

          {/* Title in banner */}
          <Text
            position={[0, -0.22, 0.04]}
            fontSize={0.105}
            color="#F4D8E2"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.74}
            textAlign="center"
            lineHeight={1.0}
            letterSpacing={-0.005}
          >
            {project.shortTitle}
          </Text>

          {/* Tag in banner */}
          <Text
            position={[0, -0.4, 0.04]}
            fontSize={0.038}
            color="#B8B0BE"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.18}
          >
            {project.tag.toUpperCase()}
          </Text>

          {/* Bottom emblem — chrome ring with emissive accent gem */}
          <mesh position={[0, -0.55, 0.05]}>
            <torusGeometry args={[0.022, 0.005, 10, 28]} />
            <meshStandardMaterial
              color="#E8E6EC"
              metalness={1}
              roughness={0.06}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, -0.55, 0.05]}>
            <circleGeometry args={[0.012, 32]} />
            <meshStandardMaterial
              ref={gemMatRef}
              color={project.accent}
              emissive={project.accent}
              emissiveIntensity={1.6}
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function CartoucheOrbit({
  orbitRadius = 2.3,
  cartoucheScale = 1,
  layout = 'orbit',
}: {
  orbitRadius?: number;
  cartoucheScale?: number;
  layout?: CartoucheLayout;
} = {}) {
  const tier = usePerformanceTier();
  const hoverFXEnabled = tierBudget[tier].hoverFX;
  return (
    <group>
      {projects.map((p, i) => (
        <Cartouche
          key={p.id}
          project={p}
          index={i}
          total={projects.length}
          hoverFXEnabled={hoverFXEnabled}
          orbitRadius={orbitRadius}
          cartoucheScale={cartoucheScale}
          layout={layout}
        />
      ))}
    </group>
  );
}
