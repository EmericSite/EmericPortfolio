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
import Fireflies from './scene/Fireflies';
import { useHubStore } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
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
      matRef.current.emissiveMap = tex;
      matRef.current.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          /* glsl */ `
          #include <map_fragment>
          // Boost saturation + contrast + vibrance on the logo texture
          {
            vec3 _c = diffuseColor.rgb;
            float _luma = dot(_c, vec3(0.299, 0.587, 0.114));
            // Vibrance: saturate less aggressively for already-saturated pixels
            float _maxC = max(max(_c.r, _c.g), _c.b);
            float _minC = min(min(_c.r, _c.g), _c.b);
            float _sat = _maxC - _minC;
            float _vibrance = 0.55 * (1.0 - _sat);
            _c = mix(vec3(_luma), _c, 1.35 + _vibrance);
            // Contrast around mid grey
            _c = (_c - 0.5) * 1.22 + 0.5;
            diffuseColor.rgb = clamp(_c, 0.0, 1.0);
          }
          `,
        );
      };
      matRef.current.needsUpdate = true;
    }
  }, [tex]);

  return (
    <mesh>
      <circleGeometry args={[1.75, 128]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.35}
        metalness={0.2}
        roughness={0.45}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={0.9}
        transparent
        toneMapped={false}
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
  const { hubScale } = useViewportScale();
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
      <group scale={hubScale}>
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

      <ambientLight intensity={0.2} color="#F4D8E2" />
      <pointLight position={[5, 4, 5]} intensity={2} color="#FF2D9C" />
      <pointLight position={[-5, -2, 3]} intensity={0.55} color="#00F0FF" />
      <pointLight position={[0, 6, -4]} intensity={1.3} color="#F4D8E2" />
      <pointLight position={[0, -3, 4]} intensity={0.5} color="#E8E6EC" />
      <pointLight position={[2.5, 0, 3]} intensity={0.65} color="#FFB6CB" />

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
