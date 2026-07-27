'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  Sparkles,
  useTexture,
} from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Mesh, Group, MeshStandardMaterial } from 'three';
import CartoucheOrbit from './scene/CartoucheOrbit';
import CameraRig from './scene/CameraRig';
import DynamicPostFX from './scene/DynamicPostFX';
import Fireflies from './scene/Fireflies';
import { useHubStore } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useViewportScale } from '@/lib/useViewportScale';

// === Armillary halo system ===

function HaloA() {
  // Front-facing main ring (largest, iridescent)
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[2.8, 0.045, 16, 160]} />
      <meshPhysicalMaterial
        color="#E8E6EC"
        metalness={1}
        roughness={0.04}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={0.8}
        iridescenceIOR={1.85}
        iridescenceThicknessRange={[120, 720]}
        envMapIntensity={1.9}
      />
    </mesh>
  );
}

function MidRing() {
  // Concentric front-facing ring between outer halo and inner ring
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.09;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.32]}>
      <torusGeometry args={[2.1, 0.018, 10, 96]} />
      <meshPhysicalMaterial
        color="#F4D8E2"
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.08}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function InnerRing() {
  const ref = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) ref.current.rotation.z -= dt * 0.16;
    if (matRef.current) {
      // Subtle breathing pulse — pearl emissive desynced from MidRing
      matRef.current.emissiveIntensity =
        0.08 + Math.sin(clock.elapsedTime * 0.55) * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.18]}>
      <torusGeometry args={[1.84, 0.013, 8, 96]} />
      <meshStandardMaterial
        ref={matRef}
        color="#F4D8E2"
        emissive="#F4D8E2"
        emissiveIntensity={0.08}
        metalness={1}
        roughness={0.08}
        envMapIntensity={2.4}
      />
    </mesh>
  );
}

function LogoBackplate() {
  // Un seul pin propre : corps sombre légèrement bombé + un liseré chromé au
  // bord (plus de disques empilés ni d'anneaux gravés multiples).
  return (
    <group position={[0, 0, -0.05]}>
      {/* Corps du pin */}
      <mesh>
        <circleGeometry args={[1.72, 96]} />
        <meshPhysicalMaterial
          color="#13111A"
          metalness={0.92}
          roughness={0.33}
          clearcoat={0.85}
          clearcoatRoughness={0.22}
          envMapIntensity={1.05}
        />
      </mesh>
      {/* Liseré chromé unique (rim du pin) */}
      <mesh position={[0, 0, 0.012]}>
        <torusGeometry args={[1.68, 0.022, 16, 200]} />
        <meshStandardMaterial
          color="#E8E6EC"
          metalness={1}
          roughness={0.11}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
}

function ShowreelDisk() {
  // Affiche du showreel posée sur le pin, à la place de l'ancien logo. Plus
  // de révélation au survol : le visuel est visible en permanence.
  const tex = useTexture('/showreel-poster.webp');

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    // Cadrage « cover » : la source est en 3:2 et le disque est carré en UV,
    // on rogne la largeur et on recentre pour ne pas écraser l'image.
    const img = tex.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) {
      const aspect = img.width / img.height;
      if (aspect > 1) {
        tex.repeat.set(1 / aspect, 1);
        tex.offset.set((1 - 1 / aspect) / 2, 0);
      } else {
        tex.repeat.set(1, aspect);
        tex.offset.set(0, (1 - aspect) / 2);
      }
      tex.needsUpdate = true;
    }
  }, [tex]);

  return (
    <mesh position={[0, 0, 0.005]}>
      <circleGeometry args={[1.6, 128]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent />
    </mesh>
  );
}

function Relic() {
  const groupRef = useRef<Group>(null);
  const mode = useHubStore((s) => s.mode);
  const { mouse } = useThree();
  const { hubScale } = useViewportScale();
  const reducedMotion = usePrefersReducedMotion();

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.18,
        0.045,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.12,
        0.045,
      );
    }

    const targetScale = mode === 'project' ? 0.55 : 1;
    const scaleLerp = reducedMotion ? 0.015 : 0.05;
    const s = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      scaleLerp,
    );
    groupRef.current.scale.setScalar(s);

    const targetOpacity = mode === 'project' ? 0.25 : 1;
    const opacityLerp = reducedMotion ? 0.015 : 0.05;
    groupRef.current.traverse((obj) => {
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
    <group ref={groupRef} position={[0, 0, -1.2]}>
      <group scale={hubScale}>
        <Float
          speed={reducedMotion ? 0 : 0.85}
          rotationIntensity={0.15}
          floatIntensity={0.55}
        >
          {/* Le pin porte l'affiche du showreel à la place du logo. */}
          <HaloA />
          <MidRing />
          <InnerRing />
          <LogoBackplate />
          <ShowreelDisk />
        </Float>
      </group>
    </group>
  );
}

export default function HubScene({
  showCartouches = true,
}: {
  showCartouches?: boolean;
}) {
  const tier = usePerformanceTier();
  const budget = tierBudget[tier];
  const sparklesCount1 = Math.max(1, Math.round(140 * budget.sparkles));
  const sparklesCount2 = Math.max(1, Math.round(70 * budget.sparkles));
  const sparklesCount3 = Math.max(1, Math.round(50 * budget.sparkles));
  const fireflies1 = Math.max(0, Math.round(26 * budget.fireflies));
  const fireflies2 = Math.max(0, Math.round(14 * budget.fireflies));
  const fireflies3 = Math.max(0, Math.round(8 * budget.fireflies));
  const { cameraZ, orbitRadius, cartoucheScale, layout } = useViewportScale();

  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      dpr={budget.dpr as [number, number]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
        stencil: false,
        depth: true,
      }}
      performance={{ min: 0.5 }}
      onPointerMissed={() => {
        const { activeId, setMode } = useHubStore.getState();
        if (activeId) setMode('hub');
      }}
    >
      <fog attach="fog" args={['#08070C', 3.6, 11]} />

      <ambientLight intensity={0.45} color="#F4D8E2" />
      <pointLight position={[5, 4, 5]} intensity={1.6} color="#FF2D9C" />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color="#00F0FF" />
      <pointLight position={[0, 6, -4]} intensity={1.2} color="#F4D8E2" />
      <pointLight position={[0, -3, 4]} intensity={0.45} color="#E8E6EC" />
      <pointLight position={[2.5, 0, 3]} intensity={0.6} color="#FFB6CB" />

      <Suspense fallback={null}>
        <Relic />
        {showCartouches && (
          <CartoucheOrbit
            orbitRadius={orbitRadius}
            cartoucheScale={cartoucheScale}
            layout={layout}
          />
        )}
      </Suspense>

      {/* Pearl mist — broad ambient field, very slow drift */}
      {budget.sparkles > 0 && (
        <>
          <Sparkles
            count={sparklesCount1}
            scale={13}
            size={2.4}
            speed={0.12}
            color="#F4D8E2"
            opacity={0.55}
          />
          {/* Soft pink atmospheric haze */}
          <Sparkles
            count={sparklesCount2}
            scale={15}
            size={3.4}
            speed={0.07}
            color="#FFB6CB"
            opacity={0.28}
          />
          {/* Magenta accent dust */}
          <Sparkles
            count={sparklesCount3}
            scale={7}
            size={1.5}
            speed={0.3}
            color="#FF2D9C"
            opacity={0.32}
          />
        </>
      )}

      {/* Fireflies — slow blinking + lazy drift, the "alive" element */}
      {budget.fireflies > 0 && (
        <>
          {fireflies1 > 0 && (
            <Fireflies
              count={fireflies1}
              color="#F4D8E2"
              range={[10, 6, 5]}
              centerZ={-0.5}
              size={120}
            />
          )}
          {fireflies2 > 0 && (
            <Fireflies
              count={fireflies2}
              color="#FFB6CB"
              range={[12, 7, 6]}
              centerZ={-1}
              size={150}
            />
          )}
          {fireflies3 > 0 && (
            <Fireflies
              count={fireflies3}
              color="#FF6FB0"
              range={[8, 5, 4]}
              centerZ={-0.3}
              size={180}
            />
          )}
        </>
      )}

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      <CameraRig />
      <DynamicPostFX />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
