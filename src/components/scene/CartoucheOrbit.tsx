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

const ORBIT_RADIUS = 2.3;
const ORBIT_TILT = 0.4;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
const ACTIVE_TARGET = new THREE.Vector3(0, 0.1, 1.5);
const ACTIVE_LOOK = new THREE.Vector3(0, 0.1, 4.6);
const LOOK_AT = new THREE.Vector3(0, 0, 1.2);

function LensFlare({ accent }: { accent: string }) {
  // Lens flare attached to the cartouche, fades in on hover. Behind the card
  // so the chrome backplate occludes the inner part — the halo only spills
  // past the card edges, additively glowing through the bloom pass.
  const haloMatRef = useRef<MeshBasicMaterial>(null);
  const streakMatRef = useRef<MeshBasicMaterial>(null);
  const auxStreakRef = useRef<MeshBasicMaterial>(null);

  return (
    <group position={[0, 0, -0.08]}>
      {/* Soft circular halo */}
      <mesh>
        <circleGeometry args={[1.3, 64]} />
        <meshBasicMaterial
          ref={haloMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Anamorphic horizontal streak */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[3.6, 0.07]} />
        <meshBasicMaterial
          ref={streakMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Diagonal cross streak */}
      <mesh position={[0, 0, 0.002]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[2.4, 0.04]} />
        <meshBasicMaterial
          ref={auxStreakRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <FlareDriver
        haloMatRef={haloMatRef}
        streakMatRef={streakMatRef}
        auxStreakRef={auxStreakRef}
        accent={accent}
      />
    </group>
  );
}

function FlareDriver({
  haloMatRef,
  streakMatRef,
  auxStreakRef,
  accent,
}: {
  haloMatRef: React.RefObject<MeshBasicMaterial | null>;
  streakMatRef: React.RefObject<MeshBasicMaterial | null>;
  auxStreakRef: React.RefObject<MeshBasicMaterial | null>;
  accent: string;
}) {
  useFrame(({ clock }) => {
    const { hoveredId, activeId } = useHubStore.getState();
    // Light up only when the cartouche is hovered AND no project is active.
    // We resolve "this cartouche" by looking up the accent of the hovered
    // project — cheaper than threading id through, and accents are unique.
    const hovered = hoveredId
      ? projects.find((p) => p.id === hoveredId)
      : null;
    const isLit = !activeId && hovered?.accent === accent;

    const target = isLit ? 1 : 0;
    // Subtle breathing on the lit state so the flare feels alive
    const breath = isLit
      ? 0.85 + Math.sin(clock.elapsedTime * 2.4) * 0.15
      : 0;

    if (haloMatRef.current) {
      haloMatRef.current.opacity = THREE.MathUtils.lerp(
        haloMatRef.current.opacity,
        target * 0.55 * breath,
        0.12,
      );
    }
    if (streakMatRef.current) {
      streakMatRef.current.opacity = THREE.MathUtils.lerp(
        streakMatRef.current.opacity,
        target * 0.65 * breath,
        0.12,
      );
    }
    if (auxStreakRef.current) {
      auxStreakRef.current.opacity = THREE.MathUtils.lerp(
        auxStreakRef.current.opacity,
        target * 0.4 * breath,
        0.12,
      );
    }
  });

  return null;
}

function Cartouche({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const accentMatRef = useRef<MeshStandardMaterial>(null);
  const chromeMatRef = useRef<MeshPhysicalMaterial>(null);
  const gemMatRef = useRef<MeshStandardMaterial>(null);
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
    if (isActive) {
      groupRef.current.position.lerp(ACTIVE_TARGET, activeLerp);
      groupRef.current.lookAt(ACTIVE_LOOK);
    } else {
      const angle = angleOffset + clock.elapsedTime * ORBIT_SPEED;
      orbitTarget.current.set(
        Math.cos(angle) * ORBIT_RADIUS,
        Math.sin(angle) * ORBIT_RADIUS * ORBIT_TILT,
        ORBIT_CENTER_Z + Math.sin(angle * 1.4) * 0.45,
      );
      groupRef.current.position.lerp(orbitTarget.current, positionLerp);
      groupRef.current.lookAt(LOOK_AT);
    }

    const targetScale = isActive ? 1.5 : isFocused ? 1.18 : 0.95;
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

    // Breathing pulse on the gem (subtle, desynced per cartouche)
    if (gemMatRef.current && !reducedMotion.current) {
      const base = isFocused || isActive ? 1.9 : 1.4;
      gemMatRef.current.emissiveIntensity =
        base + Math.sin(clock.elapsedTime * 1.4 + breathPhase) * 0.35;
    }

    const targetOpacity = isDimmed ? 0.05 : isOffstage ? 0.4 : 1;
    const opacityLerp = reducedMotion.current ? 0.015 : 0.08;
    innerRef.current.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as MeshStandardMaterial;
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
  });

  return (
    <group ref={groupRef} position={[0, 0, FLY_IN_OFFSET_Z]}>
      <Float
        speed={reducedMotion.current ? 0 : 0.85}
        rotationIntensity={0.05}
        floatIntensity={0.2}
      >
        <LensFlare accent={project.accent} />
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

export default function CartoucheOrbit() {
  return (
    <group>
      {projects.map((p, i) => (
        <Cartouche key={p.id} project={p} index={i} total={projects.length} />
      ))}
    </group>
  );
}
