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
import type {
  Mesh,
  Group,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from 'three';
import CartoucheOrbit from './scene/CartoucheOrbit';
import CameraRig from './scene/CameraRig';
import DynamicPostFX from './scene/DynamicPostFX';
import { useHubStore } from '@/store/hub';

// === Armillary halo system ===

function HaloA() {
  // Front-facing main ring (largest, iridescent)
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[2.55, 0.04, 16, 128]} />
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
      <torusGeometry args={[2.22, 0.018, 10, 96]} />
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
      <torusGeometry args={[1.95, 0.013, 8, 96]} />
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

function LogoDisk() {
  const matRef = useRef<MeshPhysicalMaterial>(null);
  const tex = useTexture('/logo.png');

  useEffect(() => {
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }
  }, [tex]);

  return (
    <mesh>
      <circleGeometry args={[1.75, 128]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#ffffff"
        metalness={0.55}
        roughness={0.28}
        clearcoat={1}
        clearcoatRoughness={0.12}
        envMapIntensity={1.5}
        transparent
      />
    </mesh>
  );
}

function LogoBackplate() {
  // Dark chromed disk behind the logo with engraved concentric chrome rings
  return (
    <group position={[0, 0, -0.06]}>
      <mesh>
        <circleGeometry args={[1.92, 96]} />
        <meshPhysicalMaterial
          color="#13111A"
          metalness={0.9}
          roughness={0.4}
          clearcoat={0.6}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Engraved concentric chrome rings on the backplate */}
      {[1.86, 1.82, 1.78].map((r, i) => (
        <mesh key={i} position={[0, 0, 0.001 + i * 0.001]}>
          <torusGeometry args={[r, 0.004, 6, 64]} />
          <meshStandardMaterial
            color="#E8E6EC"
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function Relic() {
  const groupRef = useRef<Group>(null);
  const mode = useHubStore((s) => s.mode);
  const { mouse } = useThree();
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion.current) {
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
    const scaleLerp = reducedMotion.current ? 0.015 : 0.05;
    const s = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      scaleLerp,
    );
    groupRef.current.scale.setScalar(s);

    const targetOpacity = mode === 'project' ? 0.25 : 1;
    const opacityLerp = reducedMotion.current ? 0.015 : 0.05;
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
      <Float
        speed={reducedMotion.current ? 0 : 0.85}
        rotationIntensity={0.15}
        floatIntensity={0.55}
      >
        <HaloA />
        <MidRing />
        <InnerRing />
        <LogoBackplate />
        <LogoDisk />
      </Float>
    </group>
  );
}

export default function HubScene({
  showCartouches = true,
}: {
  showCartouches?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      performance={{ min: 0.5 }}
    >
      <fog attach="fog" args={['#08070C', 3.6, 11]} />

      <ambientLight intensity={0.2} color="#F4D8E2" />
      <pointLight position={[5, 4, 5]} intensity={2} color="#FF2D9C" />
      <pointLight position={[-5, -2, 3]} intensity={0.55} color="#00F0FF" />
      <pointLight position={[0, 6, -4]} intensity={1.3} color="#F4D8E2" />
      <pointLight position={[0, -3, 4]} intensity={0.5} color="#E8E6EC" />
      <pointLight position={[2.5, 0, 3]} intensity={0.65} color="#FFB6CB" />

      <Suspense fallback={null}>
        <Relic />
        {showCartouches && <CartoucheOrbit />}
      </Suspense>

      {/* Pearl pink — main dense field */}
      <Sparkles
        count={200}
        scale={11}
        size={2.8}
        speed={0.22}
        color="#F4D8E2"
        opacity={0.8}
      />
      {/* Soft pink mist — broad and slow */}
      <Sparkles
        count={90}
        scale={14}
        size={3.6}
        speed={0.1}
        color="#FFB6CB"
        opacity={0.32}
      />
      {/* Magenta acid — closer, faster, denser */}
      <Sparkles
        count={110}
        scale={7}
        size={1.8}
        speed={0.45}
        color="#FF2D9C"
        opacity={0.42}
      />
      {/* Cyan glitch — accent only, recedes */}
      <Sparkles
        count={28}
        scale={5}
        size={1.4}
        speed={0.5}
        color="#00F0FF"
        opacity={0.22}
      />
      {/* Tight aura around the relic, pearl */}
      <Sparkles
        count={80}
        scale={[5, 4, 2.5]}
        position={[0, 0, -1.2]}
        size={2.2}
        speed={0.35}
        color="#F4D8E2"
        opacity={0.6}
      />

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
