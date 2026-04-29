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
import { useHubStore } from '@/store/hub';

function OuterHalo() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.06;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[1.7, 0.035, 32, 220]} />
      <meshStandardMaterial
        color="#E8E6EC"
        metalness={1}
        roughness={0.04}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}

function InnerRing() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z -= dt * 0.13;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.2]}>
      <torusGeometry args={[1.32, 0.012, 16, 180]} />
      <meshStandardMaterial
        color="#F4D8E2"
        metalness={1}
        roughness={0.1}
        envMapIntensity={2.2}
      />
    </mesh>
  );
}

function LogoDisk() {
  const matRef = useRef<MeshStandardMaterial>(null);
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
      <circleGeometry args={[1.18, 96]} />
      <meshStandardMaterial
        ref={matRef}
        color="#ffffff"
        metalness={0.55}
        roughness={0.32}
        envMapIntensity={1.1}
        transparent
      />
    </mesh>
  );
}

function BackdropOrb() {
  return (
    <mesh position={[0, 0, -2.2]}>
      <sphereGeometry args={[1.1, 48, 48]} />
      <meshStandardMaterial
        color="#FF2D9C"
        emissive="#FF2D9C"
        emissiveIntensity={0.45}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function Relic() {
  const groupRef = useRef<Group>(null);
  const mode = useHubStore((s) => s.mode);
  const { mouse } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
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

    const targetScale = mode === 'project' ? 0.55 : 1;
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05);
    groupRef.current.scale.setScalar(s);

    const targetOpacity = mode === 'project' ? 0.25 : 1;
    groupRef.current.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && 'opacity' in mat) {
          mat.transparent = true;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      <Float speed={0.85} rotationIntensity={0.15} floatIntensity={0.55}>
        <OuterHalo />
        <InnerRing />
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
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={['#08070C']} />
      <fog attach="fog" args={['#08070C', 3.6, 11]} />

      <ambientLight intensity={0.18} />
      <pointLight position={[5, 4, 5]} intensity={1.5} color="#FF2D9C" />
      <pointLight position={[-5, -2, 3]} intensity={1} color="#00F0FF" />
      <pointLight position={[0, 6, -4]} intensity={0.55} color="#F4D8E2" />
      <pointLight position={[0, -3, 4]} intensity={0.4} color="#E8E6EC" />

      <Suspense fallback={null}>
        <BackdropOrb />
        <Relic />
        {showCartouches && <CartoucheOrbit />}
      </Suspense>

      <Sparkles
        count={140}
        scale={10}
        size={2.6}
        speed={0.22}
        color="#F4D8E2"
        opacity={0.75}
      />
      <Sparkles
        count={70}
        scale={6}
        size={1.6}
        speed={0.45}
        color="#00F0FF"
        opacity={0.35}
      />
      <Sparkles
        count={40}
        scale={5}
        size={1.4}
        speed={0.55}
        color="#FF2D9C"
        opacity={0.32}
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
