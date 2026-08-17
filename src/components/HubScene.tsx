// Emericfolio — created by Tomi-Tom, 2026
// The 3D hub itself: chrome halo, lighting and the carousel of project cartridges
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Float,
  useTexture,
} from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import type { Mesh, Group, MeshStandardMaterial } from 'three';
import CartoucheOrbit from './scene/CartoucheOrbit';
import CameraRig from './scene/CameraRig';
import DynamicPostFX from './scene/DynamicPostFX';
import SceneEnvironment from './scene/SceneEnvironment';
import { fadeOpacity, preparePosterTexture } from './scene/materials';
import { useCachedMaterials } from './scene/useCachedMaterials';
import { useHubStore } from '@/store/hub';
import { showreelPosterUrl } from '@/data/showreel';
import { palette } from '@/lib/palette';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useViewportScale } from '@/lib/useViewportScale';

// Outermost ring of the armillary halo.
function HaloA() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[2.8, 0.045, 16, 160]} />
      <meshPhysicalMaterial
        color={palette.chrome}
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
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.09;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.32]}>
      <torusGeometry args={[2.1, 0.018, 10, 96]} />
      <meshPhysicalMaterial
        color={palette.pearl}
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
      // Breathing pulse, kept out of sync with the other rings.
      matRef.current.emissiveIntensity =
        0.08 + Math.sin(clock.elapsedTime * 0.55) * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.18]}>
      <torusGeometry args={[1.84, 0.013, 8, 96]} />
      <meshStandardMaterial
        ref={matRef}
        color={palette.pearl}
        emissive={palette.pearl}
        emissiveIntensity={0.08}
        metalness={1}
        roughness={0.08}
        envMapIntensity={2.4}
      />
    </mesh>
  );
}

function LogoBackplate() {
  return (
    <group position={[0, 0, -0.05]}>
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
      <mesh position={[0, 0, 0.012]}>
        <torusGeometry args={[1.68, 0.022, 16, 200]} />
        <meshStandardMaterial
          color={palette.chrome}
          metalness={1}
          roughness={0.11}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
}

// Showreel poster laid on the pin.
function ShowreelDisk() {
  // The disc is square in UV space, so the long side of the poster is cropped.
  const tex = useTexture(showreelPosterUrl, (loaded) =>
    preparePosterTexture(loaded, 1),
  );

  return (
    <mesh position={[0, 0, 0.005]}>
      <circleGeometry args={[1.6, 128]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent />
    </mesh>
  );
}

function Relic() {
  const groupRef = useRef<Group>(null);
  const cachedMats = useCachedMaterials(groupRef);
  const mode = useHubStore((s) => s.mode);
  const { pointer } = useThree();
  const { hubScale } = useViewportScale();
  const reducedMotion = usePrefersReducedMotion();

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.18,
        0.045,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.12,
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
    fadeOpacity(cachedMats.current, targetOpacity, opacityLerp);
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      <group scale={hubScale}>
        <Float
          speed={reducedMotion ? 0 : 0.85}
          rotationIntensity={0.15}
          floatIntensity={0.55}
        >
          <HaloA />
          <MidRing />
          <InnerRing />
          <LogoBackplate />
          {/* The play button is a DOM overlay, see ShowreelPlayButton. */}
          <ShowreelDisk />
        </Float>
      </group>
    </group>
  );
}

export default function HubScene({ onGlError }: { onGlError?: () => void }) {
  const tier = usePerformanceTier();
  const budget = tierBudget[tier];
  const { cameraZ, orbitRadius, cartoucheScale, layout } = useViewportScale();

  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      dpr={budget.dpr}
      gl={(defaults) => {
        try {
          return new THREE.WebGLRenderer({
            ...defaults,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
            stencil: false,
            depth: true,
          });
        } catch (err) {
          // The probe in usePerformanceTier got a context, so the visitor was
          // routed to the 3D hub, but the real renderer still failed: out of
          // memory, or too many live contexts in the tab. Left alone this only
          // surfaces as an unhandled rejection, and the loader hangs to its cap
          // in front of a page that will never draw.
          console.error('[hub] WebGL renderer creation failed:', err);
          queueMicrotask(() => onGlError?.());
          throw err;
        }
      }}
      performance={{ min: 0.5 }}
      onPointerMissed={() => {
        const { activeId, setMode } = useHubStore.getState();
        if (activeId) setMode('hub');
      }}
    >
      <fog attach="fog" args={[palette.ink, 3.6, 11]} />

      <ambientLight intensity={0.45} color={palette.pearl} />
      <pointLight position={[5, 4, 5]} intensity={1.6} color={palette.magenta} />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color={palette.cyan} />
      <pointLight position={[0, 6, -4]} intensity={1.2} color={palette.pearl} />
      <pointLight position={[0, -3, 4]} intensity={0.45} color={palette.chrome} />
      <pointLight position={[2.5, 0, 3]} intensity={0.6} color="#FFB6CB" />

      <Suspense fallback={null}>
        <Relic />
        <CartoucheOrbit
          orbitRadius={orbitRadius}
          cartoucheScale={cartoucheScale}
          layout={layout}
        />
      </Suspense>

      <SceneEnvironment />

      <CameraRig />
      <DynamicPostFX />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
